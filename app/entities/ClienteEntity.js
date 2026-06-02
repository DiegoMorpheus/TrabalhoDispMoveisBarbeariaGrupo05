export default class ClienteEntity {
  constructor(id, nome, email, telefone) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
  }

  static transforme(obj) {
    return new ClienteEntity(
      obj.id,
      obj.nome,
      obj.email,
      obj.telefone
    );
  }
}