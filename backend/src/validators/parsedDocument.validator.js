const isValidString = (value) => {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
};

const isValidNumber = (value) => {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
};

const validateItems = (items, quantityField) => {
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }

  return items.every((item) => {
    return (
      isValidString(item.itemCode) &&
      isValidString(item.description) &&
      isValidNumber(item[quantityField])
    );
  });
};

const validatePo = (data) => {
  return (
    isValidString(data?.poNumber) &&
    isValidString(data?.poDate) &&
    isValidString(data?.vendorName) &&
    validateItems(data?.items, "quantity")
  );
};

const validateGrn = (data) => {
  return (
    isValidString(data?.grnNumber) &&
    isValidString(data?.poNumber) &&
    isValidString(data?.grnDate) &&
    validateItems(data?.items, "receivedQuantity")
  );
};

const validateInvoice = (data) => {
  return (
    isValidString(data?.invoiceNumber) &&
    isValidString(data?.poNumber) &&
    isValidString(data?.invoiceDate) &&
    validateItems(data?.items, "quantity")
  );
};

const validateParsedDocument = (
  data,
  documentType
) => {
  switch (documentType) {
    case "po":
      return validatePo(data);

    case "grn":
      return validateGrn(data);

    case "invoice":
      return validateInvoice(data);

    default:
      return false;
  }
};

export default validateParsedDocument;