// app/services/database/database.js
import { Platform } from "react-native";

// ── Na web o SQLite não funciona — usa objeto mock ────────────────────────────
// No Android/iOS usa SQLite normalmente conforme ensinado nas aulas

let db = null;

if (Platform.OS !== "web") {
  const SQLite = require("expo-sqlite");
  db = SQLite.openDatabaseSync("barbearia.db");
}

export function initDB() {
  if (Platform.OS === "web") {
    // Web não suporta SQLite — persistência feita via AsyncStorage nas views
    console.log("[DB] Plataforma web detectada — SQLite ignorado.");
    return;
  }

  db.execSync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id       TEXT PRIMARY KEY NOT NULL,
      tipo     TEXT NOT NULL,
      nome     TEXT,
      initials TEXT
    );
  `);

  console.log("[DB] Banco inicializado com sucesso.");
}

export default db;
