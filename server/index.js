// Local development entry point — imports the shared Express app and starts the HTTP server.
// Vercel does NOT use this file; it uses api/index.js instead.
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Mira Road Digital Twin API Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🛰️  Weather API: http://localhost:${PORT}/api/weather`);
  console.log(`💨 Air Quality API: http://localhost:${PORT}/api/air-quality`);
  console.log(`🚦 Traffic API: http://localhost:${PORT}/api/traffic`);
});
