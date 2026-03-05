# ============================================
# Bespoke Metal Prints - Edge Function Setup
# ============================================
# This script creates the folder structure for deploying the Edge Function
# Author: Figma Make AI Assistant
# Date: 2026-01-24

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Bespoke Metal Prints - Setup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get the current directory
$projectRoot = Get-Location
Write-Host "📁 Project Root: $projectRoot" -ForegroundColor Green
Write-Host ""

# Step 1: Create folder structure
Write-Host "📂 Step 1: Creating folder structure..." -ForegroundColor Yellow
$functionsPath = Join-Path $projectRoot "supabase\functions\make-server"

if (Test-Path $functionsPath) {
    Write-Host "   ✅ Folder already exists: $functionsPath" -ForegroundColor Green
} else {
    New-Item -ItemType Directory -Path $functionsPath -Force | Out-Null
    Write-Host "   ✅ Created folder: $functionsPath" -ForegroundColor Green
}
Write-Host ""

# Step 2: Download files from Figma Make
Write-Host "📥 Step 2: Downloading Edge Function files from Figma Make..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: You need to download the Edge Function files from Figma Make" -ForegroundColor Red
Write-Host ""
Write-Host "   To download the files:" -ForegroundColor White
Write-Host "   1. Go to your Figma Make project" -ForegroundColor White
Write-Host "   2. Click the 'Export' or 'Download' button" -ForegroundColor White
Write-Host "   3. Download the project as a ZIP file" -ForegroundColor White
Write-Host "   4. Extract the ZIP file" -ForegroundColor White
Write-Host "   5. Copy the contents of 'supabase/functions/make-server/' to:" -ForegroundColor White
Write-Host "      $functionsPath" -ForegroundColor Cyan
Write-Host ""

# List of required files
$requiredFiles = @(
    "index.tsx",
    "admin.tsx",
    "auth.tsx",
    "checkout.tsx",
    "customer.tsx",
    "email.tsx",
    "kv_store.tsx",
    "seed.tsx",
    "shipping-config.tsx",
    "webhooks.tsx"
)

Write-Host "   Required files (10 total):" -ForegroundColor White
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $functionsPath $file
    if (Test-Path $filePath) {
        Write-Host "   ✅ $file (exists)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (missing)" -ForegroundColor Red
    }
}
Write-Host ""

# Check if all files exist
$allFilesExist = $true
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $functionsPath $file
    if (-not (Test-Path $filePath)) {
        $allFilesExist = $false
        break
    }
}

if (-not $allFilesExist) {
    Write-Host "⚠️  Some files are missing. Please copy them from Figma Make before continuing." -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✅ All Edge Function files are in place!" -ForegroundColor Green
Write-Host ""

# Step 3: Initialize Supabase (if needed)
Write-Host "🔧 Step 3: Checking Supabase configuration..." -ForegroundColor Yellow
$supabaseConfigPath = Join-Path $projectRoot "supabase\config.toml"

if (Test-Path $supabaseConfigPath) {
    Write-Host "   ✅ Supabase already initialized" -ForegroundColor Green
} else {
    Write-Host "   ⚙️  Initializing Supabase..." -ForegroundColor Cyan
    try {
        supabase init
        Write-Host "   ✅ Supabase initialized successfully" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Error initializing Supabase: $_" -ForegroundColor Red
        Write-Host "   Please run 'supabase init' manually" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 4: Check if logged in
Write-Host "🔑 Step 4: Checking Supabase login..." -ForegroundColor Yellow
try {
    $loginCheck = supabase projects list 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Already logged in to Supabase" -ForegroundColor Green
    } else {
        throw "Not logged in"
    }
} catch {
    Write-Host "   ⚠️  Not logged in. Opening login..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   A browser window will open. Please login to Supabase." -ForegroundColor Cyan
    Write-Host ""
    try {
        supabase login
        Write-Host "   ✅ Login successful" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Login failed: $_" -ForegroundColor Red
        Write-Host "   Please run 'supabase login' manually" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 5: Link project
Write-Host "🔗 Step 5: Linking to Supabase project..." -ForegroundColor Yellow
$projectRef = "shspfbpqdctargcjhnke"

try {
    supabase link --project-ref $projectRef
    Write-Host "   ✅ Project linked: $projectRef" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Project may already be linked (this is okay)" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Deploy
Write-Host "🚀 Step 6: Deploying Edge Function..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   This will deploy the 'make-server' function to Supabase." -ForegroundColor White
Write-Host "   This may take 30-60 seconds..." -ForegroundColor White
Write-Host ""

$deploy = Read-Host "   Ready to deploy? (y/n)"
if ($deploy -eq "y" -or $deploy -eq "Y") {
    try {
        Write-Host ""
        Write-Host "   Deploying..." -ForegroundColor Cyan
        supabase functions deploy make-server
        
        Write-Host ""
        Write-Host "   ✅ Deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "   ⏳ Please wait 30 seconds for the function to fully initialize..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Write-Host "   ⏳ 25 seconds remaining..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Write-Host "   ⏳ 20 seconds remaining..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Write-Host "   ⏳ 15 seconds remaining..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Write-Host "   ⏳ 10 seconds remaining..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Write-Host "   ⏳ 5 seconds remaining..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Write-Host ""
        
    } catch {
        Write-Host "   ❌ Deployment failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Press any key to exit..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
} else {
    Write-Host "   Deployment cancelled." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   To deploy manually later, run:" -ForegroundColor White
    Write-Host "   supabase functions deploy make-server" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

# Step 7: Test the deployment
Write-Host "✅ Step 7: Testing deployment..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Testing ping endpoint..." -ForegroundColor Cyan

$pingUrl = "https://shspfbpqdctargcjhnke.supabase.co/functions/v1/make-server/make-server-3e3a9cd7/ping"

try {
    $response = Invoke-RestMethod -Uri $pingUrl -Method Get
    if ($response.success -eq $true) {
        Write-Host "   ✅ Edge Function is responding!" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  Edge Function responded but returned unexpected data" -ForegroundColor Yellow
        Write-Host "   Response: $($response | ConvertTo-Json)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Edge Function test failed: $_" -ForegroundColor Red
    Write-Host "   This might be normal if the function is still initializing." -ForegroundColor Yellow
    Write-Host "   Wait a few more seconds and test manually in your browser." -ForegroundColor Yellow
}
Write-Host ""

# Final instructions
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " 🎉 Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Go to your website and REFRESH the browser (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "2. Try accessing Stock Photos or Admin Login" -ForegroundColor White
Write-Host "3. The Edge Function should now be working!" -ForegroundColor White
Write-Host ""
Write-Host "If you still see errors:" -ForegroundColor Yellow
Write-Host "- Wait another 30 seconds (functions can take time to start)" -ForegroundColor Yellow
Write-Host "- Check deployment logs: supabase functions list" -ForegroundColor Yellow
Write-Host "- View function logs: supabase functions logs make-server" -ForegroundColor Yellow
Write-Host ""
Write-Host "Test URL:" -ForegroundColor White
Write-Host "$pingUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
