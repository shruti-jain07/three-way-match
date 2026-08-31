import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import {
  uploadDocument,
  getDocumentById,
  getDocumentFile,
  getDocuments,
} from "../controllers/document.controller.js";
import upload from "../middleware/upload.middleware.js";
 
const router = Router();

router.use(authenticate);
 
/**
 * @swagger
 * /documents/upload:
 *   post:
 *     summary: Upload and process a document
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - documentType
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload
 *               documentType:
 *                 type: string
 *                 enum:
 *                   - po
 *                   - grn
 *                   - invoice
 *                 example: po
 *     responses:
 *       201:
 *         description: Document uploaded and processed successfully
 *       400:
 *         description: Invalid request or document type
 *       500:
 *         description: Failed to process document
 */
router.post("/upload", upload.single("file"), uploadDocument);
/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get documents
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [po, grn, invoice]
 *         description: Filter documents by type
 *       - in: query
 *         name: poNumber
 *         schema:
 *           type: string
 *         description: Filter documents by PO number
 *     responses:
 *       200:
 *         description: Documents fetched successfully
 *       400:
 *         description: Invalid document type
 *       500:
 *         description: Failed to fetch documents
 */
router.get("/", getDocuments);
/**
 * @swagger
 * /documents/{id}/file:
 *   get:
 *     summary: Get original document file
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [po, grn, invoice]
 *         description: Optional document type
 *     responses:
 *       200:
 *         description: Original document file returned successfully
 *       400:
 *         description: Invalid document type
 *       404:
 *         description: Document not found or original file is unavailable
 *       500:
 *         description: Failed to load document file
 */
router.get("/:id/file", getDocumentFile);
/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: Get document by ID
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [po, grn, invoice]
 *         description: Optional document type
 *     responses:
 *       200:
 *         description: Document fetched successfully
 *       400:
 *         description: Invalid document type
 *       404:
 *         description: Document not found
 *       500:
 *         description: Failed to fetch document
 */
router.get("/:id", getDocumentById);
 
export default router;