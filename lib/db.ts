import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'anime.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS anime (
    bangumi_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    cover_url TEXT DEFAULT '',
    air_date TEXT DEFAULT '',
    total_episodes INTEGER DEFAULT 0,
    summary TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS watching (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bangumi_id INTEGER NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'planned',
    current_episode INTEGER NOT NULL DEFAULT 0,
    rating INTEGER,
    short_comment TEXT DEFAULT '',
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (bangumi_id) REFERENCES anime(bangumi_id)
  );
`);

export default db;
