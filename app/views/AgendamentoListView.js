// app/views/AgendamentoListView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WHITE = "#FFFFFF";
const DARK = "#1C0A0A";
const GREY = "#9A7A7A";
const GREEN = "#2E7D32";

// Paletas por tipo de sessão
const COR = {
  usuario: {
    accent: "#8B1A1A",
    lt: "#FFF0F0",
    border: "#FFCCCC",
    bg: "#FAFAF8",
  },
  profissional: {
    accent: "#1A4A8A",
    lt: "#EBF2FC",
    border: "#A8C4E8",
    bg: "#F0F5FA",
  },
};

const CHAVE_STORAGE = "agendamentos_barbearia";
const CHAVE_SESSAO = "sessao_barbearia";

export default function AgendamentoListView() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [confirmandoId, setConfirmandoId] = useState(null);
  // Inicia com null — definido logo na primeira carga
  const [tipoConta, setTipoConta] = useState(null);
  const [nomeProfissional, setNomeProfissional] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const carregar = async () => {
        setCarregando(true);
        try {
          // Lê sessão primeiro
          const rawSessao = await AsyncStorage.getItem(CHAVE_SESSAO);
          const s = rawSessao ? JSON.parse(rawSessao) : null;
          const tipo = s?.tipo ?? "usuario";
          const nome = s?.nome ?? null;
          setTipoConta(tipo);
          setNomeProfissional(nome);

          // Lê agendamentos
          const dados = await AsyncStorage.getItem(CHAVE_STORAGE);
          if (dados) {
            let lista = JSON.parse(dados);
            if (Array.isArray(lista)) {
              // Profissional vê só os dele
              if (tipo === "profissional" && nome) {
                lista = lista.filter((a) => a.profissionalNome === nome);
              }
              setAgendamentos(
                lista.sort((a, b) => Number(b.id) - Number(a.id)),
              );
              return;
            }
          }
          setAgendamentos([]);
        } catch (err) {
          console.error("Erro ao carregar:", err);
          setAgendamentos([]);
        } finally {
          setCarregando(false);
        }
      };
      carregar();
    }, []),
  );

  // Aguarda saber o tipo para não piscar vermelho
  if (tipoConta === null && carregando) {
    return (
      <View style={[s.root, { backgroundColor: "#FAFAF8" }]}>
        <ActivityIndicator
          size="large"
          color={GREY}
          style={{ marginTop: 60 }}
        />
      </View>
    );
  }

  const isProfissional = tipoConta === "profissional";
  const CL = isProfissional ? COR.profissional : COR.usuario;

  const executarDelete = async (id) => {
    try {
      const dados = await AsyncStorage.getItem(CHAVE_STORAGE);
      const lista = dados ? JSON.parse(dados) : [];
      const nova = lista.filter((a) => a.id !== id);
      await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(nova));
      setAgendamentos((prev) => prev.filter((a) => a.id !== id));
      setConfirmandoId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const renderItem = ({ item }) => {
    const confirmando = confirmandoId === item.id;
    return (
      <View style={s.card}>
        <View style={[s.cardBar, { backgroundColor: CL.accent }]} />
        <View style={s.cardContent}>
          <View style={s.cardTop}>
            <View style={s.servicoRow}>
              <MaterialCommunityIcons
                name="content-cut"
                size={18}
                color={CL.accent}
              />
              <Text style={s.servicoNome} numberOfLines={1}>
                {item.nomeServico}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setConfirmandoId(item.id)}
              hitSlop={10}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={22}
                color="#AAA"
              />
            </TouchableOpacity>
          </View>

          <View style={s.infoRow}>
            <MaterialCommunityIcons
              name="account-outline"
              size={15}
              color={GREY}
            />
            <Text style={s.infoTexto}>
              {"  "}Cliente ID:{" "}
              <Text style={s.infoValor}>{item.clienteId}</Text>
            </Text>
          </View>

          <View style={s.infoRow}>
            <MaterialCommunityIcons
              name="account-tie"
              size={15}
              color={CL.accent}
            />
            <Text style={s.infoTexto}>{"  "}Profissional: </Text>
            <View
              style={[
                s.profBadge,
                { backgroundColor: CL.lt, borderColor: CL.accent },
              ]}
            >
              <Text style={[s.profBadgeTexto, { color: CL.accent }]}>
                {item.profissionalNome || "—"}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <MaterialCommunityIcons name="calendar" size={15} color={GREY} />
            <Text style={s.infoTexto}>
              {"  "}Data:{" "}
              <Text style={s.infoValor}>{item.dataSelecionada}</Text>
            </Text>
          </View>

          <View style={s.infoRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={15}
              color={GREY}
            />
            <Text style={s.infoTexto}>
              {"  "}Horário:{" "}
              <Text style={s.infoValor}>{item.horaSelecionada || "—"}</Text>
            </Text>
          </View>

          <View style={s.badgeRow}>
            <View style={s.badge}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={13}
                color={WHITE}
              />
              <Text style={s.badgeTexto}> {item.status || "Confirmado"}</Text>
            </View>
          </View>

          {confirmando && (
            <View
              style={[
                s.confirmaBox,
                { backgroundColor: CL.lt, borderColor: CL.border },
              ]}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={15}
                color={CL.accent}
              />
              <Text style={[s.confirmaTexto, { color: CL.accent }]}>
                {" "}
                Remover este agendamento?
              </Text>
              <TouchableOpacity
                style={[s.confirmaBtnSim, { backgroundColor: CL.accent }]}
                onPress={() => executarDelete(item.id)}
              >
                <Text style={s.confirmaBtnSimTexto}>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.confirmaBtnNao}
                onPress={() => setConfirmandoId(null)}
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
    <View style={[s.root, { backgroundColor: CL.bg }]}>
      {carregando ? (
        <View style={s.centro}>
          <ActivityIndicator size="large" color={CL.accent} />
          <Text style={s.centroTexto}>Carregando agendamentos...</Text>
        </View>
      ) : agendamentos.length === 0 ? (
        <View style={s.centro}>
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={72}
            color="#DDD"
          />
          <Text style={s.vazioTitulo}>
            {isProfissional
              ? "Nenhum agendamento para você ainda"
              : "Nenhum agendamento ainda"}
          </Text>
          <Text style={s.vazioSub}>
            {isProfissional
              ? "Aguarde seus clientes agendarem."
              : 'Vá em "Agendar" para criar um novo.'}
          </Text>
          {!isProfissional && (
            <TouchableOpacity
              style={[
                s.botaoNovo,
                { backgroundColor: CL.accent, shadowColor: CL.accent },
              ]}
              onPress={() => router.push("/views/AgendamentoFormView")}
            >
              <MaterialCommunityIcons
                name="calendar-plus"
                size={18}
                color={WHITE}
              />
              <Text style={s.botaoNovoTexto}> NOVO AGENDAMENTO</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          {isProfissional && (
            <View style={[s.filtroAviso, { backgroundColor: CL.lt }]}>
              <MaterialCommunityIcons
                name="filter-check"
                size={15}
                color={CL.accent}
              />
              <Text style={[s.filtroTexto, { color: CL.accent }]}>
                {" "}
                Exibindo apenas seus agendamentos
              </Text>
            </View>
          )}
          {/* Aviso do filtro ativo */}
          <View style={[s.filtroAviso, { backgroundColor: CL.lt }]}>
            <MaterialCommunityIcons
              name="filter-check"
              size={15}
              color={CL.accent}
            />
            <Text style={[s.filtroTexto, { color: CL.accent }]}>
              {"  "}
              {isProfissional
                ? `Exibindo apenas seus agendamentos`
                : `Exibindo apenas seus agendamentos`}
            </Text>
          </View>
          <FlatList
            data={agendamentos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={s.lista}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  centroTexto: { fontSize: 15, color: GREY, marginTop: 8 },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK,
    textAlign: "center",
  },
  vazioSub: { fontSize: 13, color: GREY, textAlign: "center" },
  botaoNovo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 8,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoNovoTexto: { color: WHITE, fontWeight: "900", fontSize: 14 },

  filtroAviso: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E8F0",
  },
  filtroTexto: { fontSize: 13, fontWeight: "700" },

  lista: { padding: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: WHITE,
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardBar: { width: 5 },
  cardContent: { flex: 1, padding: 14, gap: 6 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  servicoRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  servicoNome: { fontSize: 16, fontWeight: "800", color: DARK, flex: 1 },

  infoRow: { flexDirection: "row", alignItems: "center" },
  infoTexto: { fontSize: 13, color: GREY },
  infoValor: { color: DARK, fontWeight: "700" },

  profBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
  },
  profBadgeTexto: { fontSize: 12, fontWeight: "800" },

  badgeRow: { flexDirection: "row", marginTop: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeTexto: { fontSize: 11, fontWeight: "800", color: WHITE },

  confirmaBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    gap: 6,
  },
  confirmaTexto: { flex: 1, fontSize: 13, fontWeight: "600" },
  confirmaBtnSim: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  confirmaBtnSimTexto: { color: WHITE, fontWeight: "800", fontSize: 13 },
  confirmaBtnNao: {
    backgroundColor: "#EEE",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  confirmaBtnNaoTexto: { color: DARK, fontWeight: "800", fontSize: 13 },
});
