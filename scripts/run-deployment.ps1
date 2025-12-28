# PowerShell script to run deployment on remote server
$sshCommand = @"
cd ~/New-Warungin
git pull origin main
chmod +x scripts/complete-deployment.sh
bash scripts/complete-deployment.sh
"@

wsl bash -c "sshpass -p 123 ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 'echo 123 | su - -c `"$sshCommand`"'"

