@echo off
echo ====================================================
echo  WARUNGIN PRODUCTION DEPLOYMENT (SCP + EXEC)
echo ====================================================
echo.

echo [1/3] Uploading deployment script...
wsl sshpass -p '123' scp -o StrictHostKeyChecking=no server_deploy.sh faiz@192.168.1.101:/tmp/server_deploy.sh

echo [2/3] Making script executable...
wsl sshpass -p '123' ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 "echo '123' | sudo -S chmod +x /tmp/server_deploy.sh"

echo [3/3] Executing deployment script as ROOT...
wsl sshpass -p '123' ssh -o StrictHostKeyChecking=no -t faiz@192.168.1.101 "echo '123' | sudo -S bash /tmp/server_deploy.sh"

echo.
echo ====================================================
echo  DEPLOYMENT COMMAND COMPLETED
echo ====================================================
pause
