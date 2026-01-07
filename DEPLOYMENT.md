# Checkmate AI - Deployment Guide

## Overview
This project consists of two parts:
- **Frontend**: Next.js application (deployed to Vercel)
- **Backend**: Python FastAPI application (deployed to Render/Railway/Heroku)

---

## 📦 Prerequisites

1. **GitHub Account**: Create one at [github.com](https://github.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (use GitHub to sign in)
3. **Render Account**: Sign up at [render.com](https://render.com) (free tier available)

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
# Navigate to project root
cd c:\Users\garv1\Desktop\FunGames\ChessGame

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Checkmate AI chess game"

# Create a new repository on GitHub (go to github.com)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/checkmate-ai.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy Backend to Render

1. **Go to** [render.com](https://render.com) and sign in

2. **Create a New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `checkmate-ai`

3. **Configure the service**:
   - **Name**: `checkmate-ai-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

4. **Click "Create Web Service"**

5. **Wait for deployment** (5-10 minutes for first build with Stockfish download)

6. **Copy your backend URL** (will look like: `https://checkmate-ai-backend.onrender.com`)

---

### Step 3: Deploy Frontend to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to** [vercel.com](https://vercel.com) and sign in with GitHub

2. **Import Project**:
   - Click "Add New" → "Project"
   - Select your `checkmate-ai` repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: Your Render backend URL (e.g., `https://checkmate-ai-backend.onrender.com`)
   - Make sure it's added to **Production**, **Preview**, and **Development**

5. **Click "Deploy"**

6. **Wait for deployment** (2-3 minutes)

7. **Your site is live!** Vercel will give you a URL like: `https://checkmate-ai-xyz.vercel.app`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Login
vercel login

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter your Render backend URL when prompted

# Deploy
vercel --prod
```

---

### Step 4: Update CORS Settings

After deploying to Vercel, you need to update your backend CORS settings:

1. **Note your Vercel domain** (e.g., `checkmate-ai-xyz.vercel.app`)

2. **Update `backend/main.py`**:
   ```python
   allow_origins=[
       "http://localhost:3000",
       "https://checkmate-ai-xyz.vercel.app",  # Your Vercel domain
       # Add custom domain if you have one
   ],
   ```

3. **Commit and push changes**:
   ```bash
   git add backend/main.py
   git commit -m "Update CORS for production"
   git push
   ```

4. **Render will auto-deploy** the backend with new settings

---

## 🎮 Testing Your Deployment

1. **Visit your Vercel URL** (e.g., `https://checkmate-ai-xyz.vercel.app`)
2. **Click "Start Playing"**
3. **Select an opponent**
4. **Make a move** - if the AI responds, everything is working!

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Stockfish not found
- **Solution**: Check Render logs. The build script should download Stockfish. If it fails, try manually adding Stockfish.

**Problem**: CORS errors
- **Solution**: Make sure your Vercel domain is added to `allow_origins` in `main.py`

**Problem**: 503 Service Unavailable
- **Solution**: Render free tier spins down after inactivity. First request takes 30-60 seconds to wake up.

### Frontend Issues

**Problem**: "Failed to fetch opponents"
- **Solution**: Check that `NEXT_PUBLIC_API_URL` environment variable is set correctly in Vercel

**Problem**: Dark mode not persisting
- **Solution**: This is normal - localStorage is cleared when you redeploy. It works for users.

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Testing)
- **Vercel**: Free (Hobby plan includes 100GB bandwidth/month)
- **Render**: Free (750 hours/month, spins down after 15 min inactivity)
- **Total**: $0/month

### Paid Tier (For Production)
- **Vercel Pro**: $20/month (better performance, analytics)
- **Render Starter**: $7/month (always on, better performance)
- **Total**: $27/month

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Vercel:
1. Go to your Vercel project
2. Settings → Domains
3. Add your domain (e.g., `chessgame.com`)
4. Follow DNS configuration instructions

### Update Backend CORS:
Add your custom domain to `allow_origins` in `main.py`

---

## 📊 Monitoring

### Vercel
- Dashboard shows: Deployments, Analytics, Logs
- Access at: [vercel.com/dashboard](https://vercel.com/dashboard)

### Render
- Dashboard shows: Build logs, Runtime logs, Metrics
- Access at: [dashboard.render.com](https://dashboard.render.com)

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```

2. **Automatic deployment**:
   - Vercel deploys frontend automatically
   - Render deploys backend automatically

3. **Check deployment status** in respective dashboards

---

## Alternative Backend Hosting

### Railway.app
- Similar to Render
- $5/month minimum
- Better cold start times
- Deployment: Connect GitHub repo, Railway auto-detects Python

### Heroku
- More expensive ($7+/month)
- Requires Procfile: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

### Fly.io
- Global edge deployment
- Free tier available
- Better performance for international users

---

## 🎉 You're Done!

Your chess game is now live and accessible worldwide. Share your Vercel URL with friends and enjoy playing!

**Questions?** Check GitHub Issues or the Render/Vercel documentation.
