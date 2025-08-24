import express from 'express';
import db from '../database/init.js';

const router = express.Router();

// GET all moods for a user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      m.id,
      m.mood_type,
      m.emoji,
      m.note,
      m.mood_score,
      m.created_at,
      u.username
    FROM moods m
    JOIN users u ON m.user_id = u.id
    WHERE m.user_id = ?
    ORDER BY m.created_at DESC
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching moods:', err.message);
      return res.status(500).json({ error: 'Failed to fetch moods' });
    }
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  });
});

// GET mood statistics for a user
router.get('/stats/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      mood_type,
      COUNT(*) as count,
      AVG(mood_score) as avg_score
    FROM moods 
    WHERE user_id = ?
    GROUP BY mood_type
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching mood stats:', err.message);
      return res.status(500).json({ error: 'Failed to fetch mood statistics' });
    }
    
    // Calculate total entries and average mood score
    const totalEntries = rows.reduce((sum, row) => sum + row.count, 0);
    const avgMoodScore = rows.reduce((sum, row) => sum + (row.avg_score * row.count), 0) / totalEntries;
    
    res.json({
      success: true,
      data: {
        moodDistribution: rows,
        totalEntries,
        averageMoodScore: Math.round(avgMoodScore * 100) / 100
      }
    });
  });
});

// GET weekly mood trend
router.get('/weekly/:userId', (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      strftime('%Y-%m-%d', created_at) as date,
      AVG(mood_score) as avg_score,
      COUNT(*) as entries_count
    FROM moods 
    WHERE user_id = ? 
      AND created_at >= date('now', '-7 days')
    GROUP BY strftime('%Y-%m-%d', created_at)
    ORDER BY date DESC
  `;
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('❌ Error fetching weekly trend:', err.message);
      return res.status(500).json({ error: 'Failed to fetch weekly trend' });
    }
    
    res.json({
      success: true,
      data: rows
    });
  });
});

// POST new mood entry
router.post('/', (req, res) => {
  const { user_id, mood_type, emoji, note, mood_score } = req.body;
  
  // Validation
  if (!user_id || !mood_type || !emoji || !mood_score) {
    return res.status(400).json({ 
      error: 'Missing required fields: user_id, mood_type, emoji, mood_score' 
    });
  }
  
  // Validate mood_score range
  if (mood_score < 1 || mood_score > 5) {
    return res.status(400).json({ 
      error: 'Mood score must be between 1 and 5' 
    });
  }
  
  const query = `
    INSERT INTO moods (user_id, mood_type, emoji, note, mood_score)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(query, [user_id, mood_type, emoji, note, mood_score], function(err) {
    if (err) {
      console.error('❌ Error creating mood entry:', err.message);
      return res.status(500).json({ error: 'Failed to create mood entry' });
    }
    
    res.status(201).json({
      success: true,
      message: 'Mood entry created successfully',
      data: {
        id: this.lastID,
        user_id,
        mood_type,
        emoji,
        note,
        mood_score,
        created_at: new Date().toISOString()
      }
    });
  });
});

// PUT update mood entry
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { mood_type, emoji, note, mood_score } = req.body;
  
  // Validation
  if (!mood_type || !emoji || !mood_score) {
    return res.status(400).json({ 
      error: 'Missing required fields: mood_type, emoji, mood_score' 
    });
  }
  
  const query = `
    UPDATE moods 
    SET mood_type = ?, emoji = ?, note = ?, mood_score = ?
    WHERE id = ?
  `;
  
  db.run(query, [mood_type, emoji, note, mood_score, id], function(err) {
    if (err) {
      console.error('❌ Error updating mood entry:', err.message);
      return res.status(500).json({ error: 'Failed to update mood entry' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }
    
    res.json({
      success: true,
      message: 'Mood entry updated successfully',
      changes: this.changes
    });
  });
});

// DELETE mood entry
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM moods WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      console.error('❌ Error deleting mood entry:', err.message);
      return res.status(500).json({ error: 'Failed to delete mood entry' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Mood entry not found' });
    }
    
    res.json({
      success: true,
      message: 'Mood entry deleted successfully',
      changes: this.changes
    });
  });
});

export default router;
