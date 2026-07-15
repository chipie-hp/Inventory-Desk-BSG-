# ⚡ QUICK SETUP - Copy & Paste Steps

## 🔴 STEP 1: Supabase SQL Setup (2 minutes)

### 1. Go to Supabase Dashboard
- Open: https://supabase.com/dashboard
- Select your project (bxtajzmdeigecepwtzss)
- Click **SQL Editor** (left sidebar)

### 2. Click "New Query" and PASTE THIS EXACTLY:

```sql
-- DROP EXISTING (if you want fresh start)
-- DROP TABLE IF EXISTS tenant_data CASCADE;
-- DROP TABLE IF EXISTS tenants CASCADE;
-- DROP TABLE IF EXISTS drim_settings CASCADE;

-- 1️⃣ SETTINGS TABLE
CREATE TABLE IF NOT EXISTS drim_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
ALTER TABLE drim_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all" ON drim_settings;
CREATE POLICY "allow_all" ON drim_settings FOR ALL USING (true) WITH CHECK (true);

-- 2️⃣ TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
  slug TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  tagline TEXT DEFAULT 'Inventory Desk',
  admin_email TEXT,
  plan TEXT DEFAULT 'starter',
  billing_cycle TEXT DEFAULT 'monthly',
  accent_color TEXT DEFAULT '#d4a843',
  plan_status TEXT DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  color_history TEXT DEFAULT '[]',
  director_username TEXT DEFAULT 'director',
  director_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all" ON tenants;
CREATE POLICY "allow_all" ON tenants FOR ALL USING (true) WITH CHECK (true);

-- 3️⃣ TENANT DATA TABLE (stores per-tenant data)
CREATE TABLE IF NOT EXISTS tenant_data (
  id TEXT NOT NULL,
  tenant_slug TEXT,
  data TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, tenant_slug)
);
ALTER TABLE tenant_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all" ON tenant_data;
CREATE POLICY "allow_all" ON tenant_data FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_tenant_slug ON tenant_data(tenant_slug);
```

### 3. Click **"Run"** button
- ✅ Should show "Success"
- ❌ If error: Check the error message

### 4. Verify Tables Were Created
- Click **"Table Editor"** (left sidebar)
- You should see 3 new tables:
  - `drim_settings`
  - `tenants`
  - `tenant_data`

---

## 🔵 STEP 2: Get Your Supabase API Key (1 minute)

### 1. In Supabase Dashboard, click **Settings** (bottom left)

### 2. Go to **API** tab

### 3. Copy these 2 values:
```
Project URL:     https://bxtajzmdeigecepwtzss.supabase.co
Anon Key:        eyJhbGc... (starts with "eyJ", very long string)
```

**⚠️ KEEP THESE SAFE - YOU'LL NEED THEM NEXT**

---

## 🟢 STEP 3: Vercel Environment Variables (2 minutes)

### 1. Go to Vercel Dashboard
- Open: https://vercel.com/dashboard
- Find your project: **bsginventory**
- Click on it

### 2. Go to **Settings** tab (top)

### 3. Click **Environment Variables** (left sidebar)

### 4. Add TWO new variables:

**First Variable:**
- Name: `SUPABASE_URL`
- Value: `https://bxtajzmdeigecepwtzss.supabase.co`
- Environments: Check all 3 boxes (Production, Preview, Development)
- Click **"Add"**

**Second Variable:**
- Name: `SUPABASE_ANON_KEY`
- Value: (paste the long Anon Key from Step 2)
- Environments: Check all 3 boxes
- Click **"Add"**

### 5. Redeploy Your Project
- Go back to **Deployments** tab
- Click the 3 dots (**...**) on the latest deployment
- Click **"Redeploy"**
- Wait for it to finish (green checkmark)

---

## 🟡 STEP 4: Test Everything (2 minutes)

### Test 1: Can you access admin panel?
```
https://bsginventory.vercel.app/drim_admin.html
```
- ✅ Should show **"DRIM"** login screen
- ❌ If blank or error → Check Supabase connection

### Test 2: Does root redirect work?
```
https://bsginventory.vercel.app/
```
- ✅ Should redirect to `/drim_admin.html`
- ❌ If shows inventory → Vercel not redeployed yet

### Test 3: Can you create a password?
1. Visit `/drim_admin.html`
2. You should see: **"First time setup. Create your master password."**
3. Enter password: `admin123` (for testing)
4. Confirm: `admin123`
5. Click **"Create password & continue"**
6. ✅ Should log in and show clients list

---

## 🔴 TROUBLESHOOTING

### "Connection failed" Error
**Problem:** Can't connect to Supabase
**Solution:**
1. Check Supabase API key in Vercel (Step 3, is it pasted correctly?)
2. Check Supabase URL doesn't have typos
3. Vercel → **Redeploy** again
4. Wait 30 seconds and refresh browser

### "Table not found" Error
**Problem:** Tables weren't created
**Solution:**
1. Go to Supabase → **Table Editor**
2. Check if you see `drim_settings`, `tenants`, `tenant_data`
3. If not → Run the SQL from STEP 1 again

### Still shows "Inventory" instead of redirecting to admin
**Problem:** Vercel redeploy didn't work
**Solution:**
1. Go to Vercel → **Settings** → **Git**
2. Disconnect and reconnect GitHub
3. Manually redeploy from Deployments tab
4. Clear browser cache (Ctrl+Shift+Delete)

### Can't see my master password login screen
**Problem:** First time setup not showing
**Solution:**
1. Go to Supabase → **Table Editor**
2. Click `drim_settings` table
3. Check if there's any data in it
4. If yes → Delete it and refresh browser
5. If no → Wait 10 seconds and refresh

---

## ✅ SUCCESS CHECKLIST

When everything is working, you should be able to:

- [ ] Visit `bsginventory.vercel.app/` and see redirect to admin panel
- [ ] Visit `bsginventory.vercel.app/drim_admin.html` and see login screen
- [ ] Create master password (first time setup)
- [ ] Log in with that password
- [ ] See "No clients yet" message
- [ ] Click "Add first client" and add a test company
- [ ] Get a link like `bsginventory.vercel.app/?tenant=testcompany`
- [ ] Open that link and log in as `director` with password `testcompany@2026`
- [ ] See inventory management interface

---

## 📱 NEED HELP?

Open browser **Console** (F12 → Console tab) and look for:
- Red errors about Supabase
- CORS errors
- Network errors

**Copy the error and I can help fix it!**

---

**Estimated Total Time: 10-15 minutes** ⏱️
