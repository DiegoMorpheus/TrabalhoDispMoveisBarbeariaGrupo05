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

export default class AgendamentoEntity {
  constructor(
    id,
    prestadorId,
    clienteId,
    servicoId,
    dataHoraInicio,
    dataHoraFim,
    status,
    observacoes
  ) {
    const idNorm = normalizeId(id);
    this.id = idNorm ?? newId();

    this.prestadorId = prestadorId ?? '';
    this.clienteId = clienteId ?? '';
    this.servicoId = servicoId ?? '';

    this.dataHoraInicio = dataHoraInicio ?? null;
    this.dataHoraFim = dataHoraFim ?? null;

    this.status = status ?? 'pendente';
    this.observacoes = observacoes ?? '';
  }

  get key() {
    return String(this.id);
  }

  static transforme(d) {
    return new AgendamentoEntity(
      d?.id ?? d?._id,
      d?.prestadorId,
      d?.clienteId,
      d?.servicoId,
      d?.dataHoraInicio,
      d?.dataHoraFim,
      d?.status,
      d?.observacoes
    );
  }

  // lógica útil
  isConcluido() {
    return this.status === 'concluido';
  }

  isCancelado() {
    return this.status === 'cancelado';
  }
}
