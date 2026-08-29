import express from "express";

import {
  createSkuMaster,
  getSkuMasters,
  getSkuMasterById,
  updateSkuMaster,
  deleteSkuMaster,
} from "../controllers/skuMaster.controller.js";

const router = express.Router();

router.post("/", createSkuMaster);
router.get("/", getSkuMasters);
router.get("/:id", getSkuMasterById);
router.patch("/:id", updateSkuMaster);
router.delete("/:id", deleteSkuMaster);

export default router;