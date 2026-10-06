# STRICT PROJECT POLICY - API LOCK & PRESERVATION RULES

## CRITICAL DIRECTIVE (DO NOT VIOLATE):
1. **NEVER REMOVE ANY API OR SERVICE:**
   - Under NO circumstances should any API, service model, endpoint, or vendor integration be removed, disabled, or overwritten unless the user explicitly and verbatim commands to remove or change that specific API (e.g. "is api ko remove ya change kr do").
   - Dashboard UI adjustments must NEVER touch backend API services or routes.
   - Removing items from the Dashboard UI (`/dashboard`) means ONLY removing their UI cards from `resources/js/Pages/Admin/Dashboard.jsx`. NEVER delete services from the database, never unregister API routes, and never clear API keys.

2. **LOCKED API SERVICES:**
   - Voter PDF Manual Instant (apinice.in - 30 coins)
   - Voter Card Manual Maker (20 coins)
   - Mobile & DTH Recharge (apinice.in)
   - Aadhaar to Name (GoodAPI - 19 coins)
   - Aadhaar to NPCI Status (GoodAPI - 14 coins)
   - Aadhaar to Mask PAN (GoodAPI - 19 coins)
   - Aadhaar to Unmasked PAN (GoodAPI)
   - Mobile to PAN Instant (GoodAPI - 99 coins)
   - PAN Details Server 2 (GoodAPI - 19 coins)
   - PAN Full Details (GoodAPI - 29 coins)
   - PAN To Aadhaar Unmasked Instant (GoodAPI - 99 coins)
   - PAN To GST Instant (GoodAPI - 19 coins)
   - PAN Card Manual Maker (20 coins)
   - Courier & Parcel Slip Maker (5 coins)
   - Ration Card PDF Download (GoodAPI - 19 coins)
   - Ration To Aadhaar Find All State (GoodAPI - 119 coins)
   - Ration To Aadhaar Find UP (GoodAPI - 99 coins)
   - Aadhaar To Ration Find (GoodAPI - 39 coins)
   - Vehicle to Mobile / Vehicle Details / RC Info (Paanel gateway)
   - Vahan Challan Find & RC PDF
   - Mobile to Info & Aadhaar to Info

3. **AUTHENTICATION PROTOCOL FOR APINICE.IN:**
   - `apinice.in` API requests MUST always include `api_key` in the URL query string (e.g. `?api_key=...`), in the HTTP headers (`X-API-Key: ...`), and in form-data payload.
   - Endpoint URLs targeting `apinice.in/api/v2/voter-manual-pdf` MUST point to `.php` to prevent rewrite middleware header dropping.
