# Web Poster Duka

Initial setup for a fullstack project with:
- `backend/`: Golang API service
- `frontend/`: React + TypeScript (Vite)

## Prerequisites

- Go `>=1.20`
- Node.js `>=18`
- npm

## Run Backend (Golang)

```bash
cd backend
go run main.go
```

Backend will run at `http://localhost:8080` with endpoints:
- `GET /health`
- `POST /api/posters`
- `GET /api/posters?limit=50`
- `GET /api/posters/{id}`
- `PUT /api/posters/{id}`
- `DELETE /api/posters/{id}`

## Backend Flow Structure

Standard flow (simple version):
- `api/poster/controller`
- `api/poster/service`
- `api/poster/repository`
- `api/poster/model`
- `api/poster/entity`
- `api/poster/interfaces`
- `crudlib` (audit trail helper for live/his flow)

Notes:
- Live table entity uses `TableName() = "poster"` (no `_live` suffix).
- History table entity uses `TableName() = "poster_his"`.
- Backend CRUD now uses `gitlab.universedigital.my.id/library/golang/crud/crud` (`LiveHisNau` flow).
- Local DB default uses SQLite file at `backend/data/web_poster_duka.db`.
- If `DATABASE_URL` is set, backend will use PostgreSQL.
- If `DATABASE_URL` is empty, backend will fallback to SQLite (`DB_PATH`).

### DBeaver Manual DB Init

If you want to create tables manually from DBeaver:
- MySQL script: `backend/db/dbeaver-init-mysql.sql`
- PostgreSQL script: `backend/db/dbeaver-init-postgres.sql`

### Migrate Legacy Schema (Optional)

If you already have old tables (`id`, `created_at`, old `poster_his`):
- MySQL migration: `backend/db/migrate-legacy-to-crud-mysql.sql`
- PostgreSQL migration: `backend/db/migrate-legacy-to-crud-postgres.sql`

Recommended execution order in DBeaver:
1. Backup database
2. Run legacy migration script (if old schema exists)
3. Run latest init script to ensure structure is complete

## PostgreSQL Local Setup (Recommended for DBeaver)

If you see error `Connection refused` on `localhost:5432`, PostgreSQL service is not running yet.

1. Start PostgreSQL container:

```bash
docker compose -f docker-compose.postgres.yml up -d
```

2. Check container status:

```bash
docker compose -f docker-compose.postgres.yml ps
```

3. Use this connection in DBeaver:
- Host: `localhost`
- Port: `5432`
- Database: `postgres`
- Username: `postgres`
- Password: `duk@123`

4. Run backend with PostgreSQL:

```bash
cd backend
DATABASE_URL='postgres://postgres:duk%40123@localhost:5432/postgres?sslmode=disable' go run main.go
```

5. Stop PostgreSQL when done:

```bash
docker compose -f docker-compose.postgres.yml down
```

## Run Frontend (React)

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Frontend

Current UI is simple and consistent:
- Form input only for poster data
- Real-time poster preview template
- Submit form to backend generate endpoint
- Required fields: nama, tanggal wafat, foto, pesan doa (marked with `*`)
