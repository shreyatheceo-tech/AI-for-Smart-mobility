# MobiMind AI – Deployment Guide

This guide explains how to deploy **MobiMind AI** live to the web.

---

## 🚀 Recommended Method: Full-Stack Deployment on Render (100% Free & Simplest)

With our built-in production architecture, Render can host the **entire full-stack application (React Frontend + Node.js API)** as a single free web service, eliminating CORS issues and domain mismatches.

### Step 1: Push your latest code to GitHub
Run in your project root:
```bash
git add .
git commit -m "feat: configure production deployment"
git push origin main
```

### Step 2: Create a Web Service on Render
1. Go to **[dashboard.render.com](https://dashboard.render.com/)** and sign in with GitHub.
2. Click **New +** > **Web Service**.
3. Select your repository `AI-for-Smart-mobility`.
4. Configure the service settings:
   * **Name:** `mobimind-ai`
   * **Region:** Any (e.g. Frankfurt, Oregon, Singapore)
   * **Branch:** `main`
   * **Root Directory:** *(leave blank)*
   * **Runtime:** `Node`
   * **Build Command:**
     ```bash
     npm install && cd server && npm install && npm run build && cd ../client && npm install && npm run build
     ```
   * **Start Command:**
     ```bash
     cd server && npm start
     ```
   * **Plan:** **Free**

### Step 3: Add Environment Variables
Under the **Environment Variables** section on Render, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `JWT_SECRET` | `any-secure-random-string-12345` | Authentication token signature key |
| `GEMINI_API_KEY` | *(Your Gemini API key)* | Real-time multi-modal AI reasoning |
| `GOOGLE_MAPS_API_KEY` | *(Your Google Maps API key)* | Google Maps JavaScript routing & places |
| `DATABASE_URL` | *(Optional - Supabase / Neon URI)* | Leave empty to use embedded high-resilience DB |

### Step 4: Click "Deploy Web Service"
Render will install dependencies, build the TypeScript server, build the Vite React client, and launch your application at:
`https://mobimind-ai.onrender.com`

---

## ⚡ Alternative Method: Split Deployment (Vercel Frontend + Render Backend)

If you prefer hosting the client on **Vercel** and the backend on **Render**:

### 1. Deploy Backend on Render
* **Root Directory:** `server`
* **Build Command:** `npm install && npm run build`
* **Start Command:** `npm start`
* **Environment Variables:**
  * `NODE_ENV=production`
  * `JWT_SECRET=your-secret-key`
  * `GEMINI_API_KEY=your-gemini-key`
  * `GOOGLE_MAPS_API_KEY=your-maps-key`
  * `CLIENT_URL=https://your-frontend.vercel.app`
  * `DATABASE_URL=...` (Optional)

### 2. Deploy Frontend on Vercel
* Go to **[vercel.com](https://vercel.com/)** > **Add New Project**.
* Import your GitHub repository.
* Set **Root Directory** to `client`.
* Framework Preset: **Vite**.
* Build Command: `npm run build`
* Output Directory: `dist`
* **Environment Variables:**
  * `VITE_API_URL`: `https://your-backend.onrender.com/api`
  * `VITE_GOOGLE_MAPS_API_KEY`: *(Your Google Maps API key)*
* Click **Deploy**.

---

## 🗄️ Setting Up Supabase Database (Optional)

If you want to connect your Supabase PostgreSQL database:
1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project (`dqvoapidexdfqvugiboa`).
3. Click the **Project Settings** (gear icon) in the bottom left sidebar.
4. Go to **Database**.
5. Scroll down to **Connection String** and select the **URI** tab.
6. Copy the URI. It will look like:
   ```text
   postgresql://postgres.[project-id]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with the database password you created when opening the project.
8. Set that connection string as `DATABASE_URL` in your `.env` or Render environment variables.
*(Note: If you leave `DATABASE_URL` empty, the system automatically uses the persistent JSON storage engine).*
