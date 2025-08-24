import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/init.js';

const router = express.Router();

// POST register new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields: username, email, password' 
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long' 
    });
  }
  
  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) {
        console.error('❌ Error checking user existence:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        return res.status(400).json({ 
          error: 'Username or email already exists' 
        });
      }
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Insert new user
      const query = `
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
      `;
      
      db.run(query, [username, email, passwordHash], function(err) {
        if (err) {
          console.error('❌ Error creating user:', err.message);
          return res.status(500).json({ error: 'Failed to create user' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { userId: this.lastID, username },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );
        
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          data: {
            id: this.lastID,
            username,
            email,
            token
          }
        });
      });
    });
  } catch (error) {
    console.error('❌ Error in registration:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST login user
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validation
  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields: username, password' 
    });
  }
  
  // Find user
  const query = 'SELECT id, username, email, password_hash FROM users WHERE username = ?';
  
  db.get(query, [username], async (err, user) => {
    if (err) {
      console.error('❌ Error finding user:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    try {
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          token
        }
      });
    } catch (error) {
      console.error('❌ Error in login:', error.message);
      res.status(500).json({ error: 'Login failed' });
    }
  });
});

// GET user profile
router.get('/profile/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.created_at,
      COUNT(m.id) as total_moods,
      AVG(m.mood_score) as avg_mood_score
    FROM users u
    LEFT JOIN moods m ON u.id = m.user_id
    WHERE u.id = ?
    GROUP BY u.id
  `;
  
  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('❌ Error fetching user profile:', err.message);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {
        ...row,
        avg_mood_score: Math.round(row.avg_mood_score * 100) / 100 || 0
      }
    });
  });
});

// PUT update user profile
router.put('/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const { username, email } = req.body;
  
  // Validation
  if (!username || !email) {
    return res.status(400).json({ 
      error: 'Missing required fields: username, email' 
    });
  }
  
  const query = `
    UPDATE users 
    SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(query, [username, email, userId], function(err) {
    if (err) {
      console.error('❌ Error updating user profile:', err.message);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      changes: this.changes
    });
  });
});

// GET all users (for admin purposes)
router.get('/', (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.created_at,
      COUNT(m.id) as total_moods
    FROM users u
    LEFT JOIN moods m ON u.id = m.user_id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching users:', err.message);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  });
});

export default router;
