@echo off
echo ====================================================
echo  WARUNGIN PRODUCTION DEPLOYMENT (WSL + SSHPASS)
echo ====================================================
echo.

wsl sshpass -p '123' ssh -o StrictHostKeyChecking=no -t faiz@192.168.1.101 "echo '123' | sudo -S -i bash -c 'echo [INFO] Switched to ROOT && cd /home/faiz/New-Warungin && echo [INFO] Pulling code... && git pull origin main && echo [INFO] Rebuilding services... && docker compose down && docker compose up -d --build --remove-orphans && echo [INFO] Checking status... && sleep 5 && docker compose ps'"

echo.
echo ====================================================
echo  DEPLOYMENT COMMAND COMPLETED
echo ====================================================
pause
