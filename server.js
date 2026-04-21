import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

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

// In-memory storage (replace with database in production)
const db = {
  DaySchedule: [],
  Notice: [],
  PhoneNumbers: [],
  SystemSettings: {},
  users: []
};

// Helper functions
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

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
app.get('/api/:entity', authMiddleware, (req, res) => {
  const { entity } = req.params;
  const data = db[entity] || [];
  res.json(data);
});

app.get('/api/:entity/:id', authMiddleware, (req, res) => {
  const { entity, id } = req.params;
  const data = db[entity] || [];
  const item = data.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.json(item);
});

app.post('/api/:entity', authMiddleware, (req, res) => {
  const { entity } = req.params;
  const item = { id: generateId(), ...req.body, createdAt: new Date().toISOString() };
  
  if (!db[entity]) {
    db[entity] = [];
  }
  
  db[entity].push(item);
  res.json(item);
});

app.put('/api/:entity/:id', authMiddleware, (req, res) => {
  const { entity, id } = req.params;
  const data = db[entity] || [];
  const index = data.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  data[index] = { ...data[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(data[index]);
});

app.delete('/api/:entity/:id', authMiddleware, (req, res) => {
  const { entity, id } = req.params;
  const data = db[entity] || [];
  const index = data.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  data.splice(index, 1);
  res.json({ message: 'Deleted' });
});

// File upload route
app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// Initialize sample data
function initializeSampleData() {
  // Sample system settings
  db.SystemSettings = [{
    id: '1',
    organizationName: 'Smart Schedule Display',
    theme: 'default',
    screenScale: '32',
    autoRefresh: true
  }];

  // Sample phone numbers
  db.PhoneNumbers = [
    { id: '1', name: 'Office', number: '123-456-7890', active: true },
    { id: '2', name: 'Emergency', number: '911', active: true }
  ];

  // Sample notices
  db.Notice = [
    { id: '1', title: 'Welcome', content: 'Welcome to Smart Schedule Display', active: true },
    { id: '2', title: 'Meeting', content: 'Team meeting at 3 PM', active: true }
  ];

  console.log('Sample data initialized');
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeSampleData();
});

export default app;
