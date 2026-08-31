"use client";
 
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateSkuMaster, useUpdateSkuMaster } from "@/hooks/useSkuMasters";
 
const emptyForm = {
  skuErpCode: "",
  name: "",
  aliases: "",
  eanCode: "",
  hsnCode: "",
  uom: "",
  agreedRate: "",
  mrp: "",
  priceTolerance: "0.05",
};
 
const toFormState = (sku) =>
  sku
    ? {
        skuErpCode: sku.skuErpCode || "",
        name: sku.name || "",
        aliases: (sku.aliases || []).join(", "),
        eanCode: sku.eanCode || "",
        hsnCode: sku.hsnCode || "",
        uom: sku.uom || "",
        agreedRate: sku.agreedRate ?? "",
        mrp: sku.mrp ?? "",
        priceTolerance: sku.priceTolerance ?? "0.05",
      }
    : emptyForm;
 
const FIELDS = [
  { name: "skuErpCode", label: "SKU ERP Code", required: true },
  { name: "name", label: "Name", required: true },
  { name: "aliases", label: "Aliases (comma-separated)" },
  { name: "eanCode", label: "EAN Code" },
  { name: "hsnCode", label: "HSN Code" },
  { name: "uom", label: "UOM" },
  { name: "agreedRate", label: "Agreed Rate", type: "number" },
  { name: "mrp", label: "MRP", type: "number" },
  { name: "priceTolerance", label: "Price Tolerance (fraction)", type: "number" },
];
 
/**
 * sku: existing SkuMaster to edit, or null/undefined to create a new one.
 * Redirects back to the list on success.
 */
export default function SkuMasterForm({ sku }) {
  const router = useRouter();
  const [form, setForm] = useState(() => toFormState(sku));
  const [validationError, setValidationError] = useState(null);
 
  const createMutation = useCreateSkuMaster();
  const updateMutation = useUpdateSkuMaster();
 
  const isEditing = Boolean(sku);
  const mutation = isEditing ? updateMutation : createMutation;
 
  useEffect(() => {
    setForm(toFormState(sku));
  }, [sku]);
 
  const handleChange = (name) => (event) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }));
  };
 
  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError(null);
 
    if (!form.skuErpCode.trim() || !form.name.trim()) {
      setValidationError("SKU ERP Code and Name are required.");
      return;
    }
 
    const payload = {
      skuErpCode: form.skuErpCode.trim(),
      name: form.name.trim(),
      aliases: form.aliases
        .split(",")
        .map((alias) => alias.trim())
        .filter(Boolean),
      eanCode: form.eanCode.trim() || null,
      hsnCode: form.hsnCode.trim() || null,
      uom: form.uom.trim() || null,
      agreedRate: form.agreedRate === "" ? null : Number(form.agreedRate),
      mrp: form.mrp === "" ? null : Number(form.mrp),
      priceTolerance: form.priceTolerance === "" ? 0.05 : Number(form.priceTolerance),
    };
 
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: sku._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push("/sku-master");
    } catch (error) {
      
    }
  };
 
  const backendErrors = mutation.error?.body?.errors;
  const errorMessage = validationError || backendErrors?.join(", ") || mutation.error?.message;
 
  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="text-lg font-semibold text-[var(--color-ink)]">
        {isEditing ? "Edit SKU Master" : "New SKU Master"}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        {isEditing
          ? "Update the catalogue record used to resolve this item across documents."
          : "Add a catalogue record so uploaded documents can resolve this item code."}
      </p>
 
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map((field) => (
            <div key={field.name} className={field.name === "aliases" ? "col-span-2" : ""}>
              <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                step={field.type === "number" ? "any" : undefined}
                value={form[field.name]}
                onChange={handleChange(field.name)}
                required={field.required}
                className="mt-1.5 w-full rounded-md border border-[var(--color-border-strong)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          ))}
        </div>
 
        {errorMessage && (
          <div
            className="mt-4 rounded-md px-3 py-2 text-sm"
            style={{ backgroundColor: "var(--color-status-mismatch-soft)", color: "var(--color-status-mismatch)" }}
            role="alert"
          >
            {errorMessage}
          </div>
        )}
 
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/sku-master")}
            className="rounded-md border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-page)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            {mutation.isPending ? "Saving..." : isEditing ? "Save changes" : "Create SKU"}
          </button>
        </div>
      </form>
    </div>
  );
}