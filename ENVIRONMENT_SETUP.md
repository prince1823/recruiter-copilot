# Environment Variable Configuration

## Overview

This application uses a **strict no-defaults policy** for environment variables. All required environment variables MUST be explicitly set, or the application will fail to start with clear error messages.

## Key Changes

1. **No Default Values**: All environment variables must be explicitly set
2. **Centralized Handler**: Environment variables are managed through `src/config/environment.ts`
3. **Docker Runtime Injection**: Docker deployments can override build-time variables at runtime
4. **Fail-Fast Validation**: Application won't start if required variables are missing

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` |
| `VITE_API_TIMEOUT` | Request timeout in milliseconds | `30000` |
| `VITE_API_RETRY_ATTEMPTS` | Number of retry attempts | `3` |
| `VITE_API_RETRY_DELAY` | Delay between retries (ms) | `1000` |
| `VITE_ENABLE_CSV_EXPORT` | Enable CSV export feature | `true` |
| `VITE_ENABLE_BULK_ACTIONS` | Enable bulk actions feature | `true` |

## Optional Environment Variables (Development Only)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SKIP_AUTH` | Skip authentication (DEV ONLY) | `false` |
| `VITE_MOCK_USER_ID` | Mock user ID when auth skipped | `test-user-123` |

⚠️ **WARNING**: Never set `VITE_SKIP_AUTH` or `VITE_MOCK_USER_ID` in production!

## Configuration Methods

### 1. Local Development (.env file)

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000
VITE_ENABLE_CSV_EXPORT=true
VITE_ENABLE_BULK_ACTIONS=true
```

### 2. Docker Development (docker-compose.yml)

All variables are explicitly defined in `docker-compose.yml`:

```yaml
environment:
  VITE_API_BASE_URL: http://localhost:8000/api/v1
  VITE_API_TIMEOUT: 30000
  # ... other required variables
```

### 3. Production Docker (docker-compose.prod.yml)

Production configuration with no defaults:

```yaml
environment:
  VITE_API_BASE_URL: https://api.production.com/api/v1  # MUST CHANGE
  VITE_API_TIMEOUT: 30000
  # ... other required variables
```

## How It Works

### Build Time vs Runtime

1. **Build Time**: Vite reads from `.env` file during `npm run build`
2. **Runtime (Docker)**: `docker-entrypoint.sh` injects variables via `window._env_`
3. **Priority**: Docker runtime variables override build-time variables

### Environment Variable Loading Order

1. Check `window._env_` (Docker runtime injection)
2. Check `import.meta.env` (Vite build-time)
3. If not found and required, throw error

### Error Handling

If required variables are missing:

1. Console error with clear message
2. UI displays error screen (if possible)
3. Application refuses to start

## Docker Deployment

### Building the Image

```bash
docker build -t recruiter-copilot-frontend .
```

### Running with docker-compose

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up
```

### Environment Variable Validation

The `docker-entrypoint.sh` script validates all required variables before starting nginx:

```bash
# Check all required environment variables
check_required_env "VITE_API_BASE_URL"
check_required_env "VITE_API_TIMEOUT"
# ... etc
```

## Troubleshooting

### Application Won't Start

**Error**: "Required environment variable 'VITE_API_BASE_URL' is not set!"

**Solution**: 
- For local dev: Create `.env` file with all required variables
- For Docker: Ensure all variables are set in docker-compose.yml

### Docker Container Exits Immediately

**Cause**: Missing environment variables

**Solution**: Check container logs:
```bash
docker-compose logs frontend
```

### Variables Not Taking Effect

**For Docker**: Ensure you've rebuilt the image after changes:
```bash
docker-compose build --no-cache
docker-compose up
```

## Migration from Old Setup

### What Changed

1. ✅ Removed all default values from code
2. ✅ Removed `.env.docker` file
3. ✅ Removed `version` field from docker-compose files
4. ✅ All variables now explicit in docker-compose
5. ✅ Added fail-fast validation

### Breaking Changes

- Application will not start without all required environment variables
- No more fallback/default values
- Docker deployments must specify all variables explicitly

## Best Practices

1. **Never commit `.env` files** to version control
2. **Always validate** environment setup before deployment
3. **Use `.env.example`** as template for new deployments
4. **Document** any new environment variables
5. **Test** both local and Docker configurations