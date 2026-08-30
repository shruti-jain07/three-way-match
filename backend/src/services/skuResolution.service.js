import SkuMaster from "../models/SkuMaster.model.js";

const normalizeValue = (value) => {
  if (!value) return null;

  return String(value)
    .trim()
    .toLowerCase();
};

const resolveSkuFromMasters = (itemCode, skuMasters) => {
  const normalizedItemCode = normalizeValue(itemCode);

  if (!normalizedItemCode) {
    return null;
  }

  let resolvedSku = skuMasters.find(
    (sku) =>
      normalizeValue(sku.skuErpCode) === normalizedItemCode
  );

  if (resolvedSku) {
    return resolvedSku;
  }

  resolvedSku = skuMasters.find(
    (sku) =>
      normalizeValue(sku.eanCode) === normalizedItemCode
  );

  if (resolvedSku) {
    return resolvedSku;
  }

  resolvedSku = skuMasters.find((sku) =>
    (sku.aliases|| [])
      .map(normalizeValue)
      .includes(normalizedItemCode)
  );

  return resolvedSku || null;
};

const resolveSku = async (itemCode) => {
  const skuMasters = await SkuMaster.find();

  return resolveSkuFromMasters(itemCode, skuMasters);
};

export {
  normalizeValue,
  resolveSku,
  resolveSkuFromMasters,
};