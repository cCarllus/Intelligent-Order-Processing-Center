import Database from 'better-sqlite3';

import { env } from '../config/env';

export const db = new Database(env.databasePath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
