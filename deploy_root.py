import pty
import os
import sys
import time
import select
import subprocess

# Commands to run on server
commands = [
    "su -",
    "cd /root/New-Warungin || cd /home/faiz/New-Warungin",
    "git config --global --add safe.directory '*'",
    "git pull origin main",
    "docker compose down",
    "docker rmi new-warungin-backend new-warungin-frontend 2>/dev/null || true",
    "docker compose up -d --build --remove-orphans",
    "sleep 5",
    "docker compose ps",
    "exit", # exit root
    "exit"  # exit ssh
]

def read_until(fd, pattern, timeout=10):
    buffer = b""
    start = time.time()
    while time.time() - start < timeout:
        r, _, _ = select.select([fd], [], [], 0.1)
        if fd in r:
            data = os.read(fd, 1024)
            if not data:
                break
            buffer += data
            sys.stdout.buffer.write(data)
            sys.stdout.flush()
            if pattern.encode() in buffer:
                return True
    return False

def verify_python_pty():
    pid, fd = pty.fork()
    if pid == 0:
        # Child: Start SSH
        os.execlp("ssh", "ssh", "-o", "StrictHostKeyChecking=no", "faiz@192.168.1.101")
    else:
        # Parent
        try:
            # 1. SSH Password
            if read_until(fd, "password:"):
                os.write(fd, b"123\n")
            
            # 2. User shell prompt (likely $ or faiz@)
            time.sleep(1) # wait for login
            
            # 3. Switch to root
            os.write(fd, b"su -\n")
            
            # 4. Root Password
            if read_until(fd, "Password:"):
                os.write(fd, b"123\n")
            
            time.sleep(1) # wait for root shell
            
            # 5. Run commands
            for cmd in commands[1:]:
                print(f"\n[SENDING] {cmd}")
                os.write(fd, cmd.encode() + b"\n")
                time.sleep(2) # Give time for execution
                
                # Simple loop to read output
                while True:
                    r, _, _ = select.select([fd], [], [], 0.5)
                    if not r:
                        break # No more output for now
                    data = os.read(fd, 1024)
                    sys.stdout.buffer.write(data)
                    sys.stdout.flush()
                    
        except Exception as e:
            print(f"Error: {e}")
        finally:
            os.close(fd)

if __name__ == "__main__":
    verify_python_pty()
