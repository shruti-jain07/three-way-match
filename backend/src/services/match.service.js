import PurchaseOrder from "../models/PurchaseOrder.model.js";
import Grn from "../models/Grn.model.js";
import Invoice from "../models/Invoice.model.js";
import SkuMaster from "../models/SkuMaster.model.js";
import { resolveSkuFromMasters } from "./skuResolution.service.js";
 
const normalizeItemCode = (itemCode) => {
  if (!itemCode) return null;
 
  return String(itemCode).trim().toLowerCase().replace(/\s+/g, "");
};
 
const getMatchKey = (item) => {
  if (item.skuMaster) {
    return `sku:${item.skuMaster.toString()}`;
  }
 
  const normalizedCode = normalizeItemCode(item.itemCode);
 
  return normalizedCode ? `raw:${normalizedCode}` : null;
};
 
const aggregateDocumentItems = (items, quantityField) => {
  const aggregatedItems = new Map();
 
  for (const item of items) {
    const matchKey = getMatchKey(item);
 
    if (!matchKey) {
      continue;
    }
 
    if (!aggregatedItems.has(matchKey)) {
      aggregatedItems.set(matchKey, {
        matchKey,
        skuMaster: item.skuMaster || null,
        itemCode: item.itemCode || null,
        description: item.description || null,
        quantity: 0,
        unitRates: [],
        mrps: [],
        reasons: [],
      });
    }
 
    const aggregatedItem = aggregatedItems.get(matchKey);
 
    aggregatedItem.quantity += Number(item[quantityField] || 0);
 
    if (item.unitRate !== null && item.unitRate !== undefined) {
      aggregatedItem.unitRates.push(Number(item.unitRate));
    }
 
    if (item.mrp !== null && item.mrp !== undefined) {
      aggregatedItem.mrps.push(Number(item.mrp));
    }
  }
 
  return aggregatedItems;
};
 
const mergeAggregatedItems = (targetMap, sourceMap) => {
  for (const [matchKey, sourceItem] of sourceMap) {
    if (!targetMap.has(matchKey)) {
      targetMap.set(matchKey, {
        ...sourceItem,
        unitRates: [...sourceItem.unitRates],
        mrps: [...sourceItem.mrps],
        reasons: [...sourceItem.reasons],
      });
 
      continue;
    }
 
    const targetItem = targetMap.get(matchKey);
 
    targetItem.quantity += sourceItem.quantity;
    targetItem.unitRates.push(...sourceItem.unitRates);
    targetItem.mrps.push(...sourceItem.mrps);
  }
 
  return targetMap;
};
 
const aggregateMultipleDocuments = (documents, quantityField) => {
  const finalMap = new Map();
 
  for (const document of documents) {
    const documentItems = aggregateDocumentItems(document.items, quantityField);
 
    mergeAggregatedItems(finalMap, documentItems);
  }
 
  return finalMap;
};
 
const loadMatchDocuments = async (poNumber) => {
  const [purchaseOrders, grns, invoices] = await Promise.all([
    PurchaseOrder.find({ poNumber }).sort({ createdAt: 1 }),
    Grn.find({ poNumber }).sort({ createdAt: 1 }),
    Invoice.find({ poNumber }).sort({ createdAt: 1 }),
  ]);
 
  const primaryPo = purchaseOrders[0] || null;
  const duplicatePos = purchaseOrders.slice(1);
 
  return { primaryPo, duplicatePos, grns, invoices };
};
 
const resolveDocumentItems = (items, skuMasters) => {
  return items.map((item) => {
    const resolvedSku = resolveSkuFromMasters(item.itemCode, skuMasters);
 
    return {
      ...item.toObject(),
      skuMaster: resolvedSku ? resolvedSku._id : null,
    };
  });
};
 
const prepareMatchData = async (poNumber) => {
  const { primaryPo, duplicatePos, grns, invoices } = await loadMatchDocuments(poNumber);
 
  const skuMasters = await SkuMaster.find();
 
  const resolvedPrimaryPo = primaryPo
    ? { ...primaryPo.toObject(), items: resolveDocumentItems(primaryPo.items, skuMasters) }
    : null;
 
  const resolvedGrns = grns.map((grn) => ({
    ...grn.toObject(),
    items: resolveDocumentItems(grn.items, skuMasters),
  }));
 
  const resolvedInvoices = invoices.map((invoice) => ({
    ...invoice.toObject(),
    items: resolveDocumentItems(invoice.items, skuMasters),
  }));
 
  const poItems = resolvedPrimaryPo
    ? aggregateDocumentItems(resolvedPrimaryPo.items, "quantity")
    : new Map();
 
  const grnItems = aggregateMultipleDocuments(resolvedGrns, "receivedQuantity");
  const invoiceItems = aggregateMultipleDocuments(resolvedInvoices, "quantity");
 
  return {
    primaryPo: resolvedPrimaryPo,
    duplicatePos,
    grns: resolvedGrns,
    invoices: resolvedInvoices,
    poItems,
    grnItems,
    invoiceItems,
    skuMasters,
  };
};
 
