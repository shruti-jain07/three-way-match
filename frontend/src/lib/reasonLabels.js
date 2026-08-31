export const REASON_LABELS = {
  grn_qty_exceeds_po_qty: "GRN Qty Exceeds PO Qty",
  invoice_qty_exceeds_grn_qty: "Invoice Qty Exceeds GRN Qty",
  invoice_qty_exceeds_po_qty: "Invoice Qty Exceeds PO Qty",
  invoice_date_after_po_date: "Invoice Date After PO Date",
  duplicate_po: "Duplicate PO",
  duplicate_document: "Duplicate Document",
  item_missing_in_po: "Item Missing in PO",
  price_mismatch: "Price Mismatch",
  mrp_mismatch: "MRP Mismatch",
  unmapped_master_sku: "Unmapped SKU",
};
 
export const HARD_REASON_CODES = [
  "grn_qty_exceeds_po_qty",
  "invoice_qty_exceeds_grn_qty",
  "invoice_qty_exceeds_po_qty",
  "invoice_date_after_po_date",
  "duplicate_po",
  "duplicate_document",
  "item_missing_in_po",
];
 
export const reasonLabel = (code) => REASON_LABELS[code] || code;
 
export const isHardReason = (code) => HARD_REASON_CODES.includes(code);