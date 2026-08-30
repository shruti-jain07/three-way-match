import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { getMatchResult } from "../controllers/match.controller.js";

const router = Router();
router.use(authenticate);

router.get("/:poNumber", getMatchResult);

export default router;