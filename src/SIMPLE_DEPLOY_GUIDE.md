# 🎯 Simple Deploy Guide - The Fastest Way

## ⚡ THE SIMPLEST SOLUTION (Recommended)

Instead of deploying locally, use the **Supabase CLI through the web terminal**!

---

## 📋 Option 1: Deploy via Supabase Dashboard (Built-in Terminal)

### **Step 1: Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/shspfbpqdctargcjhnke
2. Click **SQL Editor** in the left sidebar

### **Step 2: Push Code to GitHub**
Since your Edge Function code is in Figma Make, the easiest way is:

1. **Download your project from Figma Make** (if there's an export button)
2. **Push to GitHub** - Create a new repo and upload your code
3. **Use Supabase GitHub Integration** to auto-deploy

---

## 📋 Option 2: Manual Deploy via Local CLI (What We Were Trying)

### **The Problem:**
We got stuck on PowerShell execution policy errors when trying to run the setup script.

### **The Fix:**
Instead of running `.ps1` scripts, let's do it **step-by-step manually**:

### **Step 1: Initialize Supabase**
Open PowerShell in `C:\Users\mlbr\bespoke-metal-prints` and run:

```powershell
supabase init
```

### **Step 2: Login to Supabase**
```powershell
supabase login
```

This will open your browser. Log in to Supabase.

### **Step 3: Link Your Project**
```powershell
supabase link --project-ref shspfbpqdctargcjhnke
```

### **Step 4: Copy the Edge Function Files**

You need to create these 10 files in `C:\Users\mlbr\bespoke-metal-prints\supabase\functions\make-server\`:

1. `index.tsx`
2. `admin.tsx`
3. `auth.tsx`
4. `checkout.tsx`
5. `customer.tsx`
6. `email.tsx`
7. `kv_store.tsx`
8. `seed.tsx`
9. `shipping-config.tsx`
10. `webhooks.tsx`

**How to get these files:**
- If Figma Make has a "Download" or "Export" button, use that
- Otherwise, I can show you the contents of each file to copy/paste

### **Step 5: Deploy**
```powershell
supabase functions deploy make-server
```

### **Step 6: Test**
Open this URL in your browser:
```
https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server/make-server-3e3a9cd7/ping
```

You should see:
```json
{"success":true,"message":"pong","timestamp":"..."}
```

---

## 📋 Option 3: I Help You Copy Files Manually

If you can't export from Figma Make, I can:

1. Show you the contents of each of the 10 files
2. You create them manually in Notepad or VS Code
3. Save them to `C:\Users\mlbr\bespoke-metal-prints\supabase\functions\make-server\`
4. Then deploy with `supabase functions deploy make-server`

---

## 🤔 Which Option Do You Prefer?

**Option 1** (GitHub Integration): Easiest, but requires GitHub account  
**Option 2** (Manual CLI Steps): Medium difficulty, requires copying files  
**Option 3** (Manual File Creation): Most work, but guaranteed to work

**Let me know which option you want to pursue and I'll guide you through it!** 🚀
