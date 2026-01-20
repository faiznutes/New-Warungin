#!/bin/bash

echo "Starting remote check..."

if ! command -v sshpass &> /dev/null; then
    echo "Error: sshpass is not installed in your WSL environment."
    echo "Please run: sudo apt-get update && sudo apt-get install sshpass"
    exit 1
fi

echo "Connecting to root@192.168.1.101..."
sshpass -p '123' ssh -o StrictHostKeyChecking=no root@192.168.1.101 'cd New-Warungin && echo "Connected. Checking Docker..." && if docker ps > /dev/null; then echo "Docker is running. Executing git pull..."; git pull; else echo "Docker is NOT running. Skipping pull."; fi'
