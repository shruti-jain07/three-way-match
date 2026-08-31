import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { getMatchResult } from "../controllers/match.controller.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /match/{poNumber}:
 *   get:
 *     summary: Get document matching result for a PO
 *     tags:
 *       - Matching
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase Order number to match
 *         example: PO-001
 *     responses:
 *       200:
 *         description: Matching result generated successfully
 *       400:
 *         description: PO number is required
 *       500:
 *         description: Failed to match documents
 */
router.get("/:poNumber", getMatchResult);

export default router;