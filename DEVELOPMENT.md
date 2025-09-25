# Development Guide

This project supports two development modes to separate local development from deployment testing.

## Development Modes

### 1. Vite Development Mode (Recommended for Local Development)
```bash
npm run dev
```
- **URL**: http://localhost:5173 (or auto-assigned port)
- **Features**: Fast HMR, instant reload, mock API data
- **Admin**: Auto-login with demo token, uses mock data from `src/services/mockApi.ts`
- **Use Case**: General UI development, styling, component work

### 2. Netlify Development Mode (For Testing Functions)
```bash
npx netlify dev
```
- **URL**: http://localhost:8888
- **Features**: Real Netlify Functions, environment variables, production-like API
- **Admin**: Demo token works, uses real data from `netlify/data/*.json`
- **Use Case**: Testing API integration, serverless functions, production testing

## Admin Panel

The admin panel automatically detects the development mode:

### Vite Mode (localhost:5173/admin)
- ✅ Auto-login with demo token
- ✅ Mock data for projects, about, contacts
- ✅ Fast development experience
- ❌ Changes don't persist (mock data)

### Netlify Mode (localhost:8888/admin)
- ✅ Auto-login with demo token
- ✅ Real API endpoints and data persistence
- ✅ Full CRUD operations work
- ⚡ Slower than Vite but more realistic

## API Service

The `src/services/mockApi.ts` file provides:
- Automatic detection of development mode
- Mock data fallback for Vite development
- Seamless switching between mock and real APIs

## Production Build

```bash
npm run build
```

The build process automatically optimizes for production and excludes mock API code when not needed.

## File Structure

```
src/
├── services/
│   └── mockApi.ts          # Mock API service for development
├── pages/
│   └── Admin.tsx           # Admin panel with dual-mode support
netlify/
├── functions/              # Serverless functions (work in netlify dev)
└── data/                  # JSON data files (persistent in netlify dev)
```

## Switching Between Modes

- **For UI work**: Use `npm run dev` (Vite)
- **For API testing**: Use `npx netlify dev` (Netlify)
- **For production testing**: Use `npm run build` then `npm run preview`

Both modes support the same features, just with different data persistence levels.