// app/views/HabilidadesView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RED   = "#8B1A1A";
const CREAM = "#F5EDE2";
const WHITE = "#FFFFFF";
const DARK  = "#1C0A0A";
const GREY  = "#9A7A7A";
const GREEN = "#2E7D32";
const BG    = "#FAFAF8";

const CHAVE_SESSAO = "sessao_barbearia";

const TODAS_HABILIDADES = [
  { id: "barba",       label: "Corte de Barba",         icon: "face-man" },
  { id: "cabelo",      label: "Corte de Cabelo",        icon: "content-cut" },
  { id: "massagem",    label: "Massagem Facial",         icon: "hand-heart" },
  { id: "sobrancelha", label: "Desenho de Sobrancelha", icon: "eye" },
  { id: "capilar",     label: "Tratamento Capilar",     icon: "bottle-tonic" },
];

export default function HabilidadesView() {
  const [sessao,      setSessao]      = useState(null);
  const [selecionadas, setSelecionadas] = useState([]);
  const [salvando,    setSalvando]    = useState(false);
  const [salvo,       setSalvo]       = useState(false);
  const [erro,        setErro]        = useState("");

  useEffect(() => {
    const carregar = async () => {
      const raw = await AsyncStorage.getItem(CHAVE_SESSAO);
      if (!raw) { router.replace("/views/LoginView"); return; }
      const s = JSON.parse(raw);
      setSessao(s);

      // Carrega habilidades já salvas deste profissional (pelo nome)
      const chaveNome = `habilidades_perfil_${s.nome}`;
      const hab = await AsyncStorage.getItem(chaveNome);
      if (hab) setSelecionadas(JSON.parse(hab));
    };
    carregar();
  }, []);

  const toggle = (label) => {
    setErro("");
    setSelecionadas((prev) => {
      if (prev.includes(label)) return prev.filter((h) => h !== label);
      if (prev.length >= 3) {
        setErro("Você pode selecionar no máximo 3 habilidades.");
        return prev;
      }
      return [...prev, label];
    });
  };

  const salvar = async () => {
    if (selecionadas.length === 0) {
      setErro("Selecione ao menos uma habilidade.");
      return;
    }

    setSalvando(true);
    try {
      // Salva indexado pelo nome (visível para usuários) E pelo ID (visível na home do profissional)
      const chaveNome = `habilidades_perfil_${sessao.nome}`;
      const chaveId   = `habilidades_${sessao.id}`;
      await AsyncStorage.setItem(chaveNome, JSON.stringify(selecionadas));
      await AsyncStorage.setItem(chaveId,   JSON.stringify(selecionadas));

      setSalvo(true);
      setSalvando(false);
      setTimeout(() => router.replace("/views/HomeProfissionalView"), 1400);
    } catch (err) {
      setSalvando(false);
      setErro("Erro ao salvar. Tente novamente.");
    }
  };

  if (salvo) {
    return (
      <View style={s.root}>
        <View style={s.sucessoTela}>
          <View style={s.sucessoIcone}>
            <MaterialCommunityIcons name="check-bold" size={48} color={WHITE} />
          </View>
          <Text style={s.sucessoTitulo}>Habilidades salvas!</Text>
          <Text style={s.sucessoSub}>Voltando para a home…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Card principal ── */}
        <View style={s.card}>
          <View style={s.cardBarra} />
          <View style={s.cardBody}>

            <Text style={s.titulo}>MINHAS HABILIDADES</Text>
            <Text style={s.subtitulo}>Selecione até 3 especialidades</Text>

            {/* Contador */}
            <View style={s.contadorRow}>
              <Text style={s.contadorTexto}>{selecionadas.length}/3 selecionadas</Text>
            </View>

            {/* Erro inline */}
            {erro ? (
              <View style={s.erroBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={15} color={RED} />
                <Text style={s.erroTexto}> {erro}</Text>
              </View>
            ) : null}

            {/* Lista de habilidades */}
            {TODAS_HABILIDADES.map((h) => {
              const sel = selecionadas.includes(h.label);
              return (
                <TouchableOpacity
                  key={h.id}
                  style={[s.habItem, sel && s.habItemSel]}
                  onPress={() => toggle(h.label)}
                  activeOpacity={0.8}
                >
                  <View style={[s.habIcone, sel && s.habIconeSel]}>
                    <MaterialCommunityIcons name={h.icon} size={24} color={sel ? WHITE : RED} />
                  </View>
                  <Text style={[s.habLabel, sel && s.habLabelSel]}>{h.label}</Text>
                  <MaterialCommunityIcons
                    name={sel ? "check-circle" : "circle-outline"}
                    size={24}
                    color={sel ? WHITE : GREY}
                  />
                </TouchableOpacity>
              );
            })}

            {/* Botão Salvar */}
            <TouchableOpacity
              style={[s.botao, salvando && s.botaoDesativado]}
              onPress={salvar}
              disabled={salvando}
              activeOpacity={0.85}
            >
              {salvando ? (
                <ActivityIndicator size="small" color={WHITE} />
              ) : (
                <View style={s.botaoConteudo}>
                  <Text style={s.botaoTexto}>SALVAR HABILIDADES</Text>
                  <MaterialCommunityIcons name="content-save" size={20} color={WHITE} style={{ marginLeft: 10 }} />
                </View>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },

  // Sucesso
  sucessoTela:  { flex: 1, justifyContent: "center", alignItems: "center", gap: 14, padding: 32 },
  sucessoIcone: { width: 90, height: 90, borderRadius: 45, backgroundColor: GREEN, justifyContent: "center", alignItems: "center" },
  sucessoTitulo:{ fontSize: 24, fontWeight: "900", color: DARK },
  sucessoSub:   { fontSize: 13, color: GREY },

  // Card
  card:    { backgroundColor: WHITE, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardBarra: { height: 6, backgroundColor: RED },
  cardBody:  { padding: 24, gap: 12 },

  titulo:    { fontSize: 20, fontWeight: "900", color: DARK, textAlign: "center", letterSpacing: 1.5 },
  subtitulo: { fontSize: 13, color: GREY, textAlign: "center", marginTop: -4 },

  contadorRow: { alignItems: "flex-end" },
  contadorTexto: { fontSize: 12, fontWeight: "700", color: RED },

  erroBox:  { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FFCCCC", borderRadius: 8, padding: 10 },
  erroTexto:{ fontSize: 13, color: RED, fontWeight: "600", flex: 1 },

  // Itens de habilidade
  habItem:    { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 12, backgroundColor: "#F9F9F9", borderWidth: 1.5, borderColor: "#EEE" },
  habItemSel: { backgroundColor: RED, borderColor: RED },
  habIcone:   { width: 44, height: 44, borderRadius: 22, backgroundColor: CREAM, alignItems: "center", justifyContent: "center" },
  habIconeSel:{ backgroundColor: "rgba(255,255,255,0.2)" },
  habLabel:   { flex: 1, fontSize: 15, fontWeight: "700", color: DARK },
  habLabelSel:{ color: WHITE },

  // Botão
  botao:         { backgroundColor: RED, borderRadius: 8, height: 52, justifyContent: "center", alignItems: "center", marginTop: 8, shadowColor: RED, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
  botaoDesativado:{ backgroundColor: GREY, shadowOpacity: 0, elevation: 0 },
  botaoConteudo: { flexDirection: "row", alignItems: "center" },
  botaoTexto:    { color: WHITE, fontSize: 15, fontWeight: "900", letterSpacing: 1.2 },
});
