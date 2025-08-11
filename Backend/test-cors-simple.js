const express = require('express');
const cors = require('cors');

const app = express();

// Simple CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log(`🌐 CORS Check - Origin: ${origin}`);
    
    if (!origin) {
      console.log(`✅ Allowing request with no origin`);
      return callback(null, true);
    }
    
    if (origin.includes('devtunnels.ms') || origin.includes('ngrok.io') || origin.includes('localhost')) {
      console.log(`✅ Allowing origin: ${origin}`);
      return callback(null, origin);
    }
    
    console.log(`🔓 Development mode: Allowing origin: ${origin}`);
    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Test endpoint
app.get('/test', (req, res) => {
  console.log(`✅ Test endpoint hit - Origin: ${req.headers.origin}`);
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 Simple CORS test server running on port ${PORT}`);
  console.log(`🔧 Test with: curl -H "Origin: https://blkxg6gp-5173.inc1.devtunnels.ms" http://localhost:${PORT}/test`);
});