const getAllMatchKeys = (poItems, grnItems, invoiceItems) => {
  return new Set([...poItems.keys(), ...grnItems.keys(), ...invoiceItems.keys()]);
};
 
const addReason = (item, reasonCode) => {
  if (!item.reasons.includes(reasonCode)) {
    item.reasons.push(reasonCode);
  }
};
 
const buildMatchedItems = (poItems, grnItems, invoiceItems, skuMasters) => {
  const matchKeys = getAllMatchKeys(poItems, grnItems, invoiceItems);
  const matchedItems = [];
 
  for (const matchKey of matchKeys) {
    const poItem = poItems.get(matchKey) || null;
    const grnItem = grnItems.get(matchKey) || null;
    const invoiceItem = invoiceItems.get(matchKey) || null;
 
    const sourceItem = poItem || grnItem || invoiceItem;
 
    const resolvedSku = sourceItem.skuMaster
      ? skuMasters.find((sku) => sku._id.toString() === sourceItem.skuMaster.toString())
      : null;
 
    matchedItems.push({
      matchKey,
 
      skuMaster: resolvedSku
        ? {
            id: resolvedSku._id,
            name: resolvedSku.name,
            skuErpCode: resolvedSku.skuErpCode,
            eanCode: resolvedSku.eanCode,
            hsnCode: resolvedSku.hsnCode,
            uom: resolvedSku.uom,
            agreedRate: resolvedSku.agreedRate,
            mrp: resolvedSku.mrp,
            priceTolerance: resolvedSku.priceTolerance,
          }
        : null,
 
      itemCode: sourceItem.itemCode || null,
      description: sourceItem.description || null,
 
      po: {
        quantity: poItem ? poItem.quantity : null,
      },
 
      grn: {
        quantity: grnItem ? grnItem.quantity : null,
        mrps: grnItem ? grnItem.mrps : [],
      },
 
      invoice: {
        quantity: invoiceItem ? invoiceItem.quantity : null,
        unitRates: invoiceItem ? invoiceItem.unitRates : [],
        mrps: invoiceItem ? invoiceItem.mrps : [],
      },
 
      reasons: [],
    });
  }
 
  return matchedItems;
};
 
const applyQuantityRules = (matchedItems) => {
  for (const item of matchedItems) {
    const poQuantity = item.po.quantity;
    const grnQuantity = item.grn.quantity;
    const invoiceQuantity = item.invoice.quantity;
 
    if (poQuantity !== null && grnQuantity !== null && grnQuantity > poQuantity) {
      addReason(item, "grn_qty_exceeds_po_qty");
    }
 
    if (grnQuantity !== null && invoiceQuantity !== null && invoiceQuantity > grnQuantity) {
      addReason(item, "invoice_qty_exceeds_grn_qty");
    }
 
    if (poQuantity !== null && invoiceQuantity !== null && invoiceQuantity > poQuantity) {
      addReason(item, "invoice_qty_exceeds_po_qty");
    }
 
    if (poQuantity === null && (grnQuantity !== null || invoiceQuantity !== null)) {
      addReason(item, "item_missing_in_po");
    }
  }
 
  return matchedItems;
};
 
const applyUnmappedSkuRules = (matchedItems) => {
  for (const item of matchedItems) {
    if (!item.skuMaster) {
      addReason(item, "unmapped_master_sku");
    }
  }
 
  return matchedItems;
};
 
const applyPriceRules = (matchedItems) => {
  for (const item of matchedItems) {
    const agreedRate = item.skuMaster?.agreedRate;
    const priceTolerance = item.skuMaster?.priceTolerance;
 
    if (agreedRate === null || agreedRate === undefined || agreedRate <= 0) {
      continue;
    }
 
    for (const unitRate of item.invoice.unitRates) {
      if (unitRate === null || unitRate === undefined || Number.isNaN(unitRate)) {
        continue;
      }
 
      const difference = Math.abs(unitRate - agreedRate) / agreedRate;
 
      if (difference > (priceTolerance ?? 0)) {
        addReason(item, "price_mismatch");
        break;
      }
    }
  }
 
  return matchedItems;
};
 
