require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for audit & debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'SwarnaERP Kerala Jewellery Core',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌟 SwarnaERP Kerala Jewellery Backend running on port ${PORT}`);
  console.log(`💎 API Base: http://localhost:${PORT}/api`);
  console.log(`⚖️  Kerala Benchmark: 1 Pavan = 8.000g | GST: 3% (1.5% CGST + 1.5% SGST)`);
  console.log(`====================================================`);
});

