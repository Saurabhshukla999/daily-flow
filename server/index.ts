import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper functions
function generateToken(user: any) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    await pool.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [userId, email, hashedPassword]
    );
    
    const token = generateToken({ id: userId, email });
    res.json({ user: { id: userId, email }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    const token = generateToken(user);
    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks routes
app.get('/api/tasks', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', verifyToken, async (req, res) => {
  try {
    const { text, hours_per_day, days, end_date } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (text, hours_per_day, days, end_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [text, hours_per_day, days, end_date, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    const result = await pool.query(
      `UPDATE tasks SET ${fields} WHERE id = $1 AND user_id = $${values.length + 2} RETURNING *`,
      [id, ...values, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE tasks SET is_active = false WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Daily logs routes
app.get('/api/logs', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const result = await pool.query(
      'SELECT * FROM daily_logs WHERE user_id = $1 AND date = $2',
      [req.user.userId, date]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logs', verifyToken, async (req, res) => {
  try {
    const { task_id, date, checked, hours_logged } = req.body;
    const result = await pool.query(`
      INSERT INTO daily_logs (user_id, task_id, date, checked, hours_logged)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, task_id, date)
      DO UPDATE SET checked = $4, hours_logged = $5
      RETURNING *
    `, [req.user.userId, task_id, date, checked, hours_logged]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stats route
app.get('/api/stats', verifyToken, async (req, res) => {
  try {
    const { period, metric } = req.query;
    // This would need to be implemented based on your stats logic
    res.json({ message: 'Stats endpoint - implement based on your needs' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
