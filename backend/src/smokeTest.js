
import fs from "fs";
import path from "path";
 
const CONFIG = {
  baseUrl: "http://localhost:5000", 
  poFilePath: "./samples/PO.pdf", 
  grnFilePath: "./samples/GRN.pdf",
  invoiceFilePath: "./samples/Invoice.pdf", 
  existingPoNumber: "CI4PO05788",
  skipUploads: true,
};
 
let passCount = 0;
let failCount = 0;
let token = null;
let uploadedPoNumber = null;
let uploadedDocId = null;
 
const log = (label, ok, detail = "") => {
  const icon = ok ? "PASS" : "FAIL";
  console.log(`[${icon}] ${label}${detail ? " - " + detail : ""}`);
  ok ? passCount++ : failCount++;
};
 
const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});
 
const step = async (label, fn) => {
  try {
    await fn();
  } catch (error) {
    log(label, false, `threw: ${error.message}`);
  }
};
 
const run = async () => {
  console.log(`\nRunning smoke test against ${CONFIG.baseUrl}\n`);
 
  // 1. Login
  await step("POST /auth/login", async () => {
    const res = await fetch(`${CONFIG.baseUrl}/auth/login`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    const ok = res.status === 200 && typeof body?.token === "string" && body.token.length > 0;
    log("POST /auth/login", ok, ok ? "token received" : `status ${res.status}, body: ${JSON.stringify(body)}`);
    if (ok) token = body.token;
  });
 
  if (!token) {
    console.log("\nNo token - stopping here. Fix /auth/login before continuing.\n");
    printSummary();
    return;
  }
 
  // 2. Protected route rejects missing auth
  await step("GET /documents without Authorization header is rejected", async () => {
    const res = await fetch(`${CONFIG.baseUrl}/documents`);
    const ok = res.status === 401 || res.status === 403;
    log(
      "Unauthenticated request rejected",
      ok,
      ok ? `status ${res.status} as expected` : `expected 401/403, got ${res.status}`
    );
  });
 
  // 3. Uploads
  if (!CONFIG.skipUploads) {
    const uploadOne = async (label, filePath, documentType) => {
      if (!fs.existsSync(filePath)) {
        log(label, false, `file not found at ${filePath} - update CONFIG or set skipUploads: true`);
        return null;
      }
 
      const fileBuffer = fs.readFileSync(filePath);
      const form = new FormData();
      form.append("documentType", documentType);
      form.append(
        "file",
        new Blob([fileBuffer], { type: "application/pdf" }),
        path.basename(filePath)
      );
 
      const res = await fetch(`${CONFIG.baseUrl}/documents/upload`, {
        method: "POST",
        headers: authHeaders(),
        body: form,
      });
 
      const body = await res.json().catch(() => ({}));
      const ok = res.status === 201 && body?.success && body?.data?.document?._id;
 
      log(label, ok, ok ? `document id ${body.data.document._id}` : `status ${res.status}, body: ${JSON.stringify(body).slice(0, 300)}`);
 
      return ok ? body.data.document : null;
    };
 
    await step("POST /documents/upload (po)", async () => {
      const doc = await uploadOne("Upload PO", CONFIG.poFilePath, "po");
      if (doc) {
        uploadedPoNumber = doc.poNumber;
        uploadedDocId = doc._id;
      }
    });
 
    await step("POST /documents/upload (grn)", async () => {
      await uploadOne("Upload GRN", CONFIG.grnFilePath, "grn");
    });
 
    await step("POST /documents/upload (invoice)", async () => {
      await uploadOne("Upload Invoice", CONFIG.invoiceFilePath, "invoice");
    });
  } else {
    uploadedPoNumber = CONFIG.existingPoNumber;
    log("Uploads skipped", Boolean(uploadedPoNumber), uploadedPoNumber ? `using existing poNumber ${uploadedPoNumber}` : "existingPoNumber not set in CONFIG");
  }
 
  if (!uploadedPoNumber) {
    console.log("\nNo poNumber available - stopping here.\n");
    printSummary();
    return;
  }
 
  // 4. GET /documents?type=&poNumber=
  await step("GET /documents?type=po&poNumber=...", async () => {
    const res = await fetch(
      `${CONFIG.baseUrl}/documents?type=po&poNumber=${encodeURIComponent(uploadedPoNumber)}`,
      { headers: authHeaders() }
    );
    const body = await res.json().catch(() => ({}));
    const ok = res.status === 200 && Array.isArray(body?.data) && body.data.length > 0;
    log("GET /documents (filtered)", ok, ok ? `${body.data.length} document(s)` : `status ${res.status}`);
  });
 
  await step("GET /documents (no filters, all types)", async () => {
    const res = await fetch(`${CONFIG.baseUrl}/documents`, { headers: authHeaders() });
    const body = await res.json().catch(() => ({}));
    const ok = res.status === 200 && Array.isArray(body?.data);
    log("GET /documents (unfiltered)", ok, ok ? `${body.data.length} document(s) total` : `status ${res.status}`);
  });
 
  // 5. GET /documents/:id
  if (uploadedDocId) {
    await step("GET /documents/:id", async () => {
      const res = await fetch(`${CONFIG.baseUrl}/documents/${uploadedDocId}`, { headers: authHeaders() });
      const body = await res.json().catch(() => ({}));
      const ok = res.status === 200 && body?.data?.document?._id === uploadedDocId;
      log("GET /documents/:id", ok, ok ? "document returned" : `status ${res.status}, body: ${JSON.stringify(body).slice(0, 300)}`);
    });
 
    // 6. GET /documents/:id/file
    await step("GET /documents/:id/file", async () => {
      const res = await fetch(`${CONFIG.baseUrl}/documents/${uploadedDocId}/file`, { headers: authHeaders() });
      const ok = res.status === 200 && (res.headers.get("content-type") || "").length > 0;
      log("GET /documents/:id/file", ok, ok ? `content-type: ${res.headers.get("content-type")}` : `status ${res.status}`);
    });
 
    // 7. GET /documents/:id for a bad id -> 404
    await step("GET /documents/:id with bogus id returns 404", async () => {
      const res = await fetch(`${CONFIG.baseUrl}/documents/000000000000000000000000`, {
        headers: authHeaders(),
      });
      const ok = res.status === 404;
      log("GET /documents/:id (not found)", ok, `status ${res.status}`);
    });
  }
 
  // 8. GET /match/:poNumber
  await step("GET /match/:poNumber", async () => {
    const res = await fetch(`${CONFIG.baseUrl}/match/${encodeURIComponent(uploadedPoNumber)}`, {
      headers: authHeaders(),
    });
    const body = await res.json().catch(() => ({}));
    const validStatuses = ["insufficient_documents", "mismatch", "partially_matched", "matched"];
    const ok = res.status === 200 && validStatuses.includes(body?.data?.status);
    log("GET /match/:poNumber", ok, ok ? `status: ${body.data.status}` : `status ${res.status}, body: ${JSON.stringify(body).slice(0, 300)}`);
  });
 
  // 9. GET /summary/:poNumber
  await step("GET /summary/:poNumber", async () => {
    const res = await fetch(`${CONFIG.baseUrl}/summary/${encodeURIComponent(uploadedPoNumber)}`, {
      headers: authHeaders(),
    });
    const body = await res.json().catch(() => ({}));
    const ok = res.status === 200 && Array.isArray(body?.data?.documents);
    log("GET /summary/:poNumber", ok, ok ? `${body.data.documents.length} row(s) incl. Current Status` : `status ${res.status}, body: ${JSON.stringify(body).slice(0, 300)}`);
  });
 
  // 10. SKU Master CRUD
  let createdSkuId = null;
 
  await step("POST /masters/sku", async () => {
    const res = await fetch(`${CONFIG.baseUrl}/masters/sku`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        skuErpCode: `SMOKETEST-${Date.now()}`,
        name: "Smoke Test SKU",
        agreedRate: 100,
        mrp: 120,
      }),
    });
    const body = await res.json().catch(() => ({}));
    const ok = res.status === 201 && body?.data?._id;
    log("POST /masters/sku", ok, ok ? `created ${body.data._id}` : `status ${res.status}, body: ${JSON.stringify(body).slice(0, 300)}`);
    if (ok) createdSkuId = body.data._id;
  });
 
  await step("GET /masters/sku", async () => {
    const res = await fetch(`${CONFIG.baseUrl}/masters/sku`, { headers: authHeaders() });
    const body = await res.json().catch(() => ({}));
    const ok = res.status === 200 && Array.isArray(body?.data);
    log("GET /masters/sku", ok, ok ? `${body.data.length} record(s)` : `status ${res.status}`);
  });
 
  if (createdSkuId) {
    await step("PATCH /masters/sku/:id", async () => {
      const res = await fetch(`${CONFIG.baseUrl}/masters/sku/${createdSkuId}`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ agreedRate: 110 }),
      });
      const body = await res.json().catch(() => ({}));
      const ok = res.status === 200 && body?.data?.agreedRate === 110;
      log("PATCH /masters/sku/:id", ok, ok ? "agreedRate updated" : `status ${res.status}, body: ${JSON.stringify(body).slice(0, 300)}`);
    });
 
    await step("DELETE /masters/sku/:id", async () => {
      const res = await fetch(`${CONFIG.baseUrl}/masters/sku/${createdSkuId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const ok = res.status === 200;
      log("DELETE /masters/sku/:id", ok, `status ${res.status}`);
    });
  }
 
  printSummary();
};
 
const printSummary = () => {
  console.log(`\n${passCount} passed, ${failCount} failed\n`);
  process.exitCode = failCount > 0 ? 1 : 0;
};
 
run();