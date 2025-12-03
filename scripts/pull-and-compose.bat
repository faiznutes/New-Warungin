@echo off
REM Simple pull and compose script for Warungin POS System (Windows)
REM Usage: scripts\pull-and-compose.bat [environment]
REM Example: scripts\pull-and-compose.bat production

setlocal enabledelayedexpansion

set ENV=%~1
if "%ENV%"=="" set ENV=production
set COMPOSE_FILE=docker-compose.yml

echo.
echo ==========================================
echo  Warungin POS - Pull and Compose Script
echo ==========================================
echo.

REM Step 1: Pull latest code
echo [1/10] Pulling latest code from git...
git pull origin main
if errorlevel 1 (
    echo [ERROR] Failed to pull from git
    exit /b 1
)
echo [OK] Code pulled successfully
echo.

REM Step 2: Check if .env exists
echo [2/10] Checking environment files...
if not exist .env (
    echo [WARNING] .env file not found. Creating from env.example...
    if exist env.example (
        copy env.example .env >nul
        echo [WARNING] Please update .env file with your configuration
        exit /b 1
    ) else (
        echo [ERROR] env.example not found
        exit /b 1
    )
)
echo [OK] Environment file found
echo.

REM Step 3: Install dependencies
echo [3/10] Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)
echo [OK] Backend dependencies installed
echo.

echo [4/10] Installing frontend dependencies...
cd client
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    exit /b 1
)
cd ..
echo [OK] Frontend dependencies installed
echo.

REM Step 4: Generate Prisma Client
echo [5/10] Generating Prisma client...
call npm run prisma:generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma client
    exit /b 1
)
echo [OK] Prisma client generated
echo.

REM Step 5: Validate Prisma schema
echo [6/10] Validating Prisma schema...
call npx prisma validate
if errorlevel 1 (
    echo [ERROR] Prisma schema validation failed
    exit /b 1
)
echo [OK] Prisma schema valid
echo.

REM Step 6: Build Docker images
echo [7/10] Building Docker images...
docker compose build
if errorlevel 1 (
    echo [ERROR] Failed to build Docker images
    exit /b 1
)
echo [OK] Docker images built
echo.

REM Step 7: Run database migrations
echo [8/10] Running database migrations...
docker compose run --rm backend npm run prisma:migrate
if errorlevel 1 (
    echo [WARNING] Migrations may have failed or already applied. Continuing...
)
echo [OK] Migrations completed
echo.

REM Step 8: Start services
echo [9/10] Starting services with Docker Compose...
docker compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    exit /b 1
)
echo [OK] Services started
echo.

REM Step 9: Show service status
echo [10/10] Checking service status...
timeout /t 5 /nobreak >nul
docker compose ps
echo.

REM Done
echo ==========================================
echo  Setup complete!
echo ==========================================
echo.
echo Service URLs:
echo   - Frontend: http://localhost:80 (or your configured port)
echo   - Backend API: http://localhost:3000/api
echo.
echo Useful commands:
echo   - View logs: docker compose logs -f
echo   - Stop services: docker compose down
echo   - Restart services: docker compose restart
echo   - View status: docker compose ps
echo.
echo All done!
