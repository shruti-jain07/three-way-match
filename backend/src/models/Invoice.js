import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
    },

    poNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    invoiceDate: {
      type: Date,
      required: true,
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

        unitRate: {
          type: Number,
          default: null,
        },

        mrp: {
          type: Number,
          default: null,
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

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;