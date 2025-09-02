# Docker Deployment Guide

This guide explains how to deploy the Recruiter Copilot Dashboard using Docker containers.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/prince1823/recruiter-copilot.git
   cd recruiter-copilot
   ```

2. **Build and start the containers**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:3000

## Architecture

The Docker setup includes:

- **Frontend Container**: React/Vite application served by Nginx
- **Backend Container**: Node.js Express server
- **Network**: Internal Docker network for container communication
- **Volumes**: Persistent storage for backend data

## Services

### Frontend Service
- **Port**: 80 (mapped to host)
- **Base Image**: nginx:alpine
- **Build**: Multi-stage build with Node.js for building, Nginx for serving
- **Features**: 
  - Client-side routing support
  - API proxy to backend
  - Static asset caching
  - Security headers

### Backend Service
- **Port**: 3000 (mapped to host)
- **Base Image**: node:18-alpine
- **Features**:
  - Health checks
  - Non-root user for security
  - Persistent data storage

## Environment Configuration

The application uses the following environment variables:

- `VITE_API_BASE_URL`: Frontend API base URL (default: http://localhost/api/v1)
- `VITE_USER_ID`: User ID for API requests (default: 918923325988)
- `NODE_ENV`: Node.js environment (default: production)
- `PORT`: Backend server port (default: 3000)

## Docker Commands

### Build and Start
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d --build

# Start only specific service
docker-compose up backend
docker-compose up frontend
```

### Stop and Cleanup
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Remove all containers, networks, and images
docker-compose down --rmi all --volumes --remove-orphans
```

### Logs and Debugging
```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f

# Execute commands in running container
docker-compose exec backend sh
docker-compose exec frontend sh
```

### Health Checks
```bash
# Check service health
docker-compose ps

# View health check status
docker inspect recruiter-copilot-backend | grep -A 10 Health
docker inspect recruiter-copilot-frontend | grep -A 10 Health
```

## Production Deployment

### Using Docker Compose (Recommended)

1. **Set up environment variables**:
   ```bash
   cp docker.env .env
   # Edit .env with your production values
   ```

2. **Deploy**:
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

### Using Docker Swarm

1. **Initialize swarm**:
   ```bash
   docker swarm init
   ```

2. **Deploy stack**:
   ```bash
   docker stack deploy -c docker-compose.yml recruiter-copilot
   ```

### Using Kubernetes

Convert the docker-compose.yml to Kubernetes manifests:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.28.0/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv ./kompose /usr/local/bin/kompose

# Convert to Kubernetes
kompose convert
```

## Customization

### Changing Ports

Edit `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change host port to 8080
  backend:
    ports:
      - "3001:3000"  # Change host port to 3001
```

### Adding Environment Variables

Edit `docker-compose.yml`:
```yaml
services:
  frontend:
    environment:
      - VITE_API_BASE_URL=http://your-domain.com/api/v1
      - VITE_USER_ID=your-user-id
  backend:
    environment:
      - NODE_ENV=production
      - PORT=3000
      - YOUR_CUSTOM_VAR=value
```

### Persistent Data

The backend data is stored in a Docker volume named `backend_data`. To backup:

```bash
# Create backup
docker run --rm -v recruiter-copilot_backend_data:/data -v $(pwd):/backup alpine tar czf /backup/backend-data-backup.tar.gz -C /data .

# Restore backup
docker run --rm -v recruiter-copilot_backend_data:/data -v $(pwd):/backup alpine tar xzf /backup/backend-data-backup.tar.gz -C /data
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using the port
   lsof -i :80
   lsof -i :3000
   
   # Change ports in docker-compose.yml
   ```

2. **Container won't start**:
   ```bash
   # Check logs
   docker-compose logs [service-name]
   
   # Check container status
   docker-compose ps
   ```

3. **Build failures**:
   ```bash
   # Clean build cache
   docker-compose build --no-cache
   
   # Remove unused images
   docker image prune -a
   ```

4. **Permission issues**:
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Performance Optimization

1. **Enable Docker BuildKit**:
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

2. **Use multi-stage builds** (already implemented)

3. **Optimize image layers** (already implemented)

## Security Considerations

- Backend runs as non-root user
- Security headers are configured in Nginx
- Environment variables are properly isolated
- Health checks are implemented
- Network isolation between services

## Monitoring

### Health Checks
Both services include health checks that monitor:
- Backend: HTTP endpoint availability
- Frontend: Web server availability

### Logging
- Application logs are available via `docker-compose logs`
- Nginx access/error logs are available in the frontend container
- Backend logs are available in the backend container

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Verify health status: `docker-compose ps`
3. Check this documentation
4. Create an issue in the GitHub repository
