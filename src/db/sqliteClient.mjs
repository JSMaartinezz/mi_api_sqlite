

import sqlite3 from "sqlite3";

sqlite3.verbose();


const DB_PATH = "data/app.db";


export function createDbConnection() {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error("Error abriendo la base de datos SQLite:", err.message);
    } else {
      console.log("Conexión SQLite abierta en", DB_PATH);
    }
  });

  return db;
}


export function initializeDatabase(db) {
  const createSongsTableSQL = `
    CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    artist TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  
  const createSongDeletionsLogTableSQL = `
    CREATE TABLE IF NOT EXISTS song_deletions_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    year INTEGER NOT NULL,
    genre TEXT NOT NULL,
    deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.serialize(() => {
    db.run(createSongsTableSQL, (err) => {
      if (err) {
        console.error("Error creando la tabla users:", err.message);
      } else {
        console.log("Tabla songs verificada/creada correctamente.");
      }
    });

    db.run(createSongDeletionsLogTableSQL, (err) => {
      if (err) {
        console.error("Error creando la tabla user_deletions_log:", err.message);
      } else {
        console.log("Tabla song_deletions_log verificada/creada correctamente.");
      }
    });
  });
}