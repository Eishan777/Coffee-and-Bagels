const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require('./server/db');

const { router: publicApiRouter } = require('./server/routes/api');
const adminApiRouter = require('./server/routes/admin');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from workspace root
app.use(express.static(__dirname));

// Mount REST API Routes
app.use('/api', publicApiRouter);
app.use('/api/admin', adminApiRouter);

// Fallback route for root -> index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Export Express app for Vercel Serverless Function compatibility
module.exports = app;

// Listen on port only when running locally (not on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`☕ Coffee & Bagels Full-Stack Server Running!`);
    console.log(`🌐 Customer Site: http://localhost:${PORT}/index.html`);
    console.log(`📑 Reservations: http://localhost:${PORT}/reservations.html`);
    console.log(`🔐 Admin Login: http://localhost:${PORT}/login.html`);
    console.log(`📊 Admin Portal: http://localhost:${PORT}/admin.html`);
    console.log(`====================================================`);
  });
}
