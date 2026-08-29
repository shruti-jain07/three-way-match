import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    poDate: {
      type: Date,
      required: true,
    },

    vendorName: {
      type: String,
      required: true,
      trim: true,
    },

    items: [
      {
        itemCode: {
          type: String,
          required: true,
          trim: true,
        },

        description: {
          type: String,
          required: true,
          trim: true,
        },

        quantity: {
          type: Number,
          required: true,
        },

        skuMaster: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SkuMaster",
          default: null,
        },
      },
    ],

    rawParsed: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    isDuplicate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const PurchaseOrder = mongoose.model(
  "PurchaseOrder",
  purchaseOrderSchema
);

export default PurchaseOrder;