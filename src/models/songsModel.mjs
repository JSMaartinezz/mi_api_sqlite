

import { createDbConnection } from "../db/sqliteClient.mjs";


export function createSong({ title, genre, artist, year }) {
  const db = createDbConnection();
  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO songs (title, genre, artist, year, created_at)
    VALUES (?, ?, ?, ?, ?);
  `;

  return new Promise((resolve, reject) => {
    db.run(sql, [title, genre, artist, year, createdAt], function (err) {
      if (err) {
        reject(err);
      } else {
        const newSong = {
          id: this.lastID,
          title,
          genre,
          artist,
          year,
          created_at: createdAt
        };
        resolve(newSong);
      }
      db.close();
    });
  });
}


export function getAllSongs() {
  const db = createDbConnection();

  const sql = `
    SELECT id, title, genre, artist, year created_at
    FROM songs
    ORDER BY id ASC;
  `;

  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
}


export function getSongById(id) {
  const db = createDbConnection();

  const sql = `
    SELECT id, title, genre, artist, year, created_at
    FROM songs
    WHERE id = ?;
  `;

  return new Promise((resolve, reject) => {
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
      db.close();
    });
  });
}


export function updateSong({ id, title, genre, artist, year }) {
  const db = createDbConnection();

  const sql = `
    UPDATE songs
    SET title = ?, genre = ?, artist = ?, year = ?
    WHERE id = ?;
  `;

  return new Promise((resolve, reject) => {
    db.run(sql, [title, genre, artist, year, id], function (err) {
      if (err) {
        db.close();
        reject(err);
        return;
      }

      
      if (this.changes === 0) {
        db.close();
        resolve(null);
        return;
      }

      
      const selectSql = `
        SELECT id, title, genre, artist, year, created_at
        FROM songs
        WHERE id = ?;
      `;

      db.get(selectSql, [id], (err2, row) => {
        db.close();
        if (err2) {
          reject(err2);
        } else {
          resolve(row || null);
        }
      });
    });
  });
}


export function deleteSongWithLog(id) {
  const db = createDbConnection();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION;", (err) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        
        const selectSql = `
          SELECT id, title, genre, artist, year, created_at
          FROM songs
          WHERE id = ?;
        `;

        db.get(selectSql, [id], (errSelect, songRow) => {
          if (errSelect) {
            db.run("ROLLBACK;", () => {
              db.close();
              reject(errSelect);
            });
            return;
          }

          if (!songRow) {
            
            db.run("ROLLBACK;", () => {
              db.close();
              resolve(null);
            });
            return;
          }

          
          const deletedAt = new Date().toISOString();

          const insertLogSql = `
            INSERT INTO song_deletions_log (song_id, title, genre, artist, year, deleted_at)
            VALUES (?, ?, ?, ?, ?, ?);
          `;

          db.run(
            insertLogSql,
            [songRow.id, songRow.title, songRow.genre, songRow.artist, songRow.year, deletedAt],
            function (errInsertLog) {
              if (errInsertLog) {
                db.run("ROLLBACK;", () => {
                  db.close();
                  reject(errInsertLog);
                });
                return;
              }

              
              const deleteSql = `
                DELETE FROM songs
                WHERE id = ?;
              `;

              db.run(deleteSql, [id], function (errDelete) {
                if (errDelete) {
                  db.run("ROLLBACK;", () => {
                    db.close();
                    reject(errDelete);
                  });
                  return;
                }

                
                db.run("COMMIT;", (errCommit) => {
                  db.close();

                  if (errCommit) {
                    reject(errCommit);
                  } else {
                    
                    resolve({
                      deleted: true,
                      song: songRow,
                      deleted_at: deletedAt
                    });
                  }
                });
              });
            }
          );
        });
      });
    });
  });
}
