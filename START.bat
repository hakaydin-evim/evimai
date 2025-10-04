@echo off
echo ========================================
echo   EvimAI - Baslat
echo ========================================
echo.

REM Backend'i baslat
start "EvimAI Backend" cmd /k "cd /d %~dp0backend && npm start"

REM 3 saniye bekle
timeout /t 3 /nobreak > nul

REM Mobile app'i baslat
start "EvimAI Mobile" cmd /k "cd /d %~dp0 && npm start"

echo.
echo ========================================
echo  Backend: http://localhost:8082
echo  Mobile: Expo QR kod ile baglan
echo  IP Adresi: 192.168.18.10:8082
echo ========================================
