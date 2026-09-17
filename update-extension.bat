@echo off
title Updating Rahul Scripts 3.0 PRO - Viral Video AI Studio
echo ========================================================
echo   Rahul Scripts 3.0 PRO - Auto-Update Assistant
echo ========================================================
echo.
echo [1/3] Fetching latest updates from GitHub...
git pull origin main
if %errorlevel% neq 0 (
    echo.
    echo [NOTE] If git pull failed, download latest ZIP from:
    echo https://github.com/rahulmaithili/viral-video-seo-chrome-extension/archive/refs/heads/main.zip
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Building updated extension files...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed. Please run "npm install" first.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Update Complete!
echo ========================================================
echo  SUCCESS! Extension has been updated to the latest version.
echo  Please go to chrome://extensions/ and click Reload (icon) on Viral Video AI Studio.
echo ========================================================
pause
