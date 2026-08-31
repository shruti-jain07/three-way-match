### project
Three-Way Match Engine

Upload PO / GRN / Invoice documents → Gemini extracts structured data → items resolve against a SKU Master catalogue → a three-way match recomputes live on every read.
### Tech stack
Backend: Node/Express/MongoDB + Gemini 
Frontend: Next.js/Tailwind/TanStack Query 
Authentication: static Bearer token auth

Run Locally

## Backend

cd backend
.env.example  
npm install
npm run dev
PORT=5000
MONGODB_URI=Your-mongodb-string
AUTH_TOKEN=any-secret-string
GEMINI_API_KEY=your-gemini-key

## Frontend

cd frontend
cp .env.example .env.local
npm install
npm run dev
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

Open http://localhost:3000 → log in → upload documents.

## API
Method	Path	Auth
POST	/auth/login
POST	/documents/upload
GET	/documents/:id
GET	/documents/:id/file
GET	/documents?type=&poNumber=
GET	/match/:poNumber
GET	/summary/:poNumber	
POST/GET/PATCH/DELETE	/masters/sku[/:id]

## swagger
Swagger JSDoc is on every route file — mount with swagger-jsdoc + swagger-ui-express at /api-docs.

## Key Design Decisions
-Matching key: resolved SkuMaster._id (via skuErpCode → eanCode → aliases, trimmed/case-insensitive). Unresolved items fall back to normalized itemCode and get flagged unmapped_master_sku, never dropped.
-Live re-resolution: SKU resolution runs again on every GET /match call, not just at upload — so creating a SKU Master after upload still gets picked up without re-uploading.
-Out-of-order uploads: documents link only by poNumber string (no FK), so any doc type can arrive first. GET /match never caches — always recomputed.
-Duplicates: stored, never overwritten, flagged (duplicate_po / duplicate_document) — and excluded from quantity/amount totals so they don't inflate the match numbers on top of being flagged.
-State management: TanStack Query
-Status hierarchy: insufficient_documents → mismatch (hard violations) → partially_matched (soft warnings / not fully reconciled) → matched.
