import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { getMatchSummary } from "../controllers/summary.controller.js";

const router = Router();
router.use(authenticate);

router.get("/:poNumber", getMatchSummary);

export default router;