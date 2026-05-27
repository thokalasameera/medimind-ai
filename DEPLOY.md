# MediMind AI — One Link for LinkedIn

**Live site:** https://medimind-ai-three.vercel.app  
**Backend API:** https://medimind-backend-g6el.onrender.com/api

---

## Step 1 — Get your Render backend URL

1. Open [Render Dashboard](https://dashboard.render.com)
2. Click your **backend** service
3. Copy the URL (example: `https://medimind-api.onrender.com`)
4. Test: open `https://YOUR-BACKEND.onrender.com/api/health` — should show `"status": "healthy"`

---

## Step 2 — Connect Vercel to Render

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Click your **MediMind** project
3. **Settings** → **Environment Variables**
4. Add these (replace with your real URLs):

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com/api` |
| `VITE_ML_API_URL` | `https://YOUR-ML.onrender.com` |

5. **Deployments** → click **⋯** on latest → **Redeploy**

---

## Step 3 — Set Render backend env

In Render → your backend → **Environment**:

| Key | Value |
|-----|--------|
| `FRONTEND_URL` | `https://YOUR-APP.vercel.app` |
| `JWT_SECRET` | any long random string |
| `PORT` | `5000` (Render sets this automatically) |

Save → Render will redeploy.

---

## Step 4 — ML service (optional, for chatbot & predictions)

Deploy `ml_service` folder as a **second** Render Web Service:

- **Build:** `pip install -r requirements.txt && python train_models.py`
- **Start:** `gunicorn app:app --bind 0.0.0.0:$PORT`

Add that URL as `VITE_ML_API_URL` in Vercel.

---

## LinkedIn link

Put this on your profile:

```
https://YOUR-APP.vercel.app
```

That one link opens the full website. Login, dashboard, and profile work when backend is connected.

---

## Push code updates to GitHub

```powershell
cd "C:\Users\SAMEERA THOKALA\OneDrive\ai  healthcare"
git add .
git commit -m "Connect Vercel frontend to Render backend"
git push
```

Vercel auto-redeploys after push.
