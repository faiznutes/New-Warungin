@echo off
echo Starting deployment via WSL...

wsl sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 "cd ~/New-Warungin && git pull origin main && echo 'Stopping services...' && echo '123' | sudo -S docker compose down && echo 'Removing backend image...' && echo '123' | sudo -S docker rmi new-warungin-backend 2>/dev/null || true && echo 'Starting services...' && echo '123' | sudo -S docker compose up -d --build && echo 'Checking health...' && sleep 10 && echo '123' | sudo -S docker compose ps"

echo.
echo Deployment command finished.
pause
