# TerraRun - Integrated Conquest App

TerraRun is a location-based game where users capture territories by completing loops (running or cycling) in the real world.

## 🚀 Getting Started

### 1. Database Setup (Supabase)
This project is pre-configured to work with Supabase.
1. Go to your Supabase Dashboard.
2. Open the **SQL Editor**.
3. Run the contents of `database/schema.sql`.
4. Your connection string and password are already configured in `backend/.env`.

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The server will run on `http://localhost:3000`.

### 3. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
The application will be available at `http://localhost:3001`.

## 🛠 Features
- **Live GPS Tracking**: Real-time distance and pace tracking.
- **Territory Grid**: Interactive map using Leaflet to show captured zones.
- **Clan Nexus**: Join teams and dominate sectors together.
- **Marketplace**: Redeem earned TerraCoins for rewards.
- **Supabase Integration**: Native PostgreSQL + PostGIS support.

## 📁 Project Structure
- `/backend`: Node.js Express API.
- `/frontend`: React + Vite + TypeScript web app.
- `/database`: SQL schema and migrations.
- `/mobile`: (In development) React Native application.

---
Created and integrated by Jules.
