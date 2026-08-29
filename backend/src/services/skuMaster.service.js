import SkuMaster from "../models/SkuMaster.model.js";

export const createSku = async (data) => {
  return await SkuMaster.create(data);
};

export const getAllSkus = async () => {
  return await SkuMaster.find().sort({ createdAt: -1 });
};

export const getSkuById = async (id) => {
  return await SkuMaster.findById(id);
};

export const updateSku = async (id, data) => {
  return await SkuMaster.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteSku = async (id) => {
  return await SkuMaster.findByIdAndDelete(id);
};