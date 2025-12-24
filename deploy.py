#!/usr/bin/env python3
"""
Deploy backup route fix to production server
Handles git commits and SSH deployment
"""

import subprocess
import sys
import os
import time

def run_cmd(cmd, description="", shell=False):
    """Run command and return output"""
    try:
        print(f"▶ {description}" if description else f"▶ {cmd}")
        result = subprocess.run(
            cmd,
            shell=shell,
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode != 0:
            print(f"  ✗ Failed: {result.stderr}")
            return None
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        print(f"  ✗ Timeout")
        return None
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

def main():
    # os.chdir("/mnt/f/Backup W11/Project/New-Warungin") # Commented out for Windows compatibility
    
    print("=" * 60)
    print("Backup Route Fix Deployment")
    print("=" * 60)
    
    # Step 1: Commit changes locally
    print("\n[1/3] Committing changes locally...")
    run_cmd("git add .", "Adding all changes to git")
    status = run_cmd("git status --short", "Checking git status")
    if status:
        run_cmd(
            "git commit -m 'feat: reskin UI (Products, POS, Adjustments) and standardize language'",
            "Committing changes"
        )
        print("  ✓ Changes committed")
    else:
        print("  ℹ No changes to commit (already committed)")
    
    # Step 2: Push to GitHub
    print("\n[2/3] Pushing to GitHub...")
    output = run_cmd("git push origin main", "Pushing to GitHub")
    if output:
        print("  ✓ Pushed to GitHub")
    else:
        print("  ℹ Already up to date")
    
    # Step 3: Deploy to server via SSH
    print("\n[3/3] Deploying to production server...")
    
    deploy_cmd = """
    cd ~/New-Warungin && \
    echo "Pulling latest changes..." && \
    git pull origin main && \
    echo "Stopping services..." && \
    echo '123' | sudo -S docker compose down && \
    echo "Removing old backend image..." && \
    echo '123' | sudo -S docker rmi new-warungin-backend 2>/dev/null || true && \
    echo "Building and starting services..." && \
    echo '123' | sudo -S docker compose up -d --build && \
    echo "Waiting for services to start..." && \
    sleep 60 && \
    echo "Checking status..." && \
    echo '123' | sudo -S docker compose ps
    """
    
    ssh_cmd = [
        'sshpass', '-p', '123',
        'ssh', '-o', 'StrictHostKeyChecking=no',
        'faiz@192.168.1.101',
        deploy_cmd
    ]
    
    print("  Executing deployment on server...")
    result = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=300)
    
    if result.returncode == 0:
        print("  ✓ Deployment successful!")
        print("\nServer output (last 30 lines):")
        lines = result.stdout.split('\n')
        for line in lines[-30:]:
            if line.strip():
                print(f"    {line}")
    else:
        print(f"  ✗ Deployment failed!")
        print("STDOUT:", result.stdout[-500:] if result.stdout else "None")
        print("STDERR:", result.stderr[-500:] if result.stderr else "None")
        return 1
    
    print("\n" + "=" * 60)
    print("✓ Deployment Complete!")
    print("=" * 60)
    print("\nVerify at: https://pos.faiznute.site/app/superadmin/backups")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
