# 🔧 Supabase & Vercel Setup Guide

## 📋 Problem Summary
Your tenant routing system wasn't working because:
1. ❌ **No redirect for root URL** - Visiting the domain without `?tenant=` showed inventory instead of admin panel
2. ❌ **Supabase connection issues** - Possible RLS/authentication problems preventing login
3. ❌ **Vercel not configured** - Missing environment variables and routing rules

---

## ✅ What We Fixed

### 1. **Vercel Configuration** (`vercel.json`)
- ✅ Added environment variable setup
- ✅ Configured redirects for root path
- ✅ Added cache control headers
- ✅ Set up proper CORS headers

### 2. **Redirect Logic** (`redirect-root.html`)
- ✅ Root URL (no tenant) → `/drim_admin.html` (Admin Panel)
- ✅ URL with `?tenant=xxx` → `/index.html?tenant=xxx` (Inventory App)

### 3. **Middleware** (`middleware.js`)
- ✅ Tenant detection from query params
- ✅ Tenant detection from subdomain
- ✅ Proper routing logic

---

## 🚀 Setup Steps

### **Step 1: Supabase Configuration**

#### 1A. Set Environment Variables in Vercel
Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add these:
```
SUPABASE_URL=https://bxtajzmdeigecepwtzss.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### 1B. Run Supabase SQL (One-time only)
Go to your **Supabase Project** → **SQL Editor** → Paste & Run:

```sql
-- 1. Settings table
CREATE TABLE IF NOT EXISTS drim_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
ALTER TABLE drim_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON drim_settings FOR ALL USING (true) WITH CHECK (true);

-- 2. Tenants table
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
CREATE POLICY "Allow all" ON tenants FOR ALL USING (true) WITH CHECK (true);

-- 3. Tenant data table (sharded by tenant_slug)
CREATE TABLE IF NOT EXISTS tenant_data (
  id TEXT NOT NULL,
  tenant_slug TEXT,
  data TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, tenant_slug)
);
ALTER TABLE tenant_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON tenant_data FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_tenant_slug ON tenant_data(tenant_slug);
```

#### 1C. Verify Connection
1. Go to `drim_admin.html` on your Vercel site
2. You should see a "First time setup" prompt
3. Create a master password
4. ✅ If you can log in, Supabase is working!

---

### **Step 2: Fix the Login Issue**

**If you can't log in to drim_admin.html:**

#### Check 1: RLS Policies
Supabase might have stricter RLS. Verify policies in **Supabase Dashboard**:
```sql
-- Check RLS on drim_settings
SELECT * FROM pg_policies WHERE tablename = 'drim_settings';

-- If empty, re-create:
DROP POLICY IF EXISTS "Allow all" ON drim_settings;
CREATE POLICY "Allow all" ON drim_settings 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
```

#### Check 2: API Key Permissions
1. Go to **Supabase** → **Settings** → **API**
2. Copy your **anon/public key** (not the service role key)
3. Update it in **drim_admin.html** line 180-181
4. Verify the key has permissions for:
   - ✅ `drim_settings` (SELECT, INSERT, UPDATE, DELETE)
   - ✅ `tenants` (SELECT, INSERT, UPDATE, DELETE)

#### Check 3: Console Errors
Open browser DevTools (F12) → **Console** tab:
- Look for network errors when trying to login
- Common error: `CORS error` or `401 Unauthorized`
- Solution: Check API key and RLS policies

---

### **Step 3: Test Tenant Routing**

#### Test 1: Admin Panel Access
```
https://bsginventory.vercel.app/drim_admin.html
```
✅ Should show DRIM Client Manager login

#### Test 2: Root URL Without Tenant
```
https://bsginventory.vercel.app/
```
✅ Should redirect to `/drim_admin.html`

#### Test 3: Tenant Access
```
https://bsginventory.vercel.app/?tenant=shoprite
```
✅ Should show Inventory Management with shoprite data

---

## 🐛 Troubleshooting

### **Issue: "Connection failed" when logging into admin panel**

**Solution:**
1. Check Supabase URL in `drim_admin.html` line 180
2. Verify API key in `drim_admin.html` line 181
3. Check if table `drim_settings` exists in Supabase
4. Verify RLS policy allows all operations

```sql
-- Quick check in Supabase SQL editor:
SELECT * FROM drim_settings LIMIT 1;
```

### **Issue: Root URL not redirecting to admin panel**

**Solution:**
1. Verify `redirect-root.html` exists in repo
2. Check `vercel.json` redirects are active
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try incognito window

### **Issue: Tenant links only show inventory (no multi-tenant)**

**Solution:**
1. Verify `index.html` has tenant detection code (search for `?tenant=`)
2. Check if `tenant_data` table exists in Supabase
3. Verify tenant has data in `tenant_data` table
4. Use "Migrate/Repair Data" button in admin panel

---

## 📱 How to Test Multi-Tenant

### 1. Create a Test Tenant
1. Go to `https://bsginventory.vercel.app/drim_admin.html`
2. Login with your master password
3. Click **Add** → Create new client:
   - Company: "Test Corp"
   - Slug: `testcorp`
   - Plan: Starter
   - Click **Create**

### 2. Access as Tenant
1. Copy the provided link: `https://bsginventory.vercel.app/?tenant=testcorp`
2. Open in new tab
3. Login with: `username: director`, `password: testcorp@2026`
4. ✅ Should see inventory management interface

### 3. Access Admin Panel Again
1. Go to `https://bsginventory.vercel.app/`
2. ✅ Should redirect to admin panel automatically

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel routing & environment config |
| `middleware.js` | Tenant detection logic |
| `redirect-root.html` | Root URL redirect handler |
| `drim_admin.html` | Admin panel for managing tenants |
| `index.html` | Inventory app (per-tenant) |

---

## 🎯 Quick Checklist

- [ ] Supabase tables created (drim_settings, tenants, tenant_data)
- [ ] RLS policies enabled on all tables
- [ ] Environment variables set in Vercel
- [ ] Can login to drim_admin.html
- [ ] Root URL redirects to /drim_admin.html
- [ ] Can create a test tenant
- [ ] Can access tenant with ?tenant= parameter
- [ ] Inventory data syncs correctly

---

## 📞 Support

If issues persist:
1. Check Supabase **SQL Editor** for table existence
2. Check Vercel **Deployments** for latest version
3. Check browser **DevTools Console** for errors
4. Verify API key has proper permissions

**Last updated:** 2026-07-15
