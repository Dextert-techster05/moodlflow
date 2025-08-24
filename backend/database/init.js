import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, 'moodjournal.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    createTables();
  }
});

// Create tables
function createTables() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err.message);
    } else {
      console.log('✅ Users table created/verified');
    }
  });

  // Moods table
  db.run(`
    CREATE TABLE IF NOT EXISTS moods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mood_type TEXT NOT NULL CHECK (mood_type IN ('happy', 'sad', 'angry', 'calm', 'excited')),
      emoji TEXT NOT NULL,
      note TEXT,
      mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating moods table:', err.message);
    } else {
      console.log('✅ Moods table created/verified');
    }
  });

  // Create indexes for better performance
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id)
  `, (err) => {
    if (err) {
      console.error('❌ Error creating index:', err.message);
    } else {
      console.log('✅ Database indexes created/verified');
    }
  });

  // Insert sample data for testing
  insertSampleData();
}

// Insert sample data
function insertSampleData() {
  // Check if sample data already exists
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error('❌ Error checking sample data:', err.message);
      return;
    }

    if (row.count === 0) {
      console.log('📝 Inserting sample data...');
      
      // Insert sample user
      db.run(`
        INSERT INTO users (username, email, password_hash) 
        VALUES (?, ?, ?)
      `, ['demo_user', 'demo@moodjournal.com', 'demo_password_hash'], function(err) {
        if (err) {
          console.error('❌ Error inserting sample user:', err.message);
        } else {
          const userId = this.lastID;
          console.log('✅ Sample user created with ID:', userId);
          
          // Insert sample moods
          const sampleMoods = [
            ['happy', '😊', 'Feeling great today!', 5],
            ['calm', '😌', 'Peaceful morning', 4],
            ['excited', '🎉', 'New project starting!', 5],
            ['sad', '😢', 'Missing friends', 2],
            ['angry', '😠', 'Traffic was terrible', 1]
          ];
          
          sampleMoods.forEach(([moodType, emoji, note, score]) => {
            db.run(`
              INSERT INTO moods (user_id, mood_type, emoji, note, mood_score) 
              VALUES (?, ?, ?, ?, ?)
            `, [userId, moodType, emoji, note, score], (err) => {
              if (err) {
                console.error('❌ Error inserting sample mood:', err.message);
              }
            });
          });
          
          console.log('✅ Sample moods inserted');
        }
      });
    } else {
      console.log('ℹ️ Sample data already exists');
    }
  });
}

// Export database connection
export default db;

// Export initialization function
export { createTables as initDatabase };
