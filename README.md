# MobiMind AI – Intelligent Mobility Copilot

> “MobiMind AI doesn’t just find the fastest route. It uses AI to balance **time**, **cost**, **traffic**, **environmental impact** and **user preferences** to recommend the smartest way to travel.”

---

## 🧭 Executive Summary & Architecture

**MobiMind AI** is an intelligent, multi-modal urban transit copilot designed to solve the one-dimensional limitation of traditional navigation platforms. Rather than merely optimizing for raw road speed, MobiMind AI evaluates all viable travel options—including **Public Bus/BRT**, **Metro/Subway**, **Suburban Rail**, **Car/Taxi/Ride-Hail**, **Active Walking**, **Micromobility Cycling/E-Scooter**, and **Integrated Multi-Modal combinations**—across multi-dimensional scoring indices:

1. **⚡ Time (minutes & traffic delay immunity)**
2. **💰 Cost (₹ fares, fuel, and cab pricing)**
3. **🌱 CO₂ Footprint (grams of greenhouse emissions saved)**
4. **🛡️ Safety Index (monitored corridors, footfall, lighting)**
5. **♿ Accessibility Score (step-free boarding, elevators, ramps)**
6. **🌦️ Weather Sensitivity (rain delays, temperature advisories)**

Using the Google Gemini AI generative decision engine (`@google/genai` / `@google/generative-ai`), MobiMind AI synthesizes these competing constraints into a clear, natural-language recommendation, highlighting trade-offs (e.g., *“You save ₹105 and reduce 1.2 kg CO₂ while arriving only 8 minutes later than a private cab”*).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router v6, Leaflet (OpenStreetMap Dark Matter), Lucide React
- **Backend**: Node.js, Express.js, TypeScript, TSX, Zod validation
- **Database**: PostgreSQL (with DDL schema and indexes) + seamless persistent local JSON store fallback
- **AI**: Google Gemini generative SDK (`@google/genai` / `@google/generative-ai`) + offline heuristic mobility copilot fallback
- **Authentication**: JWT token sessions, bcrypt password hashing, row-level data access

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### 2. Installation
Run the root script to install dependencies across root, server, and client:
```bash
npm run install:all
```

### 3. Environment Setup (Optional)
A default `.env` file is pre-configured in `server/.env`.
If you have a Google Gemini API Key and PostgreSQL database:
```env
# server/.env
PORT=5000
NODE_ENV=development

# PostgreSQL connection string (e.g. Neon, Supabase, local PostgreSQL)
DATABASE_URL=

# Google Gemini API key from https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# Google Maps API Key
GOOGLE_MAPS_API_KEY=AIzaSyBDZe9yV2yoBpamYCyT6_hF7yabxzFLZqk

# JWT Authentication Secret
JWT_SECRET=mobimind-super-secret-production-jwt-key-2026-secure-token

CLIENT_URL=http://localhost:3000
```
*(Note: If `GEMINI_API_KEY` is not provided, MobiMind AI runs its built-in heuristic reasoning engine so you can test all features offline without API keys).*

### 4. Running the Full-Stack Application
To start both backend (Port 5000) and frontend (Port 3000) concurrently:
```bash
npm run dev
```

Or run them individually:
```bash
# Terminal 1: Backend Server
npm run dev:server

# Terminal 2: Frontend Client
npm run dev:client
```

Open your browser to:
```
http://localhost:3000/
```

---

## 👤 Demo Commuter Account
To test authenticated features immediately without registration, use the pre-seeded account or click the **“One-Click Login as Demo Commuter”** button on the Login page:
- **Email:** `demo@mobimind.ai`
- **Password:** `mobimind123`

---

## 📱 Application Routes & Pages

| Route | Page | Description |
|---|---|---|
| `/` | **Landing / Hero** | Hero section with master tagline, demo comparison cards (`College → Railway Station`), feature breakdown, and primary CTA. |
| `/app` | **Route Planner Dashboard** | Origin & Destination form, Natural Language Intent copilot, priority selector chips, accessibility constraints, and quick demo presets. |
| `/app/results` | **Results View** | Gemini AI recommendation card, ranked multi-modal comparison cards, interactive Leaflet map with waypoints, and Live Navigation Simulator modal. |
| `/app/history` | **Journey History** | Historical recommendations, saved routes, one-click journey reload, and deletion. |
| `/app/preferences` | **Mobility Preferences** | Interactive weight sliders (Time, Cost, CO₂, Safety, Accessibility), preferred mode toggles, and max walk tolerance. |
| `/login` | **Sign In** | Email & password authentication with 1-click Demo Commuter login. |
| `/register` | **Create Account** | New user signup with automatic preference seeding. |
| `/profile` | **Account Profile** | Commute savings summary (CO₂ avoided, ₹ retained, journeys planned) and account settings. |

---

## 🗺️ API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` – Create user account & default preferences
- `POST /api/auth/login` – Authenticate with email and password
- `GET /api/auth/me` – Retrieve current authenticated user profile

### 🧭 Mobility Engine (`/api/mobility`)
- `POST /api/mobility/analyze` – Run multi-criteria analysis for 7 transport modes and generate Gemini AI recommendation
- `POST /api/mobility/parse-intent` – Extract origin, destination, and priorities from natural language prompts
- `GET /api/mobility/weather` – Current atmospheric conditions and mobility advisories

### ⚙️ User Preferences (`/api/preferences`)
- `GET /api/preferences` – Retrieve user's mobility weights and settings
- `PUT /api/preferences` – Update priority weights, accessibility needs, and mode filters

### 📚 Journeys & History (`/api/journeys`)
- `POST /api/journeys` – Save a planned journey to user history
- `GET /api/journeys` – List saved journeys for authenticated user
- `GET /api/journeys/:id` – Retrieve a specific journey
- `DELETE /api/journeys/:id` – Remove a journey from history

---

## 🗄️ PostgreSQL Database Schema
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  primary_priority TEXT CHECK (primary_priority IN ('fastest', 'cheapest', 'eco', 'safer', 'accessible')),
  priority_weights JSONB DEFAULT '{"time": 0.3, "cost": 0.25, "co2": 0.2, "safety": 0.15, "accessibility": 0.1}',
  accessibility_needs TEXT[],
  preferred_modes TEXT[],
  max_walk_meters INTEGER DEFAULT 800,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journeys / Recommendations
CREATE TABLE journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_coords JSONB,
  destination_coords JSONB,
  departure_time TIMESTAMPTZ,
  primary_priority TEXT,
  raw_options JSONB,
  ai_recommendation JSONB,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_journeys_user_id ON journeys(user_id);
CREATE INDEX idx_journeys_created_at ON journeys(created_at DESC);
```

---

## 🏆 Production Quality Highlights
- **Zero Placeholders**: Every route, component, algorithm, and handler is fully written and typed.
- **Type-Safety**: End-to-end TypeScript with Zod validation on both API requests and AI responses.
- **Zero-Crash Resilience**: Runs flawlessly with or without PostgreSQL / Gemini API keys through intelligent fallbacks.
- **Responsive & Dark-Mode Native**: Sleek cockpit aesthetic designed for mobile, tablet, and desktop screens.
