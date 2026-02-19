# 🚀 Quick Start - Cloud Database Setup

## Step 1: Choose a Database Provider

### Option A: Neon (Recommended - 2 minutes)
1. Visit: https://neon.tech
2. Sign up with GitHub/Google
3. Click "Create Project"
4. Name: `sensei-backend`
5. Copy the connection string shown

### Option B: Supabase (3 minutes)
1. Visit: https://supabase.com
2. Create new project
3. Wait 2 minutes for setup
4. Settings → Database → Connection String → URI
5. Copy the URI connection string

### Option C: Railway (2 minutes)
1. Visit: https://railway.app
2. New Project → Add PostgreSQL
3. Click on Postgres → Variables tab
4. Copy `DATABASE_URL`

---

## Step 2: Configure Database (Choose One)

### 🎯 QUICK METHOD (Automated)
```bash
./setup-db.sh 'postgresql://your-connection-string-here'
```

### 📝 MANUAL METHOD
1. Open `.env` file
2. Replace line 7:
   ```
   DATABASE_URL=your-actual-connection-string
   ```
3. Run migrations:
   ```bash
   npm run migrate
   ```

---

## Step 3: Restart Server
```bash
# Kill old server
lsof -ti:5000 | xargs kill -9

# Start fresh
npm start
```

---

## Step 4: Test It!
```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

If you see `"success":true`, you're done! ✅

---

## Connection String Examples

**Neon:**
```
postgresql://alex:AbC123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb
```

**Supabase:**
```
postgresql://postgres.abcdefg:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Railway:**
```
postgresql://postgres:password@monorail.proxy.rlwy.net:12345/railway
```

---

## Troubleshooting

❌ **Migration fails?**
- Check connection string is correct
- Ensure database is active/running
- Try connection string directly: `psql "your-connection-string" -c "SELECT 1;"`

❌ **Still getting 500 errors?**
- Check server logs in terminal
- Verify `.env` file is updated
- Restart the server

---

**Questions?** Check the full README.md or DEPLOY.md
