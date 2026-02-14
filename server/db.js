const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Helper for parameterized queries since sql.js exec doesn't support them
  db.exec = ((originalExec) => {
    return function (sql, params) {
      if (!params || params.length === 0) {
        return originalExec.call(this, sql);
      }

      const stmt = this.prepare(sql);
      try {
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.get());
        }
        const columns = stmt.getColumnNames();
        return [{ columns, values: results }];
      } finally {
        stmt.free();
      }
    };
  })(db.exec);

  db.run = ((originalRun) => {
    return function (sql, params) {
      if (!params || params.length === 0) {
        return originalRun.call(this, sql);
      }
      return this.exec(sql, params);
    };
  })(db.run);

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      mobile TEXT,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('ADMIN','MANAGER','EMPLOYEE')) NOT NULL,
      position TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','suspended')),
      manager_id INTEGER,
      burnout_phase INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      total_hours REAL DEFAULT 0,
      overtime INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assigned_to INTEGER NOT NULL,
      assigned_by INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK(priority IN ('Low','Medium','High','Critical')) DEFAULT 'Medium',
      deadline TEXT,
      estimated_hours REAL,
      status TEXT DEFAULT 'Assigned' CHECK(status IN ('Assigned','In Progress','Submitted','Approved','Rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (assigned_by) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS task_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      completion_status TEXT,
      work_summary TEXT,
      hours_spent REAL,
      attachment TEXT,
      rejection_reason TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      assigned_by INTEGER NOT NULL,
      title TEXT DEFAULT 'Meeting',
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      description TEXT,
      duration_minutes REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (assigned_by) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raised_by INTEGER NOT NULL,
      about_user INTEGER NOT NULL,
      category TEXT,
      description TEXT,
      severity TEXT CHECK(severity IN ('Low','Medium','High','Critical')) DEFAULT 'Medium',
      status TEXT DEFAULT 'Open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (raised_by) REFERENCES users(id),
      FOREIGN KEY (about_user) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      type TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS focus_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      hour INTEGER NOT NULL,
      keys_per_minute INTEGER DEFAULT 0,
      mouse_distance_px INTEGER DEFAULT 0,
      idle_minutes INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cognitive_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      hour INTEGER NOT NULL,
      fragmentation_index REAL DEFAULT 0,
      latent_stress_index REAL DEFAULT 0,
      adaptive_capacity_score REAL DEFAULT 100,
      neural_load_index REAL DEFAULT 0,
      burnout_phase INTEGER DEFAULT 1,
      backspace_rate REAL DEFAULT 0,
      task_switching_rate REAL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin_assigned_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manager_id INTEGER NOT NULL,
      assigned_by INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK(priority IN ('Low','Medium','High','Critical')) DEFAULT 'Medium',
      deadline TEXT,
      estimated_hours REAL,
      status TEXT DEFAULT 'Assigned',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id),
      FOREIGN KEY (assigned_by) REFERENCES users(id)
    )
  `);

  // ── AUTO-SEED FOR PRODUCTION (USERS + METRICS) ───────────
  try {
    const seedProductionData = require('./production_seed');
    seedProductionData(db);
  } catch (err) {
    console.error('❌ Production Seeding Error:', err);
  }

  saveDb();
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

module.exports = { getDb, saveDb };
