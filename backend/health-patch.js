// Health check endpoint for Docker
// Add this to your server.js file

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Add this line after your existing routes
console.log('Health check endpoint added at /health');
