# Deployment Instructions & Credentials

**Target Server:** 192.168.1.101
**User:** faiz (Switch to ROOT required)
**User Password:** 123
**Root Password:** 123
**Project Directory:** /root/New-Warungin (Confirmed)

## Deployment Steps
1. Connect via SSH to `faiz@192.168.1.101`.
2. Switch to root privileges (`sudo -i` or `su -`).
3. Navigate to `/root/New-Warungin`.
4. Run `git pull`.
5. Run `docker compose build && docker compose up -d`.

## Command Snippet (Agent Internal)
```bash
# Full Deployment Command (via WSL)
wsl sshpass -p 123 ssh -o StrictHostKeyChecking=no faiz@192.168.1.101 "echo 123 | sudo -S bash -c 'cd /root/New-Warungin && git pull && docker compose up -d --build'"
```
