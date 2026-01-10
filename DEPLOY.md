# Quick Deploy Guide - 2 Minutes Setup! 🚀

## Option 1: Render.com (EASIEST - Recommended)

### Step 1: Create Free MongoDB Database
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create a FREE cluster (M0 - Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Step 2: Deploy on Render
1. Go to https://render.com/
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect this repository: `Aurenya19/tech-mastery-fullstack`
5. Settings:
   - **Name**: tech-mastery-ritika
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variable:
   - Key: `MONGODB_URI`
   - Value: (paste your MongoDB connection string from Step 1)
7. Click "Create Web Service"
8. Wait 2-3 minutes for deployment
9. Your app will be live at: `https://tech-mastery-ritika.onrender.com`

**Done! Permanent and FREE!** ✅

---

## Option 2: Railway.app (Alternative)

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select: `Aurenya19/tech-mastery-fullstack`
5. Add MongoDB:
   - Click "New" → "Database" → "Add MongoDB"
   - Railway will auto-connect it!
6. Click "Deploy"
7. Add domain: Settings → Generate Domain
8. Your app will be live!

**Done! Permanent and FREE!** ✅

---

## Option 3: Run Locally (If you want to test first)

```bash
# 1. Install Node.js from https://nodejs.org/

# 2. Clone repository
git clone https://github.com/Aurenya19/tech-mastery-fullstack.git
cd tech-mastery-fullstack

# 3. Install dependencies
npm install

# 4. Create .env file with:
MONGODB_URI=mongodb://localhost:27017/tech-mastery
PORT=3000

# 5. Install MongoDB locally OR use MongoDB Atlas (free cloud)

# 6. Run
npm start

# 7. Open http://localhost:3000
```

---

## What You Get:

✅ **Real Backend** - Node.js + Express
✅ **Database** - MongoDB (500+ challenges auto-loaded)
✅ **Authentication** - Simple login (just enter nickname)
✅ **Progress Tracking** - All saved to database
✅ **Code Playground** - Run JavaScript code
✅ **8 Tech Fields** - Complete learning paths
✅ **Achievements** - Track your progress
✅ **Certificate** - Personalized certificate

---

## Features:

1. **Login** - Enter your nickname (no Google needed)
2. **Dashboard** - See your progress
3. **Challenges** - 500+ coding challenges
4. **Code Playground** - Write and run code
5. **Tech Fields** - Learn 8 different technologies
6. **Progress Tracking** - Everything saved automatically

---

## Need Help?

If you face any issues:
1. Check MongoDB connection string is correct
2. Make sure all environment variables are set
3. Wait 2-3 minutes for first deployment

**Your app will be PERMANENT and FREE on Render/Railway!** 🎉

---

Created with ❤️ for Ritika Saini