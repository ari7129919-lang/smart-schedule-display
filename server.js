import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, dbHelpers, initDatabase, initSampleData } from './database.js';

const app = express();
const PORT = process.env.PORT || 3015;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Auth middleware (simplified)
const authMiddleware = (req, res, next) => {
  // For now, just pass through. Add proper auth later
  next();
};

// API Routes

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication (replace with proper auth)
  if (username === 'admin' && password === 'admin') {
    const user = { id: '1', username: 'admin', role: 'admin' };
    res.json({ user, token: 'simple-token' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  // Return current user (simplified)
  res.json({ id: '1', username: 'admin', role: 'admin' });
});

// Entity routes
app.get('/api/:entity', authMiddleware, async (req, res) => {
  try {
    const { entity } = req.params;
    const data = await dbHelpers.findAll(entity);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/:entity/:id', authMiddleware, async (req, res) => {
  try {
    const { entity, id } = req.params;
    const item = await dbHelpers.findById(entity, id);
    
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/:entity', authMiddleware, async (req, res) => {
  try {
    const { entity } = req.params;
    const item = await dbHelpers.create(entity, req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/:entity/:id', authMiddleware, async (req, res) => {
  try {
    const { entity, id } = req.params;
    console.log(`PUT /api/${entity}/${id} - Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`overrideDay in request:`, req.body.overrideDay);
    const item = await dbHelpers.update(entity, id, req.body);
    console.log(`Update result - overrideDay:`, item?.overrideDay);
    
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/:entity/:id', authMiddleware, async (req, res) => {
  try {
    const { entity, id } = req.params;
    const result = await dbHelpers.delete(entity, id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File upload route
app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize database
  await initDatabase();
  await initSampleData();
});

export default app;
