# Docker Deployment Guide for Recruiter Copilot

This guide explains how to build and run the Recruiter Copilot frontend using Docker.

## Architecture Overview

- **Single Container**: The frontend runs in a single nginx container
- **Static Build**: React app is built at image creation time
- **Runtime Configuration**: Environment variables can be injected at container runtime
- **Optimized Image**: Multi-stage build creates a minimal production image (~50MB)

## Files Overview

- `Dockerfile`: Multi-stage build configuration
- `nginx.conf`: Nginx server configuration with SPA routing support
- `docker-entrypoint.sh`: Script to inject environment variables at runtime
- `docker-compose.yml`: Development configuration
- `docker-compose.prod.yml`: Production configuration
- `.env.docker`: Example environment variables

## Quick Start

### 1. Build the Docker Image

```bash
# Build the image
docker build -t recruiter-copilot-frontend .
```

### 2. Run with Docker Compose (Recommended)

#### Development Mode
```bash
# Copy and configure environment variables
cp .env.docker .env
# Edit .env with your API URL

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

#### Production Mode (Using Pre-built Image)
```bash
# Copy production environment template
cp .env.production .env
# Edit .env with your specific values

# Pull the latest image from GitHub Container Registry
docker pull ghcr.io/tanuj-b/recruiter-copilot:production

# Start with production config
docker-compose -f docker-compose.prod.yml up -d
```

#### Production Mode (Building Locally)
```bash
# Build the production image
docker build -t ghcr.io/tanuj-b/recruiter-copilot:production .

# Start with production config
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Run with Docker (Alternative)

```bash
# Run the container directly
docker run -d \
  -p 3000:80 \
  -e VITE_API_BASE_URL=http://your-backend:8000/api/v1 \
  -e VITE_ENABLE_CSV_EXPORT=true \
  -e VITE_ENABLE_BULK_ACTIONS=true \
  --name recruiter-frontend \
  recruiter-copilot-frontend
```

## Environment Variables

All environment variables are defined in docker-compose files and injected at runtime. This means you can change configuration without rebuilding the image.

### Configuration Methods

1. **Using .env file** (Recommended for production):
```bash
cp .env.production .env
# Edit .env with your values
docker-compose -f docker-compose.prod.yml up -d
```

2. **Using docker-compose.yml directly**: Edit the environment section in the compose file

3. **Using environment variables**: Export before running docker-compose

### Available Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | Dev: `http://localhost:8000/api/v1`<br>Prod: `https://recruiter-copilot-apis.quesscorp.com/api/v1` | Backend API URL |
| `VITE_API_TIMEOUT` | `30000` | API request timeout (ms) |
| `VITE_API_RETRY_ATTEMPTS` | `3` | Number of retry attempts |
| `VITE_API_RETRY_DELAY` | `1000` | Delay between retries (ms) |
| `VITE_ENABLE_CSV_EXPORT` | `true` | Enable CSV export feature |
| `VITE_ENABLE_BULK_ACTIONS` | `true` | Enable bulk actions feature |
| `VITE_SKIP_AUTH` | `false` | Skip authentication (dev only) |
| `VITE_MOCK_USER_ID` | `test-user-123` | Mock user ID when auth skipped |

## Ports

- **Development**: Port 3000 (configurable)
- **Production**: Port 80 (standard HTTP)

## Health Checks

The container includes health checks that verify nginx is responding:
- Checks every 30 seconds
- Timeout after 10 seconds
- Container marked unhealthy after 3 failed checks

## Building for Different Environments

### Local Development
```bash
docker-compose up --build
```

### Staging
```bash
# Build with staging config
docker build -t recruiter-copilot-frontend:staging .

# Run with staging environment
docker run -d \
  -p 80:80 \
  -e VITE_API_BASE_URL=https://staging-api.example.com/api/v1 \
  recruiter-copilot-frontend:staging
```

### Production
```bash
# Build for production
docker build -t recruiter-copilot-frontend:prod .

# Tag for registry
docker tag recruiter-copilot-frontend:prod your-registry.com/recruiter-copilot-frontend:latest

# Push to registry
docker push your-registry.com/recruiter-copilot-frontend:latest
```

## Connecting to Backend

If your backend is also containerized, you can use Docker networks:

```yaml
# docker-compose.yml with backend
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      VITE_API_BASE_URL: http://backend:8000/api/v1
    networks:
      - app-network
    depends_on:
      - backend

  backend:
    image: your-backend-image
    ports:
      - "8000:8000"
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs recruiter-copilot-frontend

# Check if port is already in use
lsof -i :3000
```

### API connection issues
```bash
# Verify environment variables
docker exec recruiter-copilot-frontend printenv | grep VITE

# Check network connectivity
docker exec recruiter-copilot-frontend wget -O- http://your-backend:8000/api/v1/health
```

### Build failures
```bash
# Clean build cache
docker system prune -a

# Build with no cache
docker build --no-cache -t recruiter-copilot-frontend .
```

## Performance Optimization

The Docker setup includes several optimizations:

1. **Multi-stage build**: Reduces final image size
2. **Nginx caching**: Static assets cached for 1 year
3. **Gzip compression**: Reduces bandwidth usage
4. **Resource limits**: Prevents container from consuming excessive resources

## Security Considerations

1. **Don't commit .env files**: Use secrets management in production
2. **Use HTTPS**: Configure SSL certificates in production
3. **Security headers**: Already configured in nginx.conf
4. **Regular updates**: Keep base images updated

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t recruiter-frontend .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag recruiter-frontend:latest your-registry/recruiter-frontend:latest
          docker push your-registry/recruiter-frontend:latest
```

## Monitoring

Add monitoring with Docker health checks and logging:

```bash
# View health status
docker inspect --format='{{.State.Health.Status}}' recruiter-copilot-frontend

# Follow logs
docker logs -f recruiter-copilot-frontend

# Export logs
docker logs recruiter-copilot-frontend > frontend.log 2>&1
```