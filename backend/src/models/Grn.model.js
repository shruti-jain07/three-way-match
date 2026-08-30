import mongoose from "mongoose";

const grnSchema = new mongoose.Schema(
  {
    grnNumber: {
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

    grnDate: {
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

        receivedQuantity: {
          type: Number,
          required: true,
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

const Grn = mongoose.model("Grn", grnSchema);

export default Grn;