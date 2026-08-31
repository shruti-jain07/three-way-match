import express from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
  createSkuMaster,
  getSkuMasters,
  getSkuMasterById,
  updateSkuMaster,
  deleteSkuMaster,
} from "../controllers/skuMaster.controller.js";

const router = express.Router();
router.use(authenticate);
/**
 * @swagger
 * /masters/sku:
 *   post:
 *     summary: Create a SKU Master
 *     tags:
 *       - SKU Masters
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skuErpCode
 *               - name
 *             properties:
 *               skuErpCode:
 *                 type: string
 *                 example: SKU-001
 *               aliases:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["ITEM-001", "PRODUCT-001"]
 *               name:
 *                 type: string
 *                 example: Sample Product
 *               eanCode:
 *                 type: string
 *                 example: "8901234567890"
 *               hsnCode:
 *                 type: string
 *                 example: "123456"
 *               uom:
 *                 type: string
 *                 example: PCS
 *               agreedRate:
 *                 type: number
 *                 example: 100
 *               mrp:
 *                 type: number
 *                 example: 150
 *               priceTolerance:
 *                 type: number
 *                 example: 0.05
 *     responses:
 *       201:
 *         description: SKU Master created successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: SKU ERP code already exists
 *       500:
 *         description: Failed to create SKU Master
 */
router.post("/", createSkuMaster);
/**
 * @swagger
 * /masters/sku:
 *   get:
 *     summary: Get all SKU Masters
 *     tags:
 *       - SKU Masters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SKU Masters fetched successfully
 *       500:
 *         description: Failed to fetch SKU Masters
 */
router.get("/", getSkuMasters);
/**
 * @swagger
 * /masters/sku/{id}:
 *   get:
 *     summary: Get SKU Master by ID
 *     tags:
 *       - SKU Masters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU Master ID
 *     responses:
 *       200:
 *         description: SKU Master fetched successfully
 *       404:
 *         description: SKU Master not found
 *       400:
 *         description: Invalid SKU Master ID
 */
router.get("/:id", getSkuMasterById);
/**
 * @swagger
 * /masters/sku/{id}:
 *   patch:
 *     summary: Update a SKU Master
 *     tags:
 *       - SKU Masters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU Master ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skuErpCode:
 *                 type: string
 *                 example: SKU-001
 *               aliases:
 *                 type: array
 *                 items:
 *                   type: string
 *               name:
 *                 type: string
 *                 example: Updated Product Name
 *               eanCode:
 *                 type: string
 *               hsnCode:
 *                 type: string
 *               uom:
 *                 type: string
 *               agreedRate:
 *                 type: number
 *               mrp:
 *                 type: number
 *               priceTolerance:
 *                 type: number
 *     responses:
 *       200:
 *         description: SKU Master updated successfully
 *       400:
 *         description: Failed to update SKU Master
 *       404:
 *         description: SKU Master not found
 *       409:
 *         description: SKU ERP code already exists
 */
router.patch("/:id", updateSkuMaster);
/**
 * @swagger
 * /masters/sku/{id}:
 *   delete:
 *     summary: Delete a SKU Master
 *     tags:
 *       - SKU Masters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU Master ID
 *     responses:
 *       200:
 *         description: SKU Master deleted successfully
 *       404:
 *         description: SKU Master not found
 *       400:
 *         description: Invalid SKU Master ID
 */
router.delete("/:id", deleteSkuMaster);

export default router;