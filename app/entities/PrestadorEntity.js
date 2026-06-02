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

export default class PrestadorEntity {
  constructor(
    id,
    nomeFantasia,
    categoria,
    telefone,
    horarioAbertura,
    horarioFechamento
  ) {
    const idNorm = normalizeId(id);
    this.id = idNorm ?? newId();

    this.nomeFantasia = nomeFantasia ?? '';
    this.categoria = categoria ?? '';
    this.telefone = telefone ?? '';
    this.horarioAbertura = horarioAbertura ?? '';
    this.horarioFechamento = horarioFechamento ?? '';
  }

  get key() {
    return String(this.id);
  }

  static transforme(d) {
    return new PrestadorEntity(
      d?.id ?? d?._id,
      d?.nomeFantasia,
      d?.categoria,
      d?.telefone,
      d?.horarioAbertura,
      d?.horarioFechamento
    );
  }
}