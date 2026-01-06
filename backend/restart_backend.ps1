# Script pour redémarrer le backend
Write-Host "Arret du backend existant..."
Get-Process | Where-Object {$_.ProcessName -eq "uvicorn"} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host "Demarrage du backend..."
cd "C:\Users\easys\OneDrive\Documents\Dossier\backend"
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

