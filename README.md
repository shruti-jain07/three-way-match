# Three-Way Match Engine

Upload PO / GRN / Invoice documents → Gemini extracts structured data → items resolve
against a SKU Master catalogue → a three-way match recomputes live on every read.

**Stack:** Node/Express/MongoDB + Gemini (backend) · Next.js/Tailwind/TanStack Query (frontend) · static Bearer token auth

---

## Run Locally

**Backend**

cd backend
cp .env.example .env   # fill in values below
npm install
npm run dev

PORT=5000
MONGODB_URI=mongodb://localhost:27017/three-way-match
AUTH_TOKEN=any-secret-string
GEMINI_API_KEY=your-gemini-key


**Frontend**

cd frontend
cp .env.example .env.local
npm install
npm run dev

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000


Open `http://localhost:3000` → log in → upload documents.

---

## API

| Method | Path | Auth |
|---|---|---|
| POST | `/auth/login`
| POST | `/documents/upload` Yes
| GET | `/documents/:id` Yes
| GET | `/documents/:id/file` Yes
| GET | `/documents?type=&poNumber=` Yes
| GET | `/match/:poNumber` Yes
| GET | `/summary/:poNumber`  Yes
| POST/GET/PATCH/DELETE | `/masters/sku[/:id]`  Yes

Swagger JSDoc is on every route file — mount with `swagger-jsdoc` + `swagger-ui-express` at `/api-docs`.

---

## Key Design Decisions

- **Matching key:** resolved `SkuMaster._id` (via `skuErpCode` → `eanCode` → `aliases`, trimmed/case-insensitive). Unresolved items fall back to normalized `itemCode` and get flagged `unmapped_master_sku`, never dropped.
- **Live re-resolution:** SKU resolution runs again on every `GET /match` call, not just at upload — so creating a SKU Master *after* upload still gets picked up without re-uploading.
- **Out-of-order uploads:** documents link only by `poNumber` string (no FK), so any doc type can arrive first. `GET /match` never caches — always recomputed.
- **Duplicates:** stored, never overwritten, flagged (`duplicate_po` / `duplicate_document`) — and excluded from quantity/amount totals so they don't inflate the match numbers on top of being flagged.
- **State management:** TanStack Query, not Redux — backend is the sole source of truth, so caching + `invalidateQueries` covers everything without hand-written reducers.
- **Status hierarchy:** `insufficient_documents` → `mismatch` (hard violations) → `partially_matched` (soft warnings / not fully reconciled) → `matched`.

## Known Limitations

- `GET /documents/:id` shows the upload-time SKU snapshot, not live-resolved (only `/match` and `/summary` re-resolve).
- Live re-resolution scans the full SkuMaster collection per request — fine at this scale, not indexed for high volume.
- UOM conversion out of scope (per spec).


---

## Deploying to Render
Backend deployed
https://three-way-match-9ggp.onrender.com/api-docs/
