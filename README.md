# CityPulse – Hyderabad

A MERN starter project for reporting civic issues, browsing reports on a Leaflet map, monitoring alerts/sensor demo data, and administrator workflows.

## Requirements
- Node.js 20+
- MongoDB local instance or MongoDB Atlas URI

## Run on Windows PowerShell
1. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` and a long `JWT_SECRET` (the server refuses to start without both). Optionally copy `frontend/.env.example` to `frontend/.env` if your API is not on `http://localhost:5000/api`.
2. Terminal 1:
   ```powershell
   cd backend
   npm install
   npm run dev
   ```
3. Terminal 2:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
4. Open the Vite URL shown in the terminal. API defaults to `http://localhost:5000/api`.

## First admin
Register a normal user through the Admin page, then promote them from the server shell:
```powershell
cd backend
npm run make-admin -- you@example.com
```
Then sign out and back in. Never expose admin role assignment publicly.

Alerts are created by admins through `POST /api/alerts` (Bearer token required) with `type`, `title`, and optionally `description`, `location`, `priority`.

## Notes
- Real issue reports use coordinates selected in the report form and are persisted to MongoDB.
- Sensor readings and initial alerts are demonstration data until connected to a real feed/database source.
- The site uses OpenStreetMap tiles through Leaflet. Internet access is required for map tiles.
- Browser audio requires a user gesture and may be blocked by browser/device settings. A website cannot sound when closed or the device is muted.
- Add licensed local photos under `frontend/public/images/`. If none are present, the UI uses a styled fallback rather than broken image paths.
- Configure HTTPS, secure deployment, rate limiting, production file storage, backups, and stricter validation before public deployment.
