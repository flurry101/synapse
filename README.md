# Synapse AI Hub

Synapse AI Hub is an open platform and marketplace connecting AI Developers and Model Owners/Providers. It provides independent, dedicated workspaces for discovering, evaluating, deploying, benchmarking, and monetizing AI models.

---

## URLs & Endpoints

### Local Development
| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://localhost:5173](http://localhost:5173) | Vite + React frontend |
| **Backend API Base** | [http://localhost:8000/api/v1](http://localhost:8000/api/v1) | FastAPI REST API |
| **Interactive API Docs (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive API documentation |
| **OpenAPI Specification** | [http://localhost:8000/api/v1/openapi.json](http://localhost:8000/api/v1/openapi.json) | OpenAPI JSON schema |
| **Traefik Dashboard** *(Docker)* | [http://localhost:8090](http://localhost:8090) | Traefik reverse proxy dashboard |

### Live Deployment
| Service | URL |
| :--- | :--- |
| **Render Backend API** | [https://synapse-ai-hub.onrender.com](https://synapse-ai-hub.onrender.com) |
| **Render API Docs** | [https://synapse-ai-hub.onrender.com/docs](https://synapse-ai-hub.onrender.com/docs) |
| **Google SSO Callback Endpoint** | `https://synapse-ai-hub.onrender.com/api/v1/login/google/callback` |

---

## Workspaces & Role Isolation

Synapse enforces complete role separation between developers and model providers:

- **Developer Workspace** (`/developer`): Discover models, run prompt tests in the arena/playground, compare metrics side-by-side, and initiate deployments.
- **Model Owner Workspace** (`/owner`): Manage model catalogs, update metadata, monitor benchmarks, tune pricing plans, and inspect usage analytics.
- **Independent Security**: Developers cannot access the Model Owner workspace and vice-versa, unless an account has both roles enabled in profile settings or during sign-up.

---

## Prerequisites & Setup

- **Node.js**: `v18.0.0+` and `npm`
- **Python**: `3.12+` and [uv](https://docs.astral.sh/uv/) (or standard `venv`)
- **Database**: [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)
- **Docker & Docker Compose**: Optional for containerized deployment

### 1. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Key variables in `.env`:

```ini
# App Domain and Environment
ENVIRONMENT=development
DOMAIN=localhost

# Backend & Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
MONGO_DB=synapse
SECRET_KEY=your-secure-secret-key
FIRST_SUPERUSER=admin@synapse.com
FIRST_SUPERUSER_PASSWORD=admin

# Google OAuth SSO
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
SSO_CALLBACK_HOSTNAME=http://localhost:8000
SSO_LOGIN_CALLBACK_URL=http://localhost:5173/api/v1/login/google/callback

# Frontend
VITE_BACKEND_API_URL=http://localhost:8000/api/v1/
VITE_PWD_SIGNUP_ENABLED=true
```

---

## How to Run Locally

### Option A: Running Frontend & Backend Individually (Recommended for Dev)

#### 1. Backend

```bash
cd backend

# Install dependencies with uv
uv sync

# Start the FastAPI development server with hot-reload
uv run fastapi dev app/main.py
```

*The backend will be running at `http://localhost:8000` with docs at `http://localhost:8000/docs`.*

#### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

*The frontend application will be running at `http://localhost:5173`.*

---

### Option B: Running with Docker Compose

Start the full stack (Frontend, Backend, MongoDB, Traefik):

```bash
docker compose up --build -d
```

To enable live file watching and hot reloading in Docker:

```bash
docker compose watch
```

View logs or check container status:

```bash
docker compose ps
docker compose logs -f
```

Stop the stack:

```bash
docker compose down
```

---

## Testing

### 1. End-to-End Authentication & Role Smoke Test

Run the automated smoke test script against a local server or deployed Render backend:

```bash
# Test local backend
bash scripts/auth-smoke-test.sh http://localhost:8000

# Test Render deployment
bash scripts/auth-smoke-test.sh https://synapse-ai-hub.onrender.com
```

### 2. Frontend Unit & Component Tests

Run Vitest unit tests covering route guards, SSO callback, navigation, and profile forms:

```bash
cd frontend

# Run all tests once
npm test -- --run

# Run with code coverage
npm run coverage
```

### 3. Backend Unit Tests

Run Pytest test suite for API endpoints, token issuance, and user management:

```bash
cd backend
uv run pytest
```

---

## Linting & Formatting

### Frontend

```bash
cd frontend

# Check code for ESLint errors
npm run lint

# Auto-format codebase with Prettier
npm run format

# Type check & build production bundle
npm run build
```

### Backend

```bash
cd backend

# Lint with Ruff
uv run ruff check app tests

# Auto-format with Black
uv run black app tests

# Type check with Mypy
uv run mypy
```
