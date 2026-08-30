import mongoose from "mongoose";
 
import PurchaseOrder from "../models/PurchaseOrder.model.js";
import Grn from "../models/Grn.model.js";
import Invoice from "../models/Invoice.model.js";
import SkuMaster from "../models/SkuMaster.model.js";
import MatchAudit from "../models/MatchAudit.model.js";
 
import { resolveSkuFromMasters } from "./skuResolution.service.js";
import { checkDuplicate } from "./duplicate.service.js";
 
const documentModelsByType = { po: PurchaseOrder, grn: Grn, invoice: Invoice };
 
const parseDocumentDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }
 
  if (dateValue instanceof Date) {
    return dateValue;
  }
 
  const normalizedDate = dateValue.trim();
 
  const match = normalizedDate.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
 
  if (match) {
    const [, day, month, year] = match;
 
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
 
  const parsedDate = new Date(normalizedDate);
 
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate;
  }
 
  return null;
};
 
const trimIfString = (value) => (typeof value === "string" ? value.trim() : value);
 
const normalizeKeyFields = (documentType, parsedData) => {
  const normalized = { ...parsedData, poNumber: trimIfString(parsedData.poNumber) };
 
  if (documentType === "grn") {
    normalized.grnNumber = trimIfString(parsedData.grnNumber);
  }
 
  if (documentType === "invoice") {
    normalized.invoiceNumber = trimIfString(parsedData.invoiceNumber);
  }
 
  normalized.items = (parsedData.items || []).map((item) => ({
    ...item,
    itemCode: trimIfString(item.itemCode),
  }));
 
  return normalized;
};
 
const resolveItemsWithSkuMaster = async (items) => {
  const skuMasters = await SkuMaster.find();
 
  return items.map((item) => {
    const resolvedSku = resolveSkuFromMasters(item.itemCode, skuMasters);
 
    return {
      ...item,
      skuMaster: resolvedSku ? resolvedSku._id : null,
    };
  });
};
 
const createUploadAudit = async ({
  poNumber,
  documentType,
  unmappedItemsCount,
  isDuplicate,
  duplicateReason,
}) => {
  const steps = [
    {
      step: "upload",
      status: "success",
      message: `${documentType.toUpperCase()} uploaded successfully`,
    },
    {
      step: "sku_mapping",
      status: unmappedItemsCount > 0 ? "warning" : "success",
      message:
        unmappedItemsCount > 0
          ? `${unmappedItemsCount} item(s) could not be mapped to SKU Master`
          : "All items mapped to SKU Master",
    },
    {
      step: "duplicate_check",
      status: isDuplicate ? "warning" : "success",
      message: isDuplicate ? duplicateReason : "No duplicate detected",
    },
    {
      step: "persistence",
      status: "success",
      message: "Document stored successfully",
    },
  ];
 
  return MatchAudit.create({ poNumber, steps });
};
 
const saveDocument = async ({ documentType, parsedData, filePath }) => {
  const normalizedKeyFields = normalizeKeyFields(documentType, parsedData);
 
  const resolvedItems = await resolveItemsWithSkuMaster(normalizedKeyFields.items);
 
  const unmappedItemsCount = resolvedItems.filter((item) => !item.skuMaster).length;
 
  const duplicateResult = await checkDuplicate(documentType, normalizedKeyFields);
 
  const normalizedParsedData = { ...normalizedKeyFields };
 
  switch (documentType) {
    case "po":
      normalizedParsedData.poDate = parseDocumentDate(parsedData.poDate);
      break;
 
    case "grn":
      normalizedParsedData.grnDate = parseDocumentDate(parsedData.grnDate);
      break;
 
    case "invoice":
      normalizedParsedData.invoiceDate = parseDocumentDate(parsedData.invoiceDate);
      break;
 
    default:
      throw new Error("Invalid document type");
  }
 
  const commonData = {
    ...normalizedParsedData,
    items: resolvedItems,
    rawParsed: parsedData,
    filePath,
    isDuplicate: duplicateResult.isDuplicate,
  };
 
  let document;
 
  switch (documentType) {
    case "po":
      document = await PurchaseOrder.create(commonData);
      break;
 
    case "grn":
      document = await Grn.create(commonData);
      break;
 
    case "invoice":
      document = await Invoice.create(commonData);
      break;
 
    default:
      throw new Error("Invalid document type");
  }
 
  const audit = await createUploadAudit({
    poNumber: normalizedParsedData.poNumber,
    documentType,
    unmappedItemsCount,
    isDuplicate: duplicateResult.isDuplicate,
    duplicateReason: duplicateResult.reason,
  });
 
  return {
    document,
    audit,
    duplicate: duplicateResult,
    unmappedItemsCount,
  };
};
 
/**
 * GET /documents/:id
 * GET /documents/:id/file
 */
const findDocumentById = async (id, type) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
 
  if (type) {
    const Model = documentModelsByType[type];
 
    if (!Model) {
      throw new Error("Invalid document type");
    }
 
    const document = await Model.findById(id);
 
    return document ? { document, documentType: type } : null;
  }
 
  for (const [documentType, Model] of Object.entries(documentModelsByType)) {
    const document = await Model.findById(id);
 
    if (document) {
      return { document, documentType };
    }
  }
 
  return null;
};
 
/**
 * GET /documents?type=&poNumber=
 */
const listDocuments = async ({ type, poNumber }) => {
  const filter = {};
 
  if (poNumber) {
    filter.poNumber = poNumber;
  }
 
  if (type) {
    const Model = documentModelsByType[type];
 
    if (!Model) {
      throw new Error("Invalid document type");
    }
 
    const documents = await Model.find(filter).sort({ createdAt: -1 });
 
    return documents.map((document) => ({ documentType: type, ...document.toObject() }));
  }
 
  const [pos, grns, invoices] = await Promise.all([
    PurchaseOrder.find(filter).sort({ createdAt: -1 }),
    Grn.find(filter).sort({ createdAt: -1 }),
    Invoice.find(filter).sort({ createdAt: -1 }),
  ]);
 
  return [
    ...pos.map((document) => ({ documentType: "po", ...document.toObject() })),
    ...grns.map((document) => ({ documentType: "grn", ...document.toObject() })),
    ...invoices.map((document) => ({ documentType: "invoice", ...document.toObject() })),
  ];
};
 
export {
  resolveItemsWithSkuMaster,
  createUploadAudit,
  saveDocument,
  findDocumentById,
  listDocuments,
  documentModelsByType,
};