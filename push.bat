@echo off
title Push ke GitHub - Vinance
color 0B
cls

echo =======================================================
echo               PUSH KE GITHUB - VINANCE
echo =======================================================
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Git tidak ditemukan di sistem ini!
    echo Silakan install Git terlebih dahulu.
    pause
    exit /b
)

:: Show current status
echo [STATUS] Status repositori saat ini:
git status -s
echo.

:: Ask user if they want to proceed
set /p PROCEED="Apakah Anda ingin mem-push perubahan ini? (Y/N): "
if /i "%PROCEED%" neq "Y" (
    echo.
    echo [INFO] Aksi dibatalkan oleh pengguna.
    pause
    exit /b
)

:: Ask for commit message
echo.
set /p COMMIT_MSG="Masukkan pesan commit (kosongkan untuk default: 'Perbaikan bug voice button'): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Perbaikan bug voice button
)

echo.
echo [1/3] Menambahkan file ke staging...
git add .

echo [2/3] Membuat commit...
git commit -m "%COMMIT_MSG%"

echo [3/3] Mempush ke GitHub...
git push

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo =======================================================
    echo         [SUKSES] Berhasil dipush ke GitHub!
    echo =======================================================
) else (
    color 0C
    echo.
    echo =======================================================
    echo        [GAGAL] Terjadi kesalahan saat mempush!
    echo =======================================================
)

pause
