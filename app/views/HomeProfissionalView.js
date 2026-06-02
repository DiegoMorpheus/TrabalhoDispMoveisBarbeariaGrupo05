// app/views/HomeProfissionalView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AvatarIcon from "../components/AvatarIcon";

const BLUE     = "#1A4A8A";
const BLUE2    = "#2563B0";
const BLUE_LT  = "#C4D9F5";
const BLUE_LT2 = "#A8C4E8";
const WHITE    = "#FFFFFF";
const DARK     = "#0A1628";
const BG       = "#F0F5FA";

const CHAVE_SESSAO = "sessao_barbearia";
const chavePerfil  = (id) => `perfil_${id}`;

const OPCOES = [
  { icon: "calendar-text", label: "Agendamentos", route: "/views/AgendamentoListView" },
  { icon: "star-circle",   label: "Habilidades",  route: "/views/HabilidadesView"     },
  { icon: "account-edit",  label: "Cadastro",     route: "/views/ContatoFormView"     },
];

function ManFigure() {
  return (
    <View style={man.wrap}>
      <View style={man.oval} />
      <View style={man.head}>
        <View style={man.mustacheWrap}>
          <View style={man.mustacheLeft} />
          <View style={man.mustacheRight} />
        </View>
      </View>
      <View style={man.neck} />
      <View style={man.shoulders} />
      <View style={man.collar} />
    </View>
  );
}

export default function HomeProfissionalView() {
  const [sessao,      setSessao]      = useState(null);
  const [habilidades, setHabilidades] = useState([]);
  const [genero,      setGenero]      = useState(null);

  useEffect(() => {
    const carregar = async () => {
      const raw = await AsyncStorage.getItem(CHAVE_SESSAO);
      if (!raw) { router.replace("/views/LoginView"); return; }
      const s = JSON.parse(raw);
      if (s.tipo !== "profissional") { router.replace("/"); return; }
      setSessao(s);

      const hab = await AsyncStorage.getItem(`habilidades_${s.id}`);
      if (hab) setHabilidades(JSON.parse(hab));

      const rawPerfil = await AsyncStorage.getItem(chavePerfil(s.id));
      if (rawPerfil) setGenero(JSON.parse(rawPerfil).genero ?? null);
    };
    carregar();
  }, []);

  const sair = async () => {
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    router.replace("/views/LoginView");
  };

  if (!sessao) return null;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      {/* ── Header azul com bordas arredondadas na parte inferior ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={sair} hitSlop={16} activeOpacity={0.7}>
          <MaterialCommunityIcons name="logout" size={22} color={WHITE} />
        </TouchableOpacity>

        <View style={s.idBadge}>
          <Text style={s.idTexto}>{sessao.id}</Text>
        </View>

        <AvatarIcon genero={genero} size={46} bgColor={BLUE2} iconColor={WHITE} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Banner ── */}
        <View style={s.banner}>
          <View style={s.bannerLeft}>
            <Text style={s.bannerTag}>BEM-VINDO, PROFISSIONAL</Text>
            <Text style={s.bannerNome}>{sessao.nome}</Text>
            <Text style={s.bannerSub}>Gerencie sua agenda</Text>
          </View>
          <ManFigure />
        </View>

        {/* ── OPÇÕES ── */}
        <Text style={s.secTitle}>OPÇÕES</Text>
        <View style={s.iconsRow}>
          {OPCOES.map((op) => (
            <TouchableOpacity key={op.label} style={s.iconWrap} onPress={() => router.push(op.route)} activeOpacity={0.75}>
              <View style={s.iconCircle}>
                <MaterialCommunityIcons name={op.icon} size={30} color={WHITE} />
              </View>
              <Text style={s.iconLabel}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Habilidades ── */}
        {habilidades.length > 0 && (
          <>
            <Text style={s.secTitle}>MINHAS HABILIDADES</Text>
            <View style={s.habRow}>
              {habilidades.map((h) => (
                <View key={h} style={s.habChip}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={BLUE} />
                  <Text style={s.habTexto}> {h}</Text>
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const man = StyleSheet.create({
  wrap:          { width: 110, height: 130, alignItems: "center", justifyContent: "flex-end", position: "relative" },
  oval:          { position: "absolute", width: 110, height: 130, borderRadius: 55, backgroundColor: BLUE_LT2, bottom: 0, right: -10 },
  head:          { position: "absolute", top: 8, width: 62, height: 62, borderRadius: 31, backgroundColor: BLUE, alignItems: "center", justifyContent: "flex-end", paddingBottom: 10, zIndex: 2 },
  mustacheWrap:  { flexDirection: "row", gap: 3 },
  mustacheLeft:  { width: 16, height: 7, backgroundColor: WHITE, borderRadius: 8, transform: [{ rotate: "10deg" }] },
  mustacheRight: { width: 16, height: 7, backgroundColor: WHITE, borderRadius: 8, transform: [{ rotate: "-10deg" }] },
  neck:          { position: "absolute", top: 64, width: 20, height: 14, backgroundColor: BLUE, zIndex: 2 },
  shoulders:     { position: "absolute", bottom: 0, width: 90, height: 56, backgroundColor: BLUE, borderTopLeftRadius: 45, borderTopRightRadius: 45, zIndex: 2 },
  collar:        { position: "absolute", bottom: 28, width: 36, height: 24, backgroundColor: WHITE, borderRadius: 12, zIndex: 3 },
});

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: WHITE },
  scroll: { paddingHorizontal: 24, paddingBottom: 110, gap: 20 },

  // Header com bordas arredondadas embaixo
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 22,
    backgroundColor: BLUE,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    // Sombra azul suave
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    marginBottom: 4,
  },
  idBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  idTexto: { fontSize: 13, fontWeight: "800", color: WHITE, letterSpacing: 1 },

  banner:     { backgroundColor: BLUE_LT, borderRadius: 22, flexDirection: "row", alignItems: "flex-end", overflow: "hidden", height: 130, paddingLeft: 20, marginTop: 12 },
  bannerLeft: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 14, paddingTop: 14 },
  bannerTag:  { fontSize: 10, fontWeight: "800", color: BLUE, letterSpacing: 0.8, textAlign: "center" },
  bannerNome: { fontSize: 28, fontWeight: "900", color: BLUE, textAlign: "center" },
  bannerSub:  { fontSize: 12, color: BLUE2, opacity: 0.85, fontWeight: "600", textAlign: "center" },

  secTitle:   { fontSize: 22, fontWeight: "900", color: DARK, textAlign: "center", letterSpacing: 1.5, marginTop: 6 },
  iconsRow:   { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  iconWrap:   { alignItems: "center", gap: 8, flex: 1 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: BLUE, alignItems: "center", justifyContent: "center", shadowColor: BLUE, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  iconLabel:  { fontSize: 13, fontWeight: "700", color: DARK, textAlign: "center" },

  habRow:   { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  habChip:  { flexDirection: "row", alignItems: "center", backgroundColor: BG, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: BLUE },
  habTexto: { fontSize: 13, fontWeight: "600", color: DARK },
});
