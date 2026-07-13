# AI Data Analyst Agent

A full-stack AI data analyst app that uploads tabular files, profiles and cleans data with pandas, generates charts, stores artifacts in MinIO, and produces business insights with GroqCloud.

![AI Data Analyst Architecture](docs/assets/ai-data-analyst-architecture.png)

## Stack

- Frontend: React, TypeScript, Vite, Tailwind, Zustand, TanStack Table, Chart.js, D3, Plotly.js
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
  worker --> versions[(Report versions)]
  worker --> groq[GroqCloud API]
  worker --> charts[Plotly + Matplotlib]
  frontend --> grafana[Grafana dashboards]
  promtail[Promtail] --> loki[(Loki)]
  api --> promtail
  worker --> promtail
```

## Product Features

- Multi-format upload: CSV, JSON, TSV, TXT, XLS, and XLSX files up to 1 GB, streamed directly to MinIO.
- Cleaning review before analysis: approve or skip null filling, duplicate removal, outlier clipping, and date parsing.
- Data quality score: backend-generated score, grade, null percentage, duplicate percentage, outlier percentage, and issue list.
- Interactive dashboard: KPI cards, virtualized preview table, 2D charts, rotatable 3D Plotly charts, D3 correlation heatmap, column drilldown, and smart chart recommendations.
- Grounded AI analyst chat: answers questions only from the produced report, charts, stats, cleaning report, insights, and data quality score.
- Saved report versions: every completed analysis stores an immutable report snapshot that can be reopened from the dashboard.
- Export tools: cleaned CSV download, a business-ready PDF with cover page, executive summary, KPIs, quality score, insights, charts, cleaning log, recommendations, copy insights as markdown, and recent download history.
- Observability: structured JSON logs shipped to Loki with Grafana dashboards.

### Large Dataset Behavior

- The analysis and cleaning pipeline includes every parsed row and column; there is no application-level row or column cap.
- The browser receives a virtualized interactive sample instead of the complete dataset payload. This prevents large files from freezing the UI or expanding `jobs.result_json` to hundreds of megabytes.
- Raw uploads and cleaned CSV artifacts are streamed through temporary files instead of being duplicated as large in-memory byte strings.
- A 1 GB pandas DataFrame can require several gigabytes of RAM depending on column types. Available machine memory remains a practical processing constraint even though the application does not truncate the analysis.

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
  A->>Q: Enqueue prepare_cleaning_review(job_id)
  F->>A: Poll GET /api/v1/jobs/{job_id}/status
  W->>M: Read raw file
  W->>W: Parse file and build cleaning plan
  W->>D: Store reviewing status
  A->>F: Return cleaning_review actions
  U->>F: Approve or skip cleaning steps
  F->>A: POST /api/v1/jobs/{job_id}/cleaning-review
  A->>Q: Enqueue process_file(job_id)
  W->>W: Analyze, clean, score quality, chart
  W->>G: Request JSON insights
  W->>M: Save cleaned CSV and chart PNGs
  W->>D: Store final result_json and report version
  A->>F: Return done result
```

## Report Versioning Flow

```mermaid
flowchart TD
  done[Analysis completed] --> response[Build result_json]
  response --> quality[Attach data_quality score]
  response --> job[(jobs.result_json)]
  response --> version[(report_versions v1..n)]
  dashboard[Dashboard] --> versions[GET /api/v1/jobs/{job_id}/versions]
  versions --> reopen[Reload selected report snapshot]
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

## Useful API Endpoints

- `POST /auth/register` - create a user.
- `POST /auth/login` - return access and refresh tokens.
- `POST /api/v1/files/upload` - upload a dataset and prepare cleaning review.
- `GET /api/v1/jobs/{job_id}/status` - poll queued, reviewing, processing, done, or failed status.
- `POST /api/v1/jobs/{job_id}/cleaning-review` - approve or skip cleaning actions and start analysis.
- `GET /api/v1/jobs/{job_id}/versions` - list saved report versions.
- `POST /api/v1/assistant/report-chat` - ask grounded report questions.
- `GET /api/v1/jobs/{job_id}/report.pdf` - download the PDF report.

## Troubleshooting

- If upload stays queued, check `docker compose logs celery-worker --tail=100`.
- If insights fall back, confirm `GROQ_API_KEY` is valid and containers were recreated.
- If login says session expired, clear browser local storage and reload.
- If Docker env changes are not picked up, run `docker compose up -d --force-recreate backend celery-worker`.
- Supported upload types are CSV, JSON, TSV, TXT, XLS, and XLSX up to 1 GB.
- If old reports show "Not scored yet" or no saved versions, rerun/upload the dataset so the latest pipeline can create those fields.

## Deployment

`docker-compose.yml` runs production-style containers locally. `fly.toml` deploys the backend to Fly.io; configure external PostgreSQL, Redis, MinIO/S3, and Groq secrets separately.
