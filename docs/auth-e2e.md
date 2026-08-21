# Auth E2E Checklist

## Local Docker dev

1. Ensure env points frontend to local backend:
- `VITE_BACKEND_API_URL=http://localhost:8000/api/v1/`

2. Ensure SSO envs are coherent for localhost testing:
- `SSO_CALLBACK_HOSTNAME=http://localhost:8000`
- `SSO_LOGIN_CALLBACK_URL=http://localhost:5173/sso-login-callback`

3. Rebuild and start:
- `docker compose up --build -d`

4. Run backend auth smoke test:
- `./scripts/auth-smoke.sh http://localhost:8000/api/v1`

5. Run browser-side frontend auth verification:
- `./scripts/frontend-auth-ui-check.sh http://localhost:5173`

Expected:
- register/login/me return 200
- refresh without cookie returns 401
- google returns 303 with redirect_uri to localhost callback
- UI flow registers a user, logs in, and persists `localStorage.token`

## Render deployment

Set backend env vars in Render service:
- `GOOGLE_CLIENT_ID=<google client id>`
- `GOOGLE_CLIENT_SECRET=<google client secret>`
- `SSO_CALLBACK_HOSTNAME=https://synapse-ai-hub.onrender.com`
- `SSO_LOGIN_CALLBACK_URL=https://synapse-ai-hub.onrender.com/api/v1/login/google/callback`

Notes:(need to check)
- Do not include `/api/v1` in `SSO_CALLBACK_HOSTNAME`.
- `SSO_LOGIN_CALLBACK_URL` must be frontend callback route.

Validate:
- `./scripts/auth-smoke.sh https://synapse-ai-hub.onrender.com/api/v1`
- `./scripts/render-sso-check.sh`

If `render-sso-check.sh` prints `redirect_uri_contains_None`, the backend env `SSO_CALLBACK_HOSTNAME` is missing or invalid in Render.
