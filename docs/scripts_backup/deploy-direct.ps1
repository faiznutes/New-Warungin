
$SSH_USER = "faiz"
$SSH_HOST = "192.168.1.101"
$SSH_PASS = "123"
$REPO_URL = "https://github.com/faiznutes/New-Warungin.git"

Write-Host "🚀 Starting Deployment to $SSH_USER@$SSH_HOST..." -ForegroundColor Cyan

# Check if ssh is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Error "SSH client not found. Please enable OpenSSH Client in Windows Optional Features."
    exit 1
}

# Command to execute on the server
$RemoteScript = @"
    set -e
    
    echo "📂 Checking project directory..."
    if [ -d "Warungin" ]; then
        cd Warungin
        echo "⬇️ Pulling latest changes..."
        git pull origin main
    elif [ -d "New-Warungin" ]; then
        cd New-Warungin
        echo "⬇️ Pulling latest changes..."
        git pull origin main
    else
        echo "⚠️ Project not found. Cloning from GitHub..."
        git clone $REPO_URL Warungin
        cd Warungin
    fi

    echo "✅ Current Directory: \$(pwd)"

    echo "🔧 Copying .env if missing..."
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "Please configure .env secrets later manually if needed."
    fi

    echo "🐘 Running Database Migrations..."
    # Ensure database is reachable or use retry
    docker compose exec -T backend npx prisma migrate deploy || echo "⚠️ Migration warning (proceeding)"

    echo "🏗️ Building Backend Container..."
    docker compose build backend

    echo "🔁 Restarting Services..."
    # Recreate backend and ensure nginx picks it up
    docker compose up -d backend nginx

    echo "📜 Deployment Status:"
    docker compose ps
"@

# Execute via SSH (using ssh directly, requires password entry if no key, or we can use a trick if sshpass is not on Windows)
# Windows doesn't typically have sshpass. We'll rely on the user having key auth OR typing the password.
# However, the user provided '123' in previous scripts, suggesting password auth.
# Since we don't have WSL's sshpass, we might need to prompt or warn.
# But wait, the user's previous script `remote-deploy.ps1` TRIED to use sshpass/WSL.
# NOW WSL IS GONE.
# We will output the command for the user to paste, or try `ssh user@host "cmds"`.

Write-Host "⚠️  Note: You may be asked for the password ('$SSH_PASS')." -ForegroundColor Yellow

ssh -t $SSH_USER@$SSH_HOST "bash -c '$RemoteScript'"

Write-Host "`n✨ Connectivity Check done." -ForegroundColor Green
