@echo off
echo ===================================
echo Membangun Aplikasi Vinance ke .apk
echo ===================================

echo.
echo [1/3] Membangun web assets (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo Gagal membangun web assets.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Sinkronisasi ke project Android (npx cap sync android)...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Gagal sinkronisasi dengan Capacitor.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Membangun APK Debug (gradlew assembleDebug)...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo Gagal membangun APK.
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ===================================
echo Build Selesai!
echo File APK berhasil dibuat.
echo.
echo Lokasi APK Debug:
echo %CD%\android\app\build\outputs\apk\debug\app-debug.apk
echo ===================================
pause
