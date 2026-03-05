# 🚀 Edge Function Deployment Instructions

## Current Status
✅ Supabase CLI installed  
✅ Project folder created: `C:\Users\mlbr\bespoke-metal-prints`  
⏳ **Next:** Copy files and deploy

---

## 📋 Quick Deployment Steps

### **Step 1: Download Project Files**

In Figma Make, download this project as a ZIP file or copy the Edge Function files to your local machine.

You need to copy these 10 files from Figma Make to your local folder:

```
C:\Users\mlbr\bespoke-metal-prints\
└── supabase\
    └── functions\
        └── make-server\
            ├── index.tsx
            ├── admin.tsx
            ├── auth.tsx
            ├── checkout.tsx
            ├── customer.tsx
            ├── email.tsx
            ├── kv_store.tsx
            ├── seed.tsx
            ├── shipping-config.tsx
            └── webhooks.tsx
```

### **Step 2: Open PowerShell in Your Project Folder**

1. Open File Explorer
2. Navigate to: `C:\Users\mlbr\bespoke-metal-prints`
3. **Shift + Right-click** in the empty space
4. Select **"Open PowerShell window here"**

### **Step 3: Initialize Supabase**

Run this command to create the Supabase configuration:

```powershell
supabase init
```

This will create a `supabase/config.toml` file and other configuration files.

### **Step 4: Login to Supabase**

```powershell
supabase login
```

This will open your browser and ask you to authenticate.

### **Step 5: Link Your Project**

```powershell
supabase link --project-ref shspfbpqdctargcjhnke
```

### **Step 6: Deploy the Edge Function**

```powershell
supabase functions deploy make-server
```

You should see output like:
```
Deploying Function make-server (project-ref: shspfbpqdctargcjhnke)...
Bundling make-server
Deploying make-server (Deployment ID: ...)
Deployed!
```

### **Step 7: Wait and Test**

- Wait **30 seconds** for the function to fully initialize
- Go back to your website and **refresh the browser**
- Try accessing Stock Photos or Admin Login again

---

## ⚡ FASTEST METHOD: Let Me Create the Files For You

If you want, I can create a PowerShell script that will:
1. Automatically create all the Edge Function files in the correct folder structure
2. Download the contents from Figma Make
3. Save them to your local machine

**Would you like me to create this automated script for you?**

Just say "yes" and I'll generate a `setup.ps1` script that does everything automatically!

---

## 🔍 Verify Deployment

After deploying, test the Edge Function:

```powershell
curl https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server/make-server-3e3a9cd7/ping
```

You should get:
```json
{"success":true,"message":"pong","timestamp":"2026-01-24T..."}
```

---

## ❌ Troubleshooting

### "supabase: command not found"
- Close and reopen PowerShell
- Scoop might need to be added to your PATH
- Try: `scoop install supabase` again

### "Project not found"
- Make sure you're logged in: `supabase login`
- Check project reference: `shspfbpqdctargcjhnke`

### Deployment fails
- Check that all 10 files exist in `supabase/functions/make-server/`
- Make sure you ran `supabase init` first
- Verify you're in the correct folder: `C:\Users\mlbr\bespoke-metal-prints`

---

## 📞 Need Help?

If you get stuck at any step, let me know and I'll help you troubleshoot!
