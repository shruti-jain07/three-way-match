import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import validateParsedDocument from "../validators/parsedDocument.validator.js";
 
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
 

const documentSchemas = {
  po: {
    type: "object",
    properties: {
      poNumber: {
        type: "string",
      },
      poDate: {
        type: "string",
      },
      vendorName: {
        type: "string",
      },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            itemCode: {
              type: "string",
            },
            description: {
              type: "string",
            },
            quantity: {
              type: "number",
            },
          },
          required: ["itemCode", "description", "quantity"],
        },
      },
    },
    required: ["poNumber", "poDate", "vendorName", "items"],
  },
 
  grn: {
    type: "object",
    properties: {
      grnNumber: {
        type: "string",
      },
      poNumber: {
        type: "string",
      },
      grnDate: {
        type: "string",
      },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            itemCode: {
              type: "string",
            },
            description: {
              type: "string",
            },
            receivedQuantity: {
              type: "number",
            },
            mrp: {
              type: "number",
              nullable: true,
            },
          },
          required: ["itemCode", "description", "receivedQuantity"],
        },
      },
    },
    required: ["grnNumber", "poNumber", "grnDate", "items"],
  },
 
  invoice: {
    type: "object",
    properties: {
      invoiceNumber: {
        type: "string",
      },
      poNumber: {
        type: "string",
      },
      invoiceDate: {
        type: "string",
      },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            itemCode: {
              type: "string",
            },
            description: {
              type: "string",
            },
            quantity: {
              type: "number",
            },
            unitRate: {
              type: "number",
              nullable: true,
            },
            mrp: {
              type: "number",
              nullable: true,
            },
          },
          required: ["itemCode", "description", "quantity"],
        },
      },
    },
    required: ["invoiceNumber", "poNumber", "invoiceDate", "items"],
  },
};
 
const documentPrompts = {
  po: `
Extract structured data from this Purchase Order.
 
Extract:
- poNumber
- poDate
- vendorName
- every line item
 
For each item extract:
- itemCode
- description
- quantity
 
Rules:
- Do not invent values.
- Extract itemCode exactly as shown where possible.
- quantity must be a number.
- Return data only according to the provided schema.
`,
 
  grn: `
Extract structured data from this Goods Receipt Note.
 
Extract:
- grnNumber
- poNumber
- grnDate
- every line item
 
For each item extract:
- itemCode
- description
- receivedQuantity
- mrp only when visible
 
Rules:
- Do not invent values.
- Extract itemCode exactly as shown where possible.
- receivedQuantity must be a number.
- Return data only according to the provided schema.
`,
 
  invoice: `
Extract structured data from this Invoice.
 
Extract:
- invoiceNumber
- poNumber
- invoiceDate
- every line item
 
For each item extract:
- itemCode
- description
- quantity
- unitRate when visible
- mrp when visible
 
Rules:
- Do not invent values.
- Extract itemCode exactly as shown where possible.
- quantity and unitRate must be numbers when present.
- Return data only according to the provided schema.
`,
};
 
const parseDocument = async (filePath, mimeType, documentType) => {
  if (!documentSchemas[documentType]) {
    throw new Error("Invalid document type");
  }
 
  const fileData = fs.readFileSync(filePath, { encoding: "base64" });
 
  let lastError = null;
 
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
 
        contents: [
          {
            inlineData: {
              mimeType,
              data: fileData,
            },
          },
          {
            text: documentPrompts[documentType],
          },
        ],
 
        config: {
          responseMimeType: "application/json",
          responseSchema: documentSchemas[documentType],
        },
      });
 
      if (!response.text) {
        lastError = new Error("Gemini returned an empty response");
        continue;
      }
 
      const parsedData = JSON.parse(response.text);
 
      const isValid = validateParsedDocument(parsedData, documentType);
 
      if (isValid) {
        return parsedData;
      }
 
      lastError = new Error("Gemini returned incomplete or invalid document data");
    } catch (error) {
      lastError = error;
    }
  }
 
  throw lastError || new Error("Failed to parse document");
};
 
export default parseDocument;