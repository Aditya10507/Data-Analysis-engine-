# AI Data Analyst Agent

A full-stack AI data analyst app that uploads tabular files, profiles and cleans data with pandas, generates charts, stores artifacts in MinIO, and produces business insights with GroqCloud.

![AI Data Analyst Architecture](docs/assets/ai-data-analyst-architecture.png)

## Stack

- Frontend: React, TypeScript, Vite, Tailwind, Zustand, TanStack Table, Chart.js, D3
- Backend: FastAPI, SQLAlchemy, Alembic, Celery, pandas, Plotly, Matplotlib, WeasyPrint
- Infrastructure: PostgreSQL, Redis, MinIO, Docker Compose, Loki, Promtail, Grafana
- AI provider: GroqCloud OpenAI-compatible Chat Completions API

## System Design

```mermaid
flowchart LR
  user[Browser] --> frontend[React SPA]
  frontend --> api[FastAPI API]
  api --> postgres[(PostgreSQL)]
  api --> redis[(Redis)]
  api --> minio[(MinIO)]
  api --> celery[Celery queue]
  celery --> worker[Celery worker x4]
  worker --> minio
  worker --> postgres
  worker --> groq[GroqCloud API]
  worker --> charts[Plotly + Matplotlib]
  frontend --> grafana[Grafana dashboards]
  promtail[Promtail] --> loki[(Loki)]
  api --> promtail
  worker --> promtail
```

## Upload And Analysis Flow

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant A as FastAPI
  participant M as MinIO
  participant Q as Celery
  participant W as Worker
  participant D as PostgreSQL
  participant G as GroqCloud
  U->>F: Select CSV/JSON/TSV/TXT
  F->>A: POST /api/v1/files/upload
  A->>M: Save raw/{job_id}/{filename}
  A->>D: Create queued job
  A->>Q: Enqueue process_file(job_id)
  F->>A: Poll GET /api/v1/jobs/{job_id}/status
  W->>M: Read raw file
  W->>W: Parse, analyze, clean, chart
  W->>G: Request JSON insights
  W->>M: Save cleaned CSV and chart PNGs
  W->>D: Store final result_json
  A->>F: Return done result
```

## Auth Flow

```mermaid
flowchart TD
  register[POST /auth/register] --> user[(users table)]
  login[POST /auth/login] --> tokens[Access + refresh tokens]
  tokens --> redis[(Redis refresh token TTL 7 days)]
  frontend[Axios interceptor] --> bearer[Bearer access token]
  bearer --> protected[Protected API routes]
  protected --> expired{401?}
  expired -->|yes| refresh[POST /auth/refresh]
  refresh --> tokens
  expired -->|no| response[API response envelope]
```

## Required Environment Variables

Copy `.env.example` to `.env`, then replace placeholder secrets:

```env
DATABASE_URL=postgresql+psycopg://analyst:analyst_password@postgres:5432/analyst
ASYNC_DATABASE_URL=postgresql+asyncpg://analyst:analyst_password@postgres:5432/analyst
REDIS_URL=redis://redis:6379/0
S3_ENDPOINT=http://minio:9000
S3_BUCKET=ai-analyst-files
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
POSTGRES_DB=analyst
POSTGRES_USER=analyst
POSTGRES_PASSWORD=analyst_password
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
```

Generate a JWT secret with PowerShell: `[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`
Create a Groq key at `https://console.groq.com/keys`.

## Local Setup

1. Install Docker Desktop and wait until it says Docker is running.
2. Copy `.env.example` to `.env`, then fill `GROQ_API_KEY` and `JWT_SECRET_KEY`.
3. Start the stack:

```powershell
docker compose up -d
```

4. Apply migrations:

```powershell
docker compose run --rm backend alembic -c alembic.ini upgrade head
```

5. Open the app:

```text
Frontend: http://localhost
Backend health: http://localhost:8000/health
MinIO console: http://localhost:9001
Grafana: http://localhost:3000
```

## Common Commands

```powershell
docker compose up -d
docker compose logs backend --tail=100
docker compose logs celery-worker --tail=100
docker compose down
make build
make migrate
make test
```

## Troubleshooting

- If upload stays queued, check `docker compose logs celery-worker --tail=100`.
- If insights fall back, confirm `GROQ_API_KEY` is valid and containers were recreated.
- If login says session expired, clear browser local storage and reload.
- If Docker env changes are not picked up, run `docker compose up -d --force-recreate backend celery-worker`.
- Supported upload types are CSV, JSON, TSV, TXT, XLS, and XLSX.

## Deployment

`docker-compose.yml` runs production-style containers locally. `fly.toml` deploys the backend to Fly.io; configure external PostgreSQL, Redis, MinIO/S3, and Groq secrets separately.
