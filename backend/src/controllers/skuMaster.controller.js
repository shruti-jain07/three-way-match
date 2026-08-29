import * as skuMasterService from "../services/skuMaster.service.js";

export const createSkuMaster = async (req, res) => {
  try {
    const sku = await skuMasterService.createSku(req.body);

    res.status(201).json({
      success: true,
      data: sku,
    });
  } catch (error) {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "SKU ERP code already exists",
    });
  }

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map(
      (item) => item.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  res.status(500).json({
    success: false,
    message: "Failed to create SKU Master",
  });
}
};

export const getSkuMasters = async (req, res) => {
  try {
    const skus = await skuMasterService.getAllSkus();

    res.status(200).json({
      success: true,
      data: skus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch SKU Masters",
    });
  }
};

export const getSkuMasterById = async (req, res) => {
  try {
    const sku = await skuMasterService.getSkuById(req.params.id);

    if (!sku) {
      return res.status(404).json({
        success: false,
        message: "SKU Master not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sku,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid SKU Master ID",
    });
  }
};

export const updateSkuMaster = async (req, res) => {
  try {
    const sku = await skuMasterService.updateSku(
      req.params.id,
      req.body
    );

    if (!sku) {
      return res.status(404).json({
        success: false,
        message: "SKU Master not found",
      });
    }

    res.status(200).json({
      success: true,
      data: sku,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "SKU ERP code already exists",
      });
    }

    res.status(400).json({
      success: false,
      message: "Failed to update SKU Master",
    });
  }
};

export const deleteSkuMaster = async (req, res) => {
  try {
    const sku = await skuMasterService.deleteSku(req.params.id);

    if (!sku) {
      return res.status(404).json({
        success: false,
        message: "SKU Master not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "SKU Master deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid SKU Master ID",
    });
  }
};