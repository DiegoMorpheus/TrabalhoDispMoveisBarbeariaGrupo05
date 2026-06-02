function normalizeId(raw) {
  if (!raw) return null;
  const t = typeof raw;

  if (t === 'string' || t === 'number' || t === 'bigint') return String(raw);

  if (t === 'object') {
    if ('$oid' in raw) return String(raw.$oid);
    if ('id' in raw) return String(raw.id);
  }

  return null;
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default class ServicoEntity {
  constructor(
    id,
    prestadorId,
    nome,
    descricao,
    duracaoMinutos,
    preco
  ) {
    const idNorm = normalizeId(id);
    this.id = idNorm ?? newId();

    this.prestadorId = prestadorId ?? '';
    this.nome = nome ?? '';
    this.descricao = descricao ?? '';
    this.duracaoMinutos = Number(duracaoMinutos ?? 0);
    this.preco = Number(preco ?? 0);
  }

  get key() {
    return String(this.id);
  }

  static transforme(d) {
    return new ServicoEntity(
      d?.id ?? d?._id,
      d?.prestadorId,
      d?.nome,
      d?.descricao,
      d?.duracaoMinutos,
      d?.preco
    );
  }
}