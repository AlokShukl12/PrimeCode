# PrimeTrade Full Stack Starter

React (Vite + Tailwind) frontend with protected routes, paired with an Express + MongoDB API for JWT authentication, profile management, and task CRUD.

## Project layout
- `frontend/` – Vite + Tailwind React app (protected routes, dashboard UI).
- `server/` – Express API with MongoDB + JWT auth.
- Root `package.json` contains helper scripts that proxy to each folder.

## Install
```bash
# install both workspaces
npm install --workspaces
# or install separately
cd frontend && npm install
cd ../server && npm install
```

## Run
```bash
# from repo root (runs scripts inside each folder)
npm run dev:server      # API on http://localhost:5001 (see PORT in server/.env)
npm run dev:frontend    # Vite on http://localhost:5173
```
Use two terminals during development. Build/preview the client with `npm run build:frontend` and `npm run preview:frontend`. Start the API in production mode with `npm run start:server`.

## Environment variables
- Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, etc.
- Frontend optionally supports `VITE_API_URL` (defaults to `http://localhost:5001/api`).

## Frontend
- React Router protected routes: `/login`, `/register`, `/dashboard`.
- Tailwind UI with responsive dashboard, search & filter, profile editing, and task CRUD.
- Axios client auto-attaches JWT from `localStorage`.

## Backend
- Express 5 API (`/api` prefix) with helmet + CORS.
- Auth endpoints: `POST /api/auth/register`, `POST /api/auth/login` (returns JWT + user).
- Profile: `GET /api/profile`, `PUT /api/profile`.
- Tasks: `GET/POST /api/tasks`, `PUT/DELETE /api/tasks/:id` with search + status filters.
- MongoDB via Mongoose; passwords hashed with bcrypt; JWT middleware guards protected routes; Zod validation on inputs.
