import fs from "fs";
import path from "path";
 
import parseDocument from "../services/parser.service.js";
import {
  saveDocument,
  findDocumentById,
  listDocuments,
} from "../services/document.service.js";
 
const ALLOWED_DOCUMENT_TYPES = ["po", "grn", "invoice"];
 
const uploadDocument = async (req, res) => {
  try {
    const { documentType } = req.body;
 
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }
 
    if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
      fs.unlink(req.file.path, () => {});
 
      return res.status(400).json({
        success: false,
        message: "documentType must be po, grn, or invoice",
      });
    }
 
    const parsedData = await parseDocument(req.file.path, req.file.mimetype, documentType);
 
    const result = await saveDocument({
      documentType,
      parsedData,
      filePath: req.file.path,
    });
 
    return res.status(201).json({
      success: true,
      message: "Document uploaded and processed successfully",
      data: {
        document: result.document,
        audit: result.audit,
        duplicate: result.duplicate,
        unmappedItemsCount: result.unmappedItemsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process document",
    });
  }
};
 
/**
 * GET /documents/:id?type=po|grn|invoice
 * type is optional - without it, all three collections are checked.
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
 
    if (type && !ALLOWED_DOCUMENT_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be po, grn, or invoice",
      });
    }
 
    const result = await findDocumentById(id, type);
 
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
 
    return res.status(200).json({
      success: true,
      data: {
        documentType: result.documentType,
        document: result.document,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch document",
    });
  }
};
 
/**
 * GET /documents/:id/file?type=po|grn|invoice
 */
const getDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;
 
    if (type && !ALLOWED_DOCUMENT_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be po, grn, or invoice",
      });
    }
 
    const result = await findDocumentById(id, type);
 
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }
 
    const { filePath } = result.document;
    const resolvedPath = filePath ? path.resolve(filePath) : null;
 
    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        message: "Original file is not available for preview",
      });
    }
 
    return res.sendFile(resolvedPath, (error) => {
      if (error && !res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Failed to load document file",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load document file",
    });
  }
};
 
/**
 * GET /documents?type=&poNumber=
 */
const getDocuments = async (req, res) => {
  try {
    const { type, poNumber } = req.query;
 
    if (type && !ALLOWED_DOCUMENT_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be po, grn, or invoice",
      });
    }
 
    const documents = await listDocuments({ type, poNumber });
 
    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch documents",
    });
  }
};
 
export { uploadDocument, getDocumentById, getDocumentFile, getDocuments };
 