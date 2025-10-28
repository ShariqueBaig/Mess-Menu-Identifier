// Backend server for secure admin authentication
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// File path for storing menu data
const MENU_DATA_PATH = path.join(__dirname, 'menu-data.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for PDF data URLs

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin password hash (store this in .env in production)
// Default password: "admin123"
// Generate hash by running: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10, (e,h) => console.log(h));"
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$XQZvLHw0kP7qXY8jT.Hqxe7YqXGmEFz0yQ3YwZ8JKmN5L6vH8gRLK';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Admin authentication endpoint
app.post('/api/admin/verify', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password required' });
    }

    // Compare password with hash
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (isValid) {
      // Generate JWT token
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

// Middleware to verify admin token for protected routes
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

// Example protected route (for future use)
app.get('/api/admin/status', verifyAdminToken, (req, res) => {
  res.json({ success: true, message: 'Admin authenticated' });
});

// --- MENU DATA ENDPOINTS ---

// Get menu data (public - anyone can read)
app.get('/api/menu', async (req, res) => {
  try {
    const data = await fs.readFile(MENU_DATA_PATH, 'utf8');
    const menuData = JSON.parse(data);
    res.json({ success: true, data: menuData });
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist yet
      res.json({ success: false, message: 'No menu data available yet' });
    } else {
      console.error('Error reading menu data:', error);
      res.status(500).json({ success: false, message: 'Error reading menu data' });
    }
  }
});

// Save menu data (protected - admin only)
app.post('/api/menu', verifyAdminToken, async (req, res) => {
  try {
    const { menuData, startDate, pdfDataUrl } = req.body;
    
    if (!menuData || !startDate) {
      return res.status(400).json({ success: false, message: 'Menu data and start date required' });
    }

    const dataToSave = {
      menuData,
      startDate,
      pdfDataUrl: pdfDataUrl || null,
      savedAt: new Date().toISOString(),
      savedBy: 'admin'
    };

    await fs.writeFile(MENU_DATA_PATH, JSON.stringify(dataToSave, null, 2));
    res.json({ success: true, message: 'Menu saved successfully', savedAt: dataToSave.savedAt });
  } catch (error) {
    console.error('Error saving menu data:', error);
    res.status(500).json({ success: false, message: 'Error saving menu data' });
  }
});

// Delete menu data (protected - admin only)
app.delete('/api/menu', verifyAdminToken, async (req, res) => {
  try {
    await fs.unlink(MENU_DATA_PATH);
    res.json({ success: true, message: 'Menu data cleared' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.json({ success: true, message: 'No menu data to clear' });
    } else {
      console.error('Error deleting menu data:', error);
      res.status(500).json({ success: false, message: 'Error clearing menu data' });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📄 Open http://localhost:${PORT} in your browser`);
  console.log(`🔐 Admin password: sharique`);
});
