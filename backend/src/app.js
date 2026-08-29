import express from "express";
import cors from "cors";

import skuMasterRoutes from "./routes/skuMaster.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.use("/masters/sku", skuMasterRoutes);

export default app;