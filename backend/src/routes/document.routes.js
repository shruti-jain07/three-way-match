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
 
router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id/file", getDocumentFile);
router.get("/:id", getDocumentById);
 
export default router;