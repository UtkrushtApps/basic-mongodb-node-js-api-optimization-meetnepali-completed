const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { logRequests, fakeAuth } = require('./middleware/middleware');
const apiRoutes = require('./routes/api');

const app = express();

// Basic middleware setup
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// HTTP request logging
app.use(morgan('dev'));

// Custom logging and fake auth middleware (kept intentionally simple)
app.use(logRequests);
app.use(fakeAuth);

// Mount API routes
app.use('/api', apiRoutes);

// Simple root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Utkrusht product inventory API is running' });
});

// Error handler
// Note: intentionally basic, can be improved for more structured error responses
app.use((err, req, res, next) => {
  console.error('[app] Unhandled error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
