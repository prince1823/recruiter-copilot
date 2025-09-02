# 🚀 Quick Start Guide - Recruiter Copilot Dashboard

Get the Recruiter Copilot Dashboard running in 5 minutes!

## 📋 What You Need

- **Docker** (Download from [docker.com](https://www.docker.com/products/docker-desktop/))
- **Git** (or download ZIP from GitHub)

## ⚡ 3-Step Setup

### 1. Get the Code
```bash
git clone https://github.com/prince1823/recruiter-copilot.git
cd recruiter-copilot
```

### 2. Run the Application
```bash
./deploy.sh
```

### 3. Access the App
Open your browser and go to: **http://localhost**

## ✅ That's It!

The application is now running with:
- ✅ Frontend on http://localhost
- ✅ Backend API on http://localhost:3000
- ✅ All data persisted in Docker volumes

## 🛠️ Quick Commands

```bash
# Stop the application
docker compose down

# Start again
docker compose up -d

# View logs
docker compose logs -f

# Test everything works
./test-docker.sh
```

## 🆘 Need Help?

1. **Docker not installed?** → Download from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Port 80 in use?** → Change ports in `docker-compose.yml`
3. **Something not working?** → Run `docker compose logs -f` to see errors
4. **Still stuck?** → Check the full [README.md](README.md) for detailed troubleshooting

## 🎯 What You Get

- **Table View**: Manage all applicants in a comprehensive table
- **Chat View**: Real-time chat interface
- **List Management**: Create and manage candidate lists
- **Bulk Actions**: Perform operations on multiple candidates
- **CSV Export**: Download data as CSV files
- **Real-time Updates**: Live data synchronization

---

**Ready to start recruiting? Open http://localhost and begin! 🎉**
