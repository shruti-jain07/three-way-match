import express from "express";
import cors from "cors";

import skuMasterRoutes from "./routes/skuMaster.routes.js";
import documentRoutes from "./routes/document.routes.js";
import authRoutes from "./routes/auth.routes.js";
import matchRoutes from "./routes/match.routes.js";
import summaryRoutes from "./routes/summary.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});
app.use("/auth", authRoutes);
app.use("/masters/sku", skuMasterRoutes);
app.use("/documents", documentRoutes);
app.use("/match",matchRoutes);
app.use("/summary",summaryRoutes);
export default app;