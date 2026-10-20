@echo off
title Khoi dong He Thong Quan Ly Trung Tam
echo =======================================================
echo KHOI DONG HE THONG QUAN LY TRUNG TAM GIAO DUC
echo =======================================================
echo [1/2] Dang khoi dong Backend .NET Web API (Port 5120)...
start "Dotnet Backend (Port 5120)" cmd /k "cd /d %~dp0dotnet_backend && dotnet run --launch-profile http"

echo [2/2] Dang khoi dong Frontend React Vite (Port 5173)...
start "Frontend React (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =======================================================
echo DA KHOI DONG XONG 2 DICH VU TRONG 2 CUA SO RIENG BIET:
echo - Backend .NET:  http://localhost:5120
echo - Frontend Web:  http://localhost:5173
echo =======================================================
pause
