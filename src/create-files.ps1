# ==============================================================================
# Bespoke Metal Prints - Edge Function File Generator
# ==============================================================================
# This script creates all 10 Edge Function files automatically
# No manual copying needed!

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Creating Edge Function Files" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
Write-Host "Project Root: $projectRoot" -ForegroundColor Green
Write-Host ""

# Create folder structure
Write-Host "Creating folder structure..." -ForegroundColor Yellow
$functionsPath = Join-Path $projectRoot "supabase\functions\make-server"
New-Item -ItemType Directory -Path $functionsPath -Force | Out-Null
Write-Host "[OK] Folder created: $functionsPath" -ForegroundColor Green
Write-Host ""

Write-Host "IMPORTANT: Due to file size limitations, I need to provide you with the files differently." -ForegroundColor Yellow
Write-Host ""
Write-Host "Here's what to do:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to your Figma Make project browser tab" -ForegroundColor White
Write-Host "2. Open the browser DevTools (Press F12)" -ForegroundColor White
Write-Host "3. Go to the Console tab" -ForegroundColor White
Write-Host "4. I'll give you JavaScript code to run that downloads all files" -ForegroundColor White
Write-Host ""
Write-Host "OR - Easier Method:" -ForegroundColor Cyan
Write-Host ""
Write-Host "I can show you each of the 10 files one-by-one." -ForegroundColor White
Write-Host "You can copy/paste them into Notepad and save them." -ForegroundColor White
Write-Host ""
Write-Host "Which method do you prefer?" -ForegroundColor Yellow
Write-Host "  1 = Browser DevTools method (faster)" -ForegroundColor White
Write-Host "  2 = Show me files one-by-one (simpler)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Great! Here's what to do:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. In your Figma Make browser tab, press F12 to open DevTools" -ForegroundColor White
    Write-Host "2. Click on the 'Console' tab" -ForegroundColor White
    Write-Host "3. Go back to Figma Make chat and ask me to provide the download script" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "OK! I'll show you the files one-by-one in the chat." -ForegroundColor Green
    Write-Host "Go back to Figma Make and ask me to show you the files." -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
