import db from "../database/database";
import ClienteEntity from "../../entities/ClienteEntity";

export default class ClienteService {

  // 🔹 Inserir dados iniciais (executa 1 vez)
  static seed() {
    const count = db.getAllSync("SELECT COUNT(*) as total FROM clientes");

    if (count[0].total > 0) return;

    const dadosFixos = [
      {
        id: "1",
        nome: "Alice Silva",
        email: "alice@email.com",
        telefone: "11 99999-0001",
      },
      {
        id: "2",
        nome: "Bruno Costa",
        email: "bruno@email.com",
        telefone: "11 99999-0002",
      },
      {
        id: "3",
        nome: "Carla Souza",
        email: "carla@email.com",
        telefone: "11 99999-0003",
      },
      {
        id: "4",
        nome: "Diego Lima",
        email: "diego@email.com",
        telefone: "11 99999-0004",
      },
      {
        id: "5",
        nome: "Elisa Martins",
        email: "elisa@email.com",
        telefone: "11 99999-0005",
      },
    ];

    dadosFixos.forEach((cliente) => {
      db.runSync(
        "INSERT INTO clientes (id, nome, email, telefone) VALUES (?, ?, ?, ?)",
        [cliente.id, cliente.nome, cliente.email, cliente.telefone]
      );
    });
  }

  // 🔹 Buscar todos
  static findAll() {
    const result = db.getAllSync("SELECT * FROM clientes");

    const clientes = result.map((item) =>
      ClienteEntity.transforme(item)
    );

    return Promise.resolve(clientes);
  }

  // 🔹 Buscar por ID
  static findById(id) {
    const result = db.getAllSync(
      "SELECT * FROM clientes WHERE id = ?",
      [String(id)]
    );

    if (result.length === 0) {
      return Promise.resolve(null);
    }

    return Promise.resolve(
      ClienteEntity.transforme(result[0])
    );
  }

  // 🔹 Salvar (insert ou update)
  static save(cliente) {
    const existente = db.getAllSync(
      "SELECT * FROM clientes WHERE id = ?",
      [cliente.id]
    );

    if (existente.length > 0) {
      // UPDATE
      db.runSync(
        "UPDATE clientes SET nome = ?, email = ?, telefone = ? WHERE id = ?",
        [cliente.nome, cliente.email, cliente.telefone, cliente.id]
      );
    } else {
      // INSERT
      db.runSync(
        "INSERT INTO clientes (id, nome, email, telefone) VALUES (?, ?, ?, ?)",
        [cliente.id, cliente.nome, cliente.email, cliente.telefone]
      );
    }

    return Promise.resolve(cliente);
  }

  // 🔹 Deletar cliente
  static delete(id) {
    db.runSync("DELETE FROM clientes WHERE id = ?", [id]);
    return Promise.resolve(true);
  }
}