const applyMrpRules = (matchedItems) => {
  for (const item of matchedItems) {
    const masterMrp = item.skuMaster?.mrp;
 
    if (masterMrp === null || masterMrp === undefined || masterMrp <= 0) {
      continue;
    }
 
    const mrpsToCheck = [...item.grn.mrps, ...item.invoice.mrps];
 
    for (const mrp of mrpsToCheck) {
      if (mrp === null || mrp === undefined || Number.isNaN(mrp)) {
        continue;
      }
 
      const difference = Math.abs(mrp - masterMrp) / masterMrp;
 
      if (difference > 0.01) {
        addReason(item, "mrp_mismatch");
        break;
      }
    }
  }
 
  return matchedItems;
};
 
const getDuplicatePoReasons = (duplicatePos) => {
  return duplicatePos.length > 0 ? ["duplicate_po"] : [];
};
 
const hasDuplicateDocument = (documents, numberField) => {
  const seen = new Set();
 
  for (const document of documents) {
    const documentNumber = document[numberField];
 
    if (seen.has(documentNumber)) {
      return true;
    }
 
    seen.add(documentNumber);
  }
 
  return false;
};
 
const getDuplicateDocumentReasons = (grns, invoices) => {
  const hasDuplicateGrn = hasDuplicateDocument(grns, "grnNumber");
  const hasDuplicateInvoice = hasDuplicateDocument(invoices, "invoiceNumber");
 
  return hasDuplicateGrn || hasDuplicateInvoice ? ["duplicate_document"] : [];
};
 
const getInvoiceDateReasons = (primaryPo, invoices) => {
  if (!primaryPo || !primaryPo.poDate) {
    return [];
  }
 
  const poDate = new Date(primaryPo.poDate);
 
  const hasInvalidInvoiceDate = invoices.some((invoice) => {
    if (!invoice.invoiceDate) return false;
 
    const invoiceDate = new Date(invoice.invoiceDate);
 
    return invoiceDate > poDate;
  });
 
  return hasInvalidInvoiceDate ? ["invoice_date_after_po_date"] : [];
};
 
const collectMatchReasons = ({ matchedItems, duplicatePos, grns, invoices, primaryPo }) => {
  const itemReasons = matchedItems.flatMap((item) =>
    item.reasons.map((reason) => ({ reason, matchKey: item.matchKey }))
  );
 
  const documentReasons = [
    ...getDuplicatePoReasons(duplicatePos),
    ...getDuplicateDocumentReasons(grns, invoices),
    ...getInvoiceDateReasons(primaryPo, invoices),
  ].map((reason) => ({ reason, matchKey: null }));
 
  return [...itemReasons, ...documentReasons];
};
 
const HARD_REASON_CODES = [
  "grn_qty_exceeds_po_qty",
  "invoice_qty_exceeds_grn_qty",
  "invoice_qty_exceeds_po_qty",
  "invoice_date_after_po_date",
  "duplicate_po",
  "duplicate_document",
  "item_missing_in_po",
];
 
const SOFT_REASON_CODES = ["price_mismatch", "mrp_mismatch", "unmapped_master_sku"];
 
const determineMatchStatus = ({ primaryPo, grns, invoices, matchedItems, reasons }) => {
  if (!primaryPo || grns.length === 0 || invoices.length === 0) {
    return "insufficient_documents";
  }
 
  const hasHardViolation = reasons.some(({ reason }) => HARD_REASON_CODES.includes(reason));
 
  if (hasHardViolation) {
    return "mismatch";
  }
 
  const hasSoftWarning = reasons.some(({ reason }) => SOFT_REASON_CODES.includes(reason));
 
  const quantitiesFullyReconciled = matchedItems.every((item) => {
    return item.po.quantity === item.grn.quantity && item.grn.quantity === item.invoice.quantity;
  });
 
  if (!quantitiesFullyReconciled || hasSoftWarning) {
    return "partially_matched";
  }
 
  return "matched";
};
 
/**
 *GET /match/:poNumber.
 */
