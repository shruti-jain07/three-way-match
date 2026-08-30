import PurchaseOrder from "../models/PurchaseOrder.model.js";
import Grn from "../models/Grn.model.js";
import Invoice from "../models/Invoice.model.js";
 
const checkDuplicate = async (documentType, parsedData) => {
  switch (documentType) {
    case "po": {
      const existingPo = await PurchaseOrder.findOne({
        poNumber: parsedData.poNumber,
      });
 
      return {
        isDuplicate: Boolean(existingPo),
        reason: existingPo ? "duplicate_po" : null,
      };
    }
 
    case "grn": {
      const existingGrn = await Grn.findOne({
        poNumber: parsedData.poNumber,
        grnNumber: parsedData.grnNumber,
      });
 
      return {
        isDuplicate: Boolean(existingGrn),
        reason: existingGrn ? "duplicate_document" : null,
      };
    }
 
    case "invoice": {
      const existingInvoice = await Invoice.findOne({
        poNumber: parsedData.poNumber,
        invoiceNumber: parsedData.invoiceNumber,
      });
 
      return {
        isDuplicate: Boolean(existingInvoice),
        reason: existingInvoice ? "duplicate_document" : null,
      };
    }
 
    default:
      throw new Error("Invalid document type");
  }
};
 
export { checkDuplicate };
 