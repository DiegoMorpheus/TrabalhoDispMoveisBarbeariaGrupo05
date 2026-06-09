// app/views/AgendamentoListView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BG     = "#0F1123";
const CARD   = "#1A1F3A";
const CARD2  = "#232845";
const CYAN   = "#00C8DC";
const RED    = "#E53935";
const WHITE  = "#FFFFFF";
const GREY   = "#8892B0";
const BORDER = "#2D3461";
const GREEN  = "#2E7D32";

const CHAVE_STORAGE = "agendamentos_barbearia";
const CHAVE_SESSAO  = "sessao_barbearia";

export default function AgendamentoListView() {
  const [agendamentos,  setAgendamentos]  = useState([]);
  const [carregando,    setCarregando]    = useState(true);
  const [confirmandoId, setConfirmandoId] = useState(null);
  const [tipoConta,     setTipoConta]     = useState(null);
  const [sessaoInfo,    setSessaoInfo]    = useState(null);

  useFocusEffect(useCallback(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const rawSessao = await AsyncStorage.getItem(CHAVE_SESSAO);
        const s = rawSessao ? JSON.parse(rawSessao) : null;
        setTipoConta(s?.tipo ?? "usuario");
        setSessaoInfo(s);
        const dados = await AsyncStorage.getItem(CHAVE_STORAGE);
        if (dados) {
          let lista = JSON.parse(dados);
          if (Array.isArray(lista)) {
            if (s?.tipo === "profissional" && s?.nome)  lista = lista.filter(a => a.profissionalNome === s.nome);
            else if (s?.tipo === "usuario" && s?.id)    lista = lista.filter(a => a.clienteId === s.id);
            setAgendamentos(lista.sort((a,b) => Number(b.id) - Number(a.id)));
            return;
          }
        }
        setAgendamentos([]);
      } catch { setAgendamentos([]); }
      finally { setCarregando(false); }
    };
    carregar();
  }, []));

  const executarDelete = async (id) => {
    const dados = await AsyncStorage.getItem(CHAVE_STORAGE);
    const lista = dados ? JSON.parse(dados) : [];
    await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista.filter(a => a.id !== id)));
    setAgendamentos(prev => prev.filter(a => a.id !== id));
    setConfirmandoId(null);
  };

  if (tipoConta === null && carregando) return <View style={[s.root, s.centro]}><ActivityIndicator size="large" color={CYAN} /></View>;

  const isProfissional = tipoConta === "profissional";

  const renderItem = ({ item }) => {
    const conf = confirmandoId === item.id;
    return (
      <View style={s.card}>
        <View style={[s.cardBar, { backgroundColor: isProfissional ? CYAN : RED }]} />
        <View style={s.cardBody}>
          <View style={s.cardTop}>
            <View style={s.servicoRow}>
              <MaterialCommunityIcons name="content-cut" size={16} color={isProfissional ? CYAN : RED} />
              <Text style={s.servicoNome} numberOfLines={1}> {item.nomeServico}</Text>
            </View>
            <TouchableOpacity onPress={() => setConfirmandoId(item.id)} hitSlop={10}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={GREY} />
            </TouchableOpacity>
          </View>

          <View style={s.infoRow}><MaterialCommunityIcons name="account-outline" size={13} color={GREY} /><Text style={s.infoTexto}> Cliente: <Text style={s.infoVal}>{item.clienteId}</Text></Text></View>
          <View style={s.infoRow}><MaterialCommunityIcons name="account-tie" size={13} color={isProfissional ? CYAN : RED} /><Text style={s.infoTexto}> Profissional: </Text><View style={[s.profBadge, { borderColor: isProfissional ? CYAN : RED }]}><Text style={[s.profBadgeTexto, { color: isProfissional ? CYAN : RED }]}>{item.profissionalNome || "—"}</Text></View></View>
          <View style={s.infoRow}><MaterialCommunityIcons name="calendar" size={13} color={GREY} /><Text style={s.infoTexto}> <Text style={s.infoVal}>{item.dataSelecionada}</Text> às <Text style={s.infoVal}>{item.horaSelecionada}</Text></Text></View>

          <View style={s.badgeRow}>
            <View style={s.badge}><MaterialCommunityIcons name="check-circle-outline" size={12} color={BG} /><Text style={s.badgeTexto}> {item.status || "Confirmado"}</Text></View>
          </View>

          {conf && (
            <View style={s.confirmaBox}>
              <Text style={s.confirmaTexto}>Remover este agendamento?</Text>
              <View style={s.confirmaRow}>
                <TouchableOpacity style={[s.confirmaSim, { backgroundColor: RED }]} onPress={() => executarDelete(item.id)}><Text style={s.confirmaSimTexto}>Sim</Text></TouchableOpacity>
                <TouchableOpacity style={s.confirmaNao} onPress={() => setConfirmandoId(null)}><Text style={s.confirmaNaoTexto}>Não</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={s.root}>
      {carregando ? (
        <View style={s.centro}><ActivityIndicator size="large" color={CYAN} /></View>
      ) : agendamentos.length === 0 ? (
        <View style={s.centro}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={64} color={BORDER} />
          <Text style={s.vazioTitulo}>{isProfissional ? "Nenhum agendamento ainda" : "Sua agenda está vazia"}</Text>
          <Text style={s.vazioSub}>{isProfissional ? "Aguarde seus clientes agendarem." : "Agende um serviço agora!"}</Text>
          {!isProfissional && (
            <TouchableOpacity style={s.botaoNovo} onPress={() => router.push("/views/AgendamentoFormView")}>
              <MaterialCommunityIcons name="calendar-plus" size={16} color={BG} />
              <Text style={s.botaoNovoTexto}> NOVO AGENDAMENTO</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          <View style={s.filtroAviso}>
            <MaterialCommunityIcons name="filter-check" size={14} color={CYAN} />
            <Text style={s.filtroTexto}>  Exibindo apenas seus agendamentos</Text>
          </View>
          <FlatList data={agendamentos} keyExtractor={item => item.id} renderItem={renderItem} contentContainerStyle={s.lista} showsVerticalScrollIndicator={false} />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: BG },
  centro:{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 12 },
  vazioTitulo: { fontSize: 18, fontWeight: "800", color: WHITE, textAlign: "center" },
  vazioSub:    { fontSize: 13, color: GREY, textAlign: "center" },
  botaoNovo:   { flexDirection: "row", alignItems: "center", backgroundColor: CYAN, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, marginTop: 8, shadowColor: CYAN, shadowOpacity: 0.4, elevation: 5 },
  botaoNovoTexto: { color: BG, fontWeight: "900", fontSize: 13 },
  filtroAviso: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  filtroTexto: { fontSize: 12, fontWeight: "700", color: CYAN },
  lista:  { padding: 16, gap: 10, paddingBottom: 40 },
  card:   { backgroundColor: CARD, borderRadius: 14, flexDirection: "row", overflow: "hidden", borderWidth: 1, borderColor: BORDER },
  cardBar:{ width: 4 },
  cardBody:{ flex: 1, padding: 14, gap: 5 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  servicoRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  servicoNome:{ fontSize: 15, fontWeight: "800", color: WHITE, flex: 1 },
  infoRow:    { flexDirection: "row", alignItems: "center" },
  infoTexto:  { fontSize: 12, color: GREY },
  infoVal:    { color: WHITE, fontWeight: "700" },
  profBadge:  { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  profBadgeTexto: { fontSize: 11, fontWeight: "800" },
  badgeRow: { flexDirection: "row", marginTop: 4 },
  badge:    { flexDirection: "row", alignItems: "center", backgroundColor: GREEN, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTexto: { fontSize: 10, fontWeight: "800", color: WHITE },
  confirmaBox:  { backgroundColor: CARD2, borderRadius: 8, padding: 10, marginTop: 6, gap: 8 },
  confirmaTexto:{ fontSize: 12, color: WHITE, fontWeight: "600" },
  confirmaRow:  { flexDirection: "row", gap: 8 },
  confirmaSim:  { flex: 1, borderRadius: 6, paddingVertical: 7, alignItems: "center" },
  confirmaSimTexto: { color: WHITE, fontWeight: "800", fontSize: 12 },
  confirmaNao:  { flex: 1, backgroundColor: CARD, borderRadius: 6, paddingVertical: 7, alignItems: "center", borderWidth: 1, borderColor: BORDER },
  confirmaNaoTexto: { color: GREY, fontWeight: "800", fontSize: 12 },
});
