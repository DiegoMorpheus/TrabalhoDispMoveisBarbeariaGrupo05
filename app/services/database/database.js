import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("barbearia.db");

export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY NOT NULL,
    tipo TEXT NOT NULL,
    nome TEXT,
    initials TEXT
    );
`);
}

export default db;
