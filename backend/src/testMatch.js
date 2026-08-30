import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { computeMatch } from "./services/match.service.js";

dotenv.config();

const run = async () => {
  try {
    await connectDB();

    const poNumber = process.argv[2];

    if (!poNumber) {
      console.log("Please provide a PO number");
      process.exit(1);
    }

    const result = await computeMatch(poNumber);

    console.log(
      JSON.stringify(result, null, 2)
    );

    await mongoose.connection.close();

  } catch (error) {
    console.error("Match test failed:", error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

run();