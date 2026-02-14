# Warungin - Multi-Tenant POS System for UMKM

## Overview
Warungin is a modern Point-of-Sale (POS) and business management system designed for Indonesian small and medium businesses (UMKM). It features multi-tenant architecture, allowing multiple businesses to operate independently on the same platform.

## Project Architecture

### Stack
- **Backend**: Node.js + TypeScript + Express
- **Frontend**: Vue 3 + Vite + Tailwind CSS
- **Database**: PostgreSQL via Prisma ORM
- **Real-time**: Socket.IO
- **Optional Services**: Redis (for rate limiting, caching), Midtrans (payment gateway)

### Directory Structure
- `/src` - Backend TypeScript source code (Express API)
- `/client` - Frontend Vue.js application
- `/prisma` - Database schema and migrations
- `/scripts` - Utility scripts (admin creation, DB checks, etc.)

### Ports
- **Frontend (dev)**: Port 5000 (Vite dev server, proxies /api to backend)
- **Backend**: Port 3000 (Express API server)
- **Production**: Backend serves both API and built client on port 5000

### Key Configuration
- Backend entry: `src/app.ts`
- Frontend entry: `client/src/main.ts`
- Vite config: `client/vite.config.js`
- Prisma schema: `prisma/schema.prisma`
- TypeScript config: `tsconfig.json` (backend), `client/tsconfig.json` (frontend)

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `JWT_SECRET` - JWT token signing secret (min 32 chars)
- `PORT` - Backend port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origins
- `FRONTEND_URL` - Frontend URL
- `BACKEND_URL` - Backend URL

### Development Workflow
- Run `npm run dev` in root for backend (ts-node-dev with hot reload)
- Run `npx vite --host 0.0.0.0 --port 5000` in client for frontend
- The workflow runs both concurrently

### Production Deployment
- Backend is built with `npx tsc`
- Frontend is built with `npx vite build` in client directory
- In production, Express serves the built Vue app as static files with SPA fallback

## Recent Changes
- Configured for Replit environment (Feb 2026)
- Vite dev server set to port 5000 with host 0.0.0.0 and allowedHosts: 'all'
- Added splash screen fallback timeout
- Added static file serving and SPA fallback in backend for production
- PostgreSQL database provisioned via Replit
