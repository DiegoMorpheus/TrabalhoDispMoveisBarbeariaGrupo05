import AsyncStorage from "@react-native-async-storage/async-storage";
import ContatoEntity from "../entities/ClienteEntity";

const STORAGE_KEY = "@contatos";

let contatos = [];

export default class ContatoService {

  // ✅ contatos padrão
  static getDefaultContatos() {
    return [
      new ContatoEntity("1", "Maluco", "maluco@email.com", "31 98888-0001", true, "Trabalho", "M"),
      new ContatoEntity("2", "Mariana Souza", "mariana@email.com", "31 97777-0002", false, "Amigos", "F"),
      new ContatoEntity("3", "Pedro Henrique", "pedro@email.com", "31 96666-0003", true, "Família", "M"),
      new ContatoEntity("4", "Juliana Costa", "juliana@email.com", "31 95555-0004", false, "Faculdade", "F"),
      new ContatoEntity("5", "Rafael Martins", "rafael@email.com", "31 94444-0005", true, "Trabalho", "M"),
    ];
  }

  // ✅ NOVO: gerar próximo ID automático
  static async getNextId() {
    const lista = await this.findAll();

    if (lista.length === 0) return "1";

    const ids = lista
      .map(item => parseInt(item.id))
      .filter(id => !isNaN(id));

    const maiorId = Math.max(...ids);

    return String(maiorId + 1);
  }

  // ✅ buscar todos
  static async findAll() {
    const json = await AsyncStorage.getItem(STORAGE_KEY);

    if (json) {
      const lista = JSON.parse(json);
      contatos = lista.map(item => ContatoEntity.transforme(item));
      return [...contatos];
    }

    // primeira execução
    contatos = this.getDefaultContatos();
    await this.saveAll(contatos);

    return [...contatos];
  }

  // ✅ buscar por ID
  static async findById(id) {
    const lista = await this.findAll();
    return lista.find(item => item.id === String(id)) ?? null;
  }

  // ✅ salvar contato
  static async save(contato) {
    const lista = await this.findAll();

    // ✅ se não tiver ID, gera automaticamente
    if (!contato.id) {
      contato.id = await this.getNextId();
    }

    const index = lista.findIndex(item => item.id === contato.id);

    if (index >= 0) {
      lista[index] = contato;
    } else {
      lista.push(contato);
    }

    contatos = lista;

    await this.saveAll(lista);

    return contato;
  }

  // ✅ salvar lista
  static async saveAll(lista) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  // ✅ limpar + restaurar
  static async clear() {
    await AsyncStorage.removeItem(STORAGE_KEY);

    contatos = this.getDefaultContatos();
    await this.saveAll(contatos);

    return [...contatos];
  }
}