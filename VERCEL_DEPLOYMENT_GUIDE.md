# 🚀 Vercel Deployment Guide - Neon Database

## 📋 Deployment Summary

Your Daily Flow app has been successfully migrated from Supabase to Neon database and is ready for Vercel deployment!

### ✅ Architecture Overview:
- **Frontend**: React/Vite app (deployed to Vercel)
- **Backend**: Express.js API server (deployed to Vercel Serverless)
- **Database**: Neon PostgreSQL (managed database)

---

## 🛠️ Step 1: Setup Database

### Execute Schema on Neon:
1. Go to your Neon dashboard
2. Open the SQL Editor
3. Run the contents of `neon-schema.sql`

This creates: `users`, `tasks`, `daily_logs` tables with proper indexes.

---

## 🔧 Step 2: Environment Variables

### For Vercel Frontend:
```bash
# Vercel Environment Variables
NEXT_PUBLIC_API_URL=https://your-api-url.vercel.app
JWT_SECRET=generate-strong-secret-key-here
```

### For Vercel Backend (Serverless):
```bash
# Backend Environment Variables  
DATABASE_URL=postgresql://neondb_owner:npg_VheWx31sJMku@ep-broad-mode-amjnh161-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=same-strong-secret-key-as-above
```

---

## 📦 Step 3: Deploy Backend API

### Create `vercel.json` for API:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

### Deploy API:
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy API
vercel --prod
```

---

## 🌐 Step 4: Deploy Frontend

### Update `vercel.json` for Frontend:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  }
}
```

### Deploy Frontend:
```bash
vercel --prod
```

---

## ⚙️ Step 5: Update API URL in Code

### Update `src/lib/db.ts`:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

---

## 🧪 Step 6: Testing

### Test API Endpoints:
```bash
# Health check
curl https://your-api-url.vercel.app/api/health

# Test signup
curl -X POST https://your-api-url.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Frontend:
1. Visit your Vercel frontend URL
2. Try signup/login
3. Create tasks and test all features

---

## 🎯 Key Changes Made:

### Database Migration:
- ✅ Supabase → Neon PostgreSQL
- ✅ Custom JWT authentication
- ✅ Direct SQL queries via REST API

### Architecture:
- ✅ Separated frontend/backend
- ✅ REST API for database operations
- ✅ Environment-based configuration

### Features Preserved:
- ✅ Email/password authentication
- ✅ Task CRUD operations
- ✅ Task duration/end dates
- ✅ Daily logging
- ✅ Statistics and analytics

---

## 🔒 Security Notes:

1. **JWT Secret**: Use a strong, unique secret
2. **Database URL**: Keep it private in environment variables
3. **HTTPS**: Ensure all API calls use HTTPS in production
4. **CORS**: API server configured for frontend origin

---

## 🚨 Troubleshooting:

### API Connection Issues:
- Verify DATABASE_URL is correct
- Check Neon database is active
- Ensure Vercel environment variables are set

### Authentication Issues:
- Clear browser localStorage
- Verify JWT_SECRET matches between frontend/backend
- Check API server logs

### Build Issues:
- Run `npm run build` locally first
- Check all environment variables
- Verify Node.js version compatibility

---

## 📊 Performance Benefits:

✅ **Faster Queries** - Direct PostgreSQL connection  
✅ **Better Scaling** - Serverless architecture  
✅ **Cost Effective** - Neon's generous free tier  
✅ **More Control** - Custom authentication system  

Your app is now ready for production deployment on Vercel with Neon database! 🎉
