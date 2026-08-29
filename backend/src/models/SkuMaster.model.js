import mongoose from "mongoose";

const skuMasterSchema = new mongoose.Schema(
  {
    skuErpCode: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    aliases: {
      type: [String],
      default: [],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    eanCode: {
      type: String,
      default: null,
      trim: true,
    },

    hsnCode: {
      type: String,
      default: null,
      trim: true,
    },

    uom: {
      type: String,
      default: null,
      trim: true,
    },

    agreedRate: {
      type: Number,
      default: null,
    },

    mrp: {
      type: Number,
      default: null,
    },

    priceTolerance: {
      type: Number,
      default: 0.05,
    },
  },
  {
    timestamps: true,
  }
);

const SkuMaster = mongoose.model("SkuMaster", skuMasterSchema);

export default SkuMaster;