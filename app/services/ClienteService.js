import ClienteEntity from "../entities/ClienteEntity";

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

let clientes = dadosFixos.map((item) => ClienteEntity.transforme(item));

export default class ClienteService {
  static findAll() {
    return Promise.resolve([...clientes]);
  }

  static findById(id) {
    const cliente = clientes.find((item) => item.id === String(id));
    return Promise.resolve(cliente ?? null);
  }

  static save(cliente) {
    const index = clientes.findIndex((item) => item.id === cliente.id);
    if (index >= 0) {
      clientes[index] = cliente;
    } else {
      clientes.push(cliente);
    }
    return Promise.resolve(cliente);
  }
}
