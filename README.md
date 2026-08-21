# synapse

## Run with Docker

Prerequisites: Docker Desktop with the Docker Compose plugin.

1. Configure the development environment in `.env`:

   ```dotenv
   ENVIRONMENT=development
   ```

2. Build and start the stack:

   ```bash
   docker compose up --build -d
   ```

   For automatic source synchronization during development, use:

   ```bash
   docker compose watch
   ```

3. Open the application:

   - Frontend: http://localhost:5173
   - Backend API documentation: http://localhost:8000/docs
   - Backend OpenAPI schema: http://localhost:8000/api/v1/openapi.json
   - MongoDB: `localhost:27017`
   - Traefik dashboard: http://localhost:8090

Check service status and logs with:

```bash
docker compose ps
docker compose logs -f
```

Stop the stack while preserving its database volume:

```bash
docker compose down
```

If the Traefik proxy at http://localhost returns a 404, use the direct frontend and
backend ports above. This can happen when Traefik cannot access the local Docker
daemon.
