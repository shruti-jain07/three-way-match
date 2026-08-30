import multer from "multer";
import path from "path";
import fs from "fs";
 
const uploadDir = "uploads/";
 
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
 
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
 
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  },
});
 
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
 
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
 
  const extension = path.extname(file.originalname).toLowerCase();
 
  const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
  const isValidExtension = allowedExtensions.includes(extension);
 
  if (isValidMimeType || isValidExtension) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPEG, PNG, and WEBP files are allowed"));
  }
};
 
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
 
export default upload;