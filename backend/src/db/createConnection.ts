import Database from 'better-sqlite3';

export function createDatabaseConnection(databasePath: string): Database.Database {
  const database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');
  database.pragma('busy_timeout = 5000');
  return database;
}
