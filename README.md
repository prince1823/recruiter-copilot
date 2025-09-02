# Recruiter Copilot Dashboard

A comprehensive recruitment management dashboard with integrated backend and frontend, fully containerized with Docker for easy deployment.

## 🚀 Quick Start

### Prerequisites

Before running this application, ensure you have the following installed on your system:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Git** (for cloning the repository)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/prince1823/recruiter-copilot.git
   cd recruiter-copilot
   ```

2. **Deploy the application**
   ```bash
   ./deploy.sh
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000

That's it! The application will be running in Docker containers.

## 📋 Detailed Setup Instructions

### Step 1: Install Docker

#### For macOS:
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker Desktop
3. Verify installation:
   ```bash
   docker --version
   docker compose version
   ```

#### For Windows:
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker Desktop
3. Verify installation:
   ```bash
   docker --version
   docker compose version
   ```

#### For Linux (Ubuntu/Debian):
```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install docker.io docker-compose-plugin

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, for running without sudo)
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version
docker compose version
```

### Step 2: Get the Application

#### Option A: Clone from GitHub (Recommended)
```bash
git clone https://github.com/prince1823/recruiter-copilot.git
cd recruiter-copilot
```

#### Option B: Download ZIP
1. Go to https://github.com/prince1823/recruiter-copilot
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open terminal in the extracted folder

### Step 3: Run the Application

#### Quick Deploy (Recommended)
```bash
# Make the script executable (if needed)
chmod +x deploy.sh

# Deploy the application
./deploy.sh
```

#### Manual Deploy
```bash
# Build and start containers
docker compose up --build -d

# Check status
docker compose ps
```

### Step 4: Verify Installation

#### Test the deployment
```bash
# Run the test script
./test-docker.sh
```

#### Manual verification
```bash
# Check if containers are running
docker compose ps

# Test frontend
curl http://localhost

# Test backend
curl http://localhost:3000/health

# Test API proxy
curl http://localhost/api/data
```

## 🎯 Application Features

### Frontend Features
- **Table View**: View and manage all applicants in a comprehensive table
- **Chat View**: Real-time chat interface for candidate communication
- **List Management**: Create, edit, and manage candidate lists
- **Bulk Actions**: Perform bulk operations on selected candidates
- **CSV Export**: Download applicant data as CSV files
- **Real-time Updates**: Live data synchronization with backend

### Backend Features
- **RESTful API**: Complete API for all frontend operations
- **Data Persistence**: JSON-based data storage
- **Health Monitoring**: Built-in health checks
- **Message Queue**: Automated message processing
- **CORS Support**: Cross-origin resource sharing enabled

### Docker Features
- **Containerized**: Fully containerized for easy deployment
- **Health Checks**: Automatic health monitoring and restart
- **Persistent Storage**: Data persists across container restarts
- **Network Isolation**: Secure internal communication
- **Production Ready**: Optimized for production deployment

## 🛠️ Management Commands

### Start/Stop Application
```bash
# Start the application
docker compose up -d

# Stop the application
docker compose down

# Restart the application
docker compose restart

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Development Commands
```bash
# Rebuild containers
docker compose up --build -d

# Clean rebuild (removes old images)
docker compose down --rmi all --volumes
docker compose up --build -d

# Access container shell
docker compose exec backend sh
docker compose exec frontend sh
```

### Monitoring Commands
```bash
# Check container status
docker compose ps

# Check resource usage
docker stats

# View container health
docker inspect recruiter-copilot-backend | grep -A 10 Health
docker inspect recruiter-copilot-frontend | grep -A 10 Health
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (configured in `docker.env`):

```bash
# Frontend Configuration
VITE_API_BASE_URL=http://91.99.195.150:8000/api/v1
VITE_USER_ID=918923325988

# Backend Configuration
NODE_ENV=production
PORT=3000
```

### Customizing Configuration

1. **Edit environment variables**:
   ```bash
   cp docker.env .env
   # Edit .env with your values
   ```

2. **Modify ports** (in `docker-compose.yml`):
   ```yaml
   services:
     frontend:
       ports:
         - "8080:80"  # Change host port to 8080
     backend:
       ports:
         - "3001:3000"  # Change host port to 3001
   ```

3. **Add custom environment variables**:
   ```yaml
   services:
     backend:
       environment:
         - NODE_ENV=production
         - PORT=3000
         - YOUR_CUSTOM_VAR=value
   ```

## 🚨 Troubleshooting

### Common Issues

#### 1. Docker not running
```bash
# Error: Cannot connect to the Docker daemon
# Solution: Start Docker Desktop or Docker service
```

#### 2. Port already in use
```bash
# Error: Port 80 is already in use
# Solution: Change ports in docker-compose.yml or stop conflicting services
lsof -i :80  # Check what's using port 80
```

#### 3. Container won't start
```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Check container status
docker compose ps
```

#### 4. Build failures
```bash
# Clean build cache
docker compose build --no-cache

# Remove unused images
docker image prune -a
```

#### 5. Permission issues (Linux)
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### Getting Help

1. **Check the logs**:
   ```bash
   docker compose logs -f
   ```

2. **Verify Docker installation**:
   ```bash
   docker --version
   docker compose version
   docker info
   ```

3. **Check system resources**:
   ```bash
   docker system df
   docker system prune  # Clean up if needed
   ```

4. **Test individual components**:
   ```bash
   # Test backend directly
   curl http://localhost:3000/health
   
   # Test frontend
   curl http://localhost
   
   # Test API proxy
   curl http://localhost/api/data
   ```

## 📊 Application URLs

Once running, access the application at:

- **Main Application**: http://localhost
- **Backend API**: http://localhost:3000
- **API Endpoints**:
  - Health Check: http://localhost:3000/health
  - All Data: http://localhost/api/data
  - Applicants: http://localhost/api/applicants
  - Lists: http://localhost/api/lists

## 🔒 Security Notes

- The application runs with non-root users in containers
- Internal network communication is isolated
- Environment variables are properly configured
- Health checks are implemented for monitoring

## 📝 Development

### For Developers

If you want to modify the application:

1. **Make changes** to the source code
2. **Rebuild containers**:
   ```bash
   docker compose up --build -d
   ```
3. **Test changes**:
   ```bash
   ./test-docker.sh
   ```

### File Structure
```
recruiter-copilot/
├── components/          # React components
├── src/                # Source code
│   ├── services/       # API services
│   ├── contexts/       # React contexts
│   └── types/          # TypeScript types
├── backend/            # Backend server
├── docker-compose.yml  # Docker configuration
├── Dockerfile.*        # Docker build files
├── deploy.sh          # Deployment script
├── test-docker.sh     # Test script
└── README.md          # This file
```

## 🤝 Support

If you encounter any issues:

1. Check this README for troubleshooting steps
2. Review the logs: `docker compose logs -f`
3. Verify your Docker installation
4. Check system resources and permissions
5. Create an issue in the GitHub repository

## 📄 License

This project is licensed under the ISC License.

---

**Happy Recruiting! 🎉**

For more information, visit the [GitHub repository](https://github.com/prince1823/recruiter-copilot).