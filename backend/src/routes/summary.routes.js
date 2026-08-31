import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { getMatchSummary } from "../controllers/summary.controller.js";

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /summary/{poNumber}:
 *   get:
 *     summary: Get matching summary for a Purchase Order
 *     tags:
 *       - Summary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poNumber
 *         required: true
 *         description: Purchase Order number
 *         schema:
 *           type: string
 *         example: PO-001
 *     responses:
 *       200:
 *         description: Match summary generated successfully
 *       400:
 *         description: PO number is required
 *       500:
 *         description: Failed to generate summary
 */
router.get("/:poNumber", getMatchSummary);

export default router;