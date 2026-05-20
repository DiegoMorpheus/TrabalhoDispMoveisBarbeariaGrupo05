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

const RED   = "#8B1A1A";
const PINK  = "#F5C4C4";
const PINK2 = "#EDACAC";
const CREAM = "#F5EDE2";
const WHITE = "#FFFFFF";
const DARK  = "#1C0A0A";
const GREY  = "#9A7A7A";

const CHAVE_SESSAO = "sessao_barbearia";

const OPCOES = [
  { icon: "calendar-text",  label: "Agendamentos", route: "/views/AgendamentoListView" },
  { icon: "star-circle",    label: "Habilidades",  route: "/views/HabilidadesView"     },
  { icon: "account-edit",   label: "Cadastro",     route: "/views/ContatoFormView"     },
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
  const [sessao, setSessao] = useState(null);
  const [habilidades, setHabilidades] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      const raw = await AsyncStorage.getItem(CHAVE_SESSAO);
      if (!raw) { router.replace("/views/LoginView"); return; }
      const s = JSON.parse(raw);
      if (s.tipo !== "profissional") { router.replace("/"); return; }
      setSessao(s);

      // Carrega habilidades do profissional
      const hab = await AsyncStorage.getItem(`habilidades_${s.id}`);
      if (hab) setHabilidades(JSON.parse(hab));
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
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={sair} hitSlop={16} activeOpacity={0.6}>
          <MaterialCommunityIcons name="logout" size={22} color={RED} />
        </TouchableOpacity>

        <View style={s.idBadge}>
          <Text style={s.idTexto}>{sessao.id}</Text>
        </View>

        {/* Avatar com iniciais do profissional */}
        <View style={s.avatarCircle}>
          <Text style={s.avatarInitials}>{sessao.initials}</Text>
        </View>
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
            <TouchableOpacity
              key={op.label}
              style={s.iconWrap}
              onPress={() => router.push(op.route)}
              activeOpacity={0.75}
            >
              <View style={s.iconCircle}>
                <MaterialCommunityIcons name={op.icon} size={30} color={WHITE} />
              </View>
              <Text style={s.iconLabel}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Habilidades cadastradas ── */}
        {habilidades.length > 0 && (
          <>
            <Text style={s.secTitle}>MINHAS HABILIDADES</Text>
            <View style={s.habRow}>
              {habilidades.map((h) => (
                <View key={h} style={s.habChip}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={RED} />
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
  wrap:         { width: 110, height: 130, alignItems: "center", justifyContent: "flex-end", position: "relative" },
  oval:         { position: "absolute", width: 110, height: 130, borderRadius: 55, backgroundColor: PINK2, bottom: 0, right: -10 },
  head:         { position: "absolute", top: 8, width: 62, height: 62, borderRadius: 31, backgroundColor: RED, alignItems: "center", justifyContent: "flex-end", paddingBottom: 10, zIndex: 2 },
  mustacheWrap: { flexDirection: "row", gap: 3 },
  mustacheLeft: { width: 16, height: 7, backgroundColor: WHITE, borderRadius: 8, transform: [{ rotate: "10deg" }] },
  mustacheRight:{ width: 16, height: 7, backgroundColor: WHITE, borderRadius: 8, transform: [{ rotate: "-10deg" }] },
  neck:         { position: "absolute", top: 64, width: 20, height: 14, backgroundColor: RED, zIndex: 2 },
  shoulders:    { position: "absolute", bottom: 0, width: 90, height: 56, backgroundColor: RED, borderTopLeftRadius: 45, borderTopRightRadius: 45, zIndex: 2 },
  collar:       { position: "absolute", bottom: 28, width: 36, height: 24, backgroundColor: WHITE, borderRadius: 12, zIndex: 3 },
});

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: WHITE },
  scroll: { paddingHorizontal: 24, paddingBottom: 110, gap: 20 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: 54, paddingBottom: 12, backgroundColor: WHITE },
  idBadge:      { backgroundColor: CREAM, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5, borderColor: RED },
  idTexto:      { fontSize: 13, fontWeight: "800", color: RED, letterSpacing: 1 },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: RED, alignItems: "center", justifyContent: "center" },
  avatarInitials:{ color: WHITE, fontSize: 15, fontWeight: "900" },

  banner:     { backgroundColor: PINK, borderRadius: 22, flexDirection: "row", alignItems: "flex-end", overflow: "hidden", height: 130, paddingLeft: 20 },
  bannerLeft: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 14, paddingTop: 14 },
  bannerTag:  { fontSize: 10, fontWeight: "800", color: RED, letterSpacing: 0.8, textAlign: "center" },
  bannerNome: { fontSize: 28, fontWeight: "900", color: RED, textAlign: "center" },
  bannerSub:  { fontSize: 12, color: RED, opacity: 0.72, fontWeight: "600", textAlign: "center" },

  secTitle: { fontSize: 22, fontWeight: "900", color: DARK, textAlign: "center", letterSpacing: 1.5, marginTop: 6 },

  iconsRow:   { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  iconWrap:   { alignItems: "center", gap: 8, flex: 1 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: RED, alignItems: "center", justifyContent: "center", shadowColor: RED, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  iconLabel:  { fontSize: 13, fontWeight: "700", color: DARK, textAlign: "center" },

  habRow:  { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  habChip: { flexDirection: "row", alignItems: "center", backgroundColor: CREAM, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: RED },
  habTexto:{ fontSize: 13, fontWeight: "600", color: DARK },
});
