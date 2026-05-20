// app/views/AgendamentoListView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RED   = "#8B1A1A";
const WHITE = "#FFFFFF";
const DARK  = "#1C0A0A";
const GREY  = "#9A7A7A";
const GREEN = "#2E7D32";
const BG    = "#FAFAF8";

const CHAVE_STORAGE = "agendamentos_barbearia";

export default function AgendamentoListView() {
  const [agendamentos,  setAgendamentos]  = useState([]);
  const [carregando,    setCarregando]    = useState(true);
  // ID do agendamento cuja confirmação de delete está visível
  const [confirmandoId, setConfirmandoId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        setCarregando(true);
        try {
          const dados = await AsyncStorage.getItem(CHAVE_STORAGE);
          if (dados) {
            const lista = JSON.parse(dados);
            if (Array.isArray(lista)) {
              setAgendamentos(lista.sort((a, b) => Number(b.id) - Number(a.id)));
              return;
            }
          }
          setAgendamentos([]);
        } catch (err) {
          console.error("Erro ao carregar agendamentos:", err);
          setAgendamentos([]);
        } finally {
          setCarregando(false);
        }
      };
      carregar();
    }, [])
  );

  // ── Deletar sem Alert (funciona na web) ───────────────────────────────────
  const confirmarDelete = (id) => setConfirmandoId(id);
  const cancelarDelete  = ()  => setConfirmandoId(null);

  const executarDelete = async (id) => {
    try {
      const nova = agendamentos.filter(a => a.id !== id);
      await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(nova));
      setAgendamentos(nova);
      setConfirmandoId(null);
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  const renderItem = ({ item }) => {
    const confirmando = confirmandoId === item.id;

    return (
      <View style={s.card}>
        <View style={s.cardBar} />
        <View style={s.cardContent}>

          {/* Topo: serviço + botão lixeira */}
          <View style={s.cardTop}>
            <View style={s.servicoRow}>
              <MaterialCommunityIcons name="content-cut" size={18} color={RED} />
              <Text style={s.servicoNome} numberOfLines={1}>{item.nomeServico}</Text>
            </View>
            <TouchableOpacity
              onPress={() => confirmarDelete(item.id)}
              hitSlop={10}
              style={s.lixeiraBtn}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={22} color="#AAA" />
            </TouchableOpacity>
          </View>

          {/* Infos */}
          <View style={s.infoRow}>
            <MaterialCommunityIcons name="account-outline" size={15} color={GREY} />
            <Text style={s.infoTexto}>{"  "}Cliente ID: <Text style={s.infoValor}>{item.clienteId}</Text></Text>
          </View>
          <View style={s.infoRow}>
            <MaterialCommunityIcons name="calendar" size={15} color={GREY} />
            <Text style={s.infoTexto}>{"  "}Data: <Text style={s.infoValor}>{item.dataSelecionada}</Text></Text>
          </View>
          <View style={s.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={15} color={GREY} />
            <Text style={s.infoTexto}>{"  "}Horário: <Text style={s.infoValor}>{item.horaSelecionada || "—"}</Text></Text>
          </View>

          {/* Badge status */}
          <View style={s.badgeRow}>
            <View style={s.badge}>
              <MaterialCommunityIcons name="check-circle-outline" size={13} color={WHITE} />
              <Text style={s.badgeTexto}> {item.status || "Confirmado"}</Text>
            </View>
          </View>

          {/* ── Confirmação de delete inline (sem Alert) ── */}
          {confirmando && (
            <View style={s.confirmaBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color={RED} />
              <Text style={s.confirmaTexto}>  Remover este agendamento?</Text>
              <TouchableOpacity
                style={s.confirmaBtnSim}
                onPress={() => executarDelete(item.id)}
                activeOpacity={0.8}
              >
                <Text style={s.confirmaBtnSimTexto}>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.confirmaBtnNao}
                onPress={cancelarDelete}
                activeOpacity={0.8}
              >
                <Text style={s.confirmaBtnNaoTexto}>Não</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {carregando ? (
        <View style={s.centro}>
          <ActivityIndicator size="large" color={RED} />
          <Text style={s.centroTexto}>Carregando agendamentos...</Text>
        </View>
      ) : agendamentos.length === 0 ? (
        <View style={s.centro}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={72} color="#DDD" />
          <Text style={s.vazioTitulo}>Nenhum agendamento ainda</Text>
          <Text style={s.vazioSub}>Vá em "Agendar" para criar um novo.</Text>
          <TouchableOpacity
            style={s.botaoNovo}
            onPress={() => router.push("/views/AgendamentoFormView")}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="calendar-plus" size={18} color={WHITE} />
            <Text style={s.botaoNovoTexto}> NOVO AGENDAMENTO</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={agendamentos}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.lista}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  centro: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32, gap: 12 },
  centroTexto:  { fontSize: 15, color: GREY, marginTop: 8 },
  vazioTitulo:  { fontSize: 18, fontWeight: "800", color: DARK, textAlign: "center" },
  vazioSub:     { fontSize: 13, color: GREY, textAlign: "center" },
  botaoNovo: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: RED, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 30, marginTop: 8,
    shadowColor: RED, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  botaoNovoTexto: { color: WHITE, fontWeight: "900", fontSize: 14, letterSpacing: 0.8 },

  lista: { padding: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: WHITE, borderRadius: 14,
    flexDirection: "row", overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardBar:     { width: 5, backgroundColor: RED },
  cardContent: { flex: 1, padding: 14, gap: 6 },

  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  servicoRow:  { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  servicoNome: { fontSize: 16, fontWeight: "800", color: DARK, flex: 1 },
  lixeiraBtn:  { padding: 4 },

  infoRow:   { flexDirection: "row", alignItems: "center" },
  infoTexto: { fontSize: 13, color: GREY },
  infoValor: { color: DARK, fontWeight: "700" },

  badgeRow: { flexDirection: "row", marginTop: 6 },
  badge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: GREEN, paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  badgeTexto: { fontSize: 11, fontWeight: "800", color: WHITE, letterSpacing: 0.5 },

  // Confirmação inline de delete
  confirmaBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FFCCCC",
    borderRadius: 8, padding: 10, marginTop: 10, gap: 6,
  },
  confirmaTexto: { flex: 1, fontSize: 13, color: RED, fontWeight: "600" },
  confirmaBtnSim: {
    backgroundColor: RED, paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 6,
  },
  confirmaBtnSimTexto: { color: WHITE, fontWeight: "800", fontSize: 13 },
  confirmaBtnNao: {
    backgroundColor: "#EEE", paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 6,
  },
  confirmaBtnNaoTexto: { color: DARK, fontWeight: "800", fontSize: 13 },
});