const computeMatch = async (poNumber) => {
  const { primaryPo, duplicatePos, grns, invoices, poItems, grnItems, invoiceItems, skuMasters } =
    await prepareMatchData(poNumber);
 
  const matchedItems = buildMatchedItems(poItems, grnItems, invoiceItems, skuMasters);
 
  applyQuantityRules(matchedItems);
  applyUnmappedSkuRules(matchedItems);
  applyPriceRules(matchedItems);
  applyMrpRules(matchedItems);
 
  const reasons = collectMatchReasons({ matchedItems, duplicatePos, grns, invoices, primaryPo });
 
  const status = determineMatchStatus({ primaryPo, grns, invoices, matchedItems, reasons });
 
  return {
    poNumber,
    primaryPo,
    duplicatePos,
    grns,
    invoices,
    matchedItems,
    reasons,
    status,
  };
};
 
/**
 * GET /summary/:poNumber
 */
const getSummary = async (poNumber) => {
  const { primaryPo, grns, invoices, skuMasters } = await prepareMatchData(poNumber);
  const matchResult = await computeMatch(poNumber);
 
  const skuById = new Map(skuMasters.map((sku) => [sku._id.toString(), sku]));
 
  const agreedRateFor = (skuMasterId) => {
    if (!skuMasterId) return 0;
    const sku = skuById.get(skuMasterId.toString());
    return sku?.agreedRate ?? 0;
  };
 
  const lineAmount = (item, quantityField, rateField) => {
    const quantity = Number(item[quantityField] || 0);
    const explicitRate = item[rateField];
    const rate =
      explicitRate !== null && explicitRate !== undefined
        ? Number(explicitRate)
        : agreedRateFor(item.skuMaster);
    return quantity * rate;
  };
 
  const poAmount = primaryPo
    ? primaryPo.items.reduce((sum, item) => sum + Number(item.quantity || 0) * agreedRateFor(item.skuMaster), 0)
    : 0;
 
  const poQuantityTotal = primaryPo
    ? primaryPo.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    : 0;
 
  const documentRows = [];
 
  let receivedQuantityTotal = 0;
  let totalReceived = 0;
 
  for (const grn of grns) {
    const quantity = grn.items.reduce((sum, item) => sum + Number(item.receivedQuantity || 0), 0);
    const amount = grn.items.reduce(
      (sum, item) => sum + Number(item.receivedQuantity || 0) * agreedRateFor(item.skuMaster),
      0
    );
 
    receivedQuantityTotal += quantity;
    totalReceived += amount;
 
    documentRows.push({
      type: "GRN",
      documentNumber: grn.grnNumber,
      date: grn.grnDate,
      quantity,
      amount,
      isDuplicate: Boolean(grn.isDuplicate),
    });
  }
 
  let invoicedQuantityTotal = 0;
  let totalInvoiced = 0;
 
  for (const invoice of invoices) {
    const quantity = invoice.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const amount = invoice.items.reduce(
      (sum, item) => sum + lineAmount(item, "quantity", "unitRate"),
      0
    );
 
    invoicedQuantityTotal += quantity;
    totalInvoiced += amount;
 
    documentRows.push({
      type: "Invoice",
      documentNumber: invoice.invoiceNumber,
      date: invoice.invoiceDate,
      quantity,
      amount,
      isDuplicate: Boolean(invoice.isDuplicate),
    });
  }
 
  documentRows.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
 
  const pendingDeliveryQuantity = Math.max(poQuantityTotal - receivedQuantityTotal, 0);
 
  documentRows.push({
    type: "Current Status",
    documentNumber: null,
    date: null,
    quantity: null,
    amount: null,
    cumulativeInvoicedQuantity: invoicedQuantityTotal,
    cumulativeReceivedQuantity: receivedQuantityTotal,
    pendingDeliveryQuantity,
    matchStatus: matchResult.status,
  });
 
  return {
    poNumber,
    status: matchResult.status,
    poAmount,
    totalInvoiced,
    totalReceived,
    poQuantityTotal,
    receivedQuantityTotal,
    invoicedQuantityTotal,
    pendingDeliveryQuantity,
    documents: documentRows,
  };
};
 
export {
  normalizeItemCode,
  getMatchKey,
  aggregateDocumentItems,
  mergeAggregatedItems,
  aggregateMultipleDocuments,
  loadMatchDocuments,
  resolveDocumentItems,
  prepareMatchData,
  getAllMatchKeys,
  addReason,
  buildMatchedItems,
  applyQuantityRules,
  applyUnmappedSkuRules,
  applyPriceRules,
  applyMrpRules,
  getDuplicatePoReasons,
  hasDuplicateDocument,
  getDuplicateDocumentReasons,
  getInvoiceDateReasons,
  collectMatchReasons,
  determineMatchStatus,
  computeMatch,
  getSummary,
};