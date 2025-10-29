// Vercel serverless function for all API routes
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Get environment variables
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$XQZvLHw0kP7qXY8jT.Hqxe7YqXGmEFz0yQ3YwZ8JKmN5L6vH8gRLK';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Note: Vercel's filesystem is read-only in production
// For production, you'll need to use Vercel KV or a database
const START_DATE_PATH = '/tmp/start-date.json';

// Middleware to verify admin token
function verifyAdminToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

// Admin authentication endpoint
app.post('/api/admin/verify', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password required' });
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (isValid) {
      const token = jwt.sign(
        { role: 'admin', timestamp: Date.now() },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        message: 'Authentication successful'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get menu data (public)
app.get('/api/menu', async (req, res) => {
  // Menu is now read from PDF in the repo, not from storage
  res.json({ success: false, message: 'Menu data is now read directly from PDF file' });
});

// Save menu data (protected) - DEPRECATED
app.post('/api/menu', verifyAdminToken, async (req, res) => {
  res.json({ success: false, message: 'Menu upload is deprecated. PDF is now in repository.' });
});

// Delete menu data (protected) - DEPRECATED
app.delete('/api/menu', verifyAdminToken, async (req, res) => {
  res.json({ success: false, message: 'Menu deletion is deprecated. Update PDF in repository instead.' });
});

// Get start date (public)
app.get('/api/startdate', async (req, res) => {
  try {
    const data = await fs.readFile(START_DATE_PATH, 'utf8');
    const startDateData = JSON.parse(data);
    res.json({ success: true, startDate: startDateData.startDate });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ success: false, message: 'Start date not set yet' });
    } else {
      console.error('Error reading start date:', error);
      res.status(500).json({ success: false, message: 'Error reading start date' });
    }
  }
});

// Save start date (protected)
app.post('/api/startdate', verifyAdminToken, async (req, res) => {
  try {
    const { startDate } = req.body;
    
    if (!startDate) {
      return res.status(400).json({ success: false, message: 'Start date required' });
    }

    const dataToSave = {
      startDate,
      savedAt: new Date().toISOString(),
      savedBy: 'admin'
    };

    await fs.writeFile(START_DATE_PATH, JSON.stringify(dataToSave, null, 2));
    res.json({ success: true, message: 'Start date saved successfully', savedAt: dataToSave.savedAt });
  } catch (error) {
    console.error('Error saving start date:', error);
    res.status(500).json({ success: false, message: 'Error saving start date' });
  }
});

// Export for Vercel
module.exports = app;
