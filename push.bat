@echo off
setlocal enabledelayedexpansion
title Git Push Script - Vinance

echo ====================================================
echo             GIT AUTO PUSH FOR VINANCE
echo ====================================================
echo.

:: Check git status
echo Checking current git status...
git status
echo.

:: Prompt for commit message
set /p commit_msg="Enter commit message (press Enter for default: 'update'): "
if "%commit_msg%"=="" (
    set commit_msg=update
)

echo.
echo ----------------------------------------------------
echo [1/3] Adding changes to staging...
git add .

echo.
echo [2/3] Committing changes with message: "%commit_msg%"
git commit -m "%commit_msg%"

echo.
echo [3/3] Pushing changes to GitHub (origin main)...
git push origin main

echo.
echo ====================================================
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Changes pushed to GitHub successfully!
) else (
    echo [ERROR] Failed to push changes. Please check details above.
)
echo ====================================================
echo.
pause
