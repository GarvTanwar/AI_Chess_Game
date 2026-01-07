# Backend Deployment Options

Your FastAPI backend can be deployed to multiple platforms. Here are three popular options:

---

## Option 1: Render.com (Recommended - Best Free Tier)

### Pros:
✅ Best free tier (750 hours/month)
✅ Auto-deploys from GitHub
✅ Easy setup with `render.yaml`
✅ Built-in health checks
✅ Free SSL certificates

### Cons:
❌ Spins down after 15 min inactivity (30-60s cold start)
❌ Slower than paid alternatives

### Setup Steps:

1. **Create Account**: Go to [render.com](https://render.com) and sign up

2. **Connect GitHub**: Authorize Render to access your repositories

3. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Select your `checkmate-ai` repository
   - Render will detect `render.yaml` automatically

4. **Configure (already done via render.yaml)**:
   - Name: `checkmate-ai-backend`
   - Root Directory: `backend`
   - Build Command: `chmod +x build.sh && ./build.sh`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Deploy**: Click "Create Web Service"

6. **Get URL**: After deployment, copy your URL (e.g., `https://checkmate-ai-backend.onrender.com`)

### Important Notes:
- First build takes 10-15 minutes (downloads Stockfish)
- Free tier sleeps after 15 min inactivity
- Subsequent builds are faster (cached)

---

## Option 2: Railway.app (Best Performance)

### Pros:
✅ No cold starts
✅ Fast deploys (2-3 minutes)
✅ Excellent developer experience
✅ Simple pricing ($5/month usage-based)
✅ Better performance than Render

### Cons:
❌ No free tier (trial credit only)
❌ Minimum $5/month cost

### Setup Steps:

1. **Create Account**: Go to [railway.app](https://railway.app)

2. **Get $5 Trial Credit**: Sign up with GitHub

3. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `checkmate-ai` repository

4. **Configure Service**:
   - Railway auto-detects Python
   - Root Directory: Click "Settings" → set to `backend`
   - Railway will use `railway.json` automatically

5. **Install Stockfish**:
   - Click "Settings" → "Variables"
   - Add build command: `chmod +x build.sh && ./build.sh`

6. **Deploy**: Railway deploys automatically

7. **Get URL**:
   - Click "Settings" → "Networking"
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://checkmate-ai-backend.up.railway.app`)

### Cost:
- ~$5-7/month for always-on service
- Usage-based pricing (CPU + RAM)

---

## Option 3: Heroku (Classic Choice)

### Pros:
✅ Established platform (trusted)
✅ Extensive documentation
✅ Easy to scale
✅ Good monitoring tools

### Cons:
❌ No free tier (as of 2022)
❌ $7/month minimum (Eco Dyno)
❌ Slower than Railway

### Setup Steps:

1. **Install Heroku CLI**:
   ```bash
   # Windows (using npm)
   npm install -g heroku

   # Or download installer from heroku.com
   ```

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create App**:
   ```bash
   cd c:\Users\garv1\Desktop\FunGames\ChessGame\backend
   heroku create checkmate-ai-backend
   ```

4. **Add Buildpack for Stockfish**:
   ```bash
   heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-apt
   ```

5. **Create `Aptfile`** (for Stockfish):
   ```bash
   echo "stockfish" > Aptfile
   ```

6. **Update Python Path** in `main.py`:
   ```python
   # For Heroku, Stockfish is installed via apt
   STOCKFISH_PATH = "stockfish"  # Already in PATH
   ```

7. **Set Python Version** (already done - `runtime.txt`):
   ```
   python-3.11.0
   ```

8. **Deploy**:
   ```bash
   git add .
   git commit -m "Configure for Heroku"
   git push heroku main
   ```

9. **Open App**:
   ```bash
   heroku open
   ```

10. **Get URL**: `https://checkmate-ai-backend.herokuapp.com`

### Alternative: Deploy via GitHub
1. Go to Heroku Dashboard
2. Create new app
3. Connect GitHub repository
4. Set root directory to `backend`
5. Enable automatic deploys

### Cost:
- Eco Dyno: $7/month (sleeps after 30 min)
- Basic Dyno: $7/month (always on)
- Standard: $25+/month (better performance)

---

## Comparison Table

| Feature | Render | Railway | Heroku |
|---------|--------|---------|--------|
| **Free Tier** | ✅ Yes (750 hrs) | ❌ No ($5 trial) | ❌ No |
| **Cold Starts** | 30-60s | None | 5-10s |
| **Deploy Time** | 10-15 min | 2-3 min | 5-7 min |
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | Medium | High | Medium |
| **Pricing** | Free / $7 | $5-7 | $7+ |
| **Best For** | Testing/Demo | Production | Enterprise |

---

## Recommended Choice

### For Development/Demo:
**Use Render** - Free tier is perfect for testing and sharing

### For Production:
**Use Railway** - Best performance, no cold starts, reasonable cost

### For Enterprise:
**Use Heroku** - Established, trusted, extensive tooling

---

## After Deployment - Update Frontend

Whichever platform you choose, remember to:

1. **Copy your backend URL**
2. **Update Vercel environment variable**:
   - Go to Vercel Dashboard
   - Select your project
   - Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` with your backend URL
   - Redeploy frontend

3. **Update CORS in `main.py`**:
   ```python
   allow_origins=[
       "http://localhost:3000",
       "https://your-frontend.vercel.app",
   ]
   ```

4. **Push changes**:
   ```bash
   git add backend/main.py
   git commit -m "Update CORS"
   git push
   ```

---

## Troubleshooting

### All Platforms:

**Problem**: "Stockfish not found"
- Check build logs
- Ensure build script ran successfully
- Verify Stockfish binary is executable

**Problem**: CORS errors
- Add your Vercel domain to `allow_origins`
- Restart backend service

**Problem**: Slow response
- First request after cold start is slow (expected)
- Subsequent requests should be fast
- Consider upgrading to paid tier

---

## Next Steps

1. Choose your platform (Render recommended for starting)
2. Follow the setup steps above
3. Deploy backend
4. Update frontend with backend URL
5. Test your live chess game!

Happy deploying! 🚀
