import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// ── Paleta exata da figura ───────────────────────────────────────────────────
const RED    = "#8B1A1A";   // vermelho escuro dos círculos e silhueta
const PINK   = "#F5C4C4";   // rosa do banner
const PINK2  = "#EDACAC";   // rosa mais escuro do oval atrás do homem
const CREAM  = "#F5EDE2";   // bege dos cards
const WHITE  = "#FFFFFF";
const DARK   = "#1C0A0A";   // texto quase preto
const GREY   = "#9A7A7A";

// ── Serviços ─────────────────────────────────────────────────────────────────
const SERVICOS = [
  { icon: "content-cut",   label: "Agendamentos", route: "/views/AgendamentoListView" },
  { icon: "calendar-plus", label: "Agendar",      route: "/views/AgendamentoFormView" },
  { icon: "account-plus",  label: "Cadastro",     route: "/views/ContatoFormView"     },
];

// ── Profissionais ─────────────────────────────────────────────────────────────
const PROFS = [
  { initials: "DG", nome: "Diego",     route: "/views/AgendamentoFormView" },
  { initials: "ED", nome: "Eduarda",   route: "/views/AgendamentoFormView" },
  { initials: "GH", nome: "Guilherme", route: "/views/AgendamentoFormView" },
];

// ── Silhueta do homem (Views) ─────────────────────────────────────────────────
function ManFigure() {
  return (
    <View style={man.wrap}>
      {/* Oval rosa claro atrás */}
      <View style={man.oval} />
      {/* Cabeça vermelho escuro */}
      <View style={man.head}>
        {/* Bigode branco */}
        <View style={man.mustacheWrap}>
          <View style={man.mustacheLeft} />
          <View style={man.mustacheRight} />
        </View>
      </View>
      {/* Pescoço */}
      <View style={man.neck} />
      {/* Ombros / corpo */}
      <View style={man.shoulders} />
      {/* Gola branca */}
      <View style={man.collar} />
    </View>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Index() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const load = async () => {
      const d = await AsyncStorage.getItem("usuarioLogado");
      if (d) setUsuario(JSON.parse(d));
    };
    load();
  }, []);

  const inicial = usuario?.nome?.charAt(0)?.toUpperCase() || "U";

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* ══ HEADER: ← simples | espaço | círculo avatar ═══════════════ */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} activeOpacity={0.6}>
          <Text style={s.arrow}>←</Text>
        </TouchableOpacity>

        <View style={s.avatarCircle}>
          <MaterialCommunityIcons name="account" size={26} color={PINK} />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ══ BANNER ══════════════════════════════════════════════════ */}
        <View style={s.banner}>
          {/* Texto à esquerda */}
          <View style={s.bannerLeft}>
            <Text style={s.bannerTag}>PROMOÇÃO ANIVERSÁRIO</Text>
            <Text style={s.bannerOff}>15% OFF</Text>
            <Text style={s.bannerSub}>No próximo serviço</Text>
          </View>

          {/* Silhueta do homem à direita */}
          <ManFigure />
        </View>

        {/* ══ CATEGORIAS ══════════════════════════════════════════════ */}
        <Text style={s.secTitle}>Categorias</Text>

        <View style={s.iconsRow}>
          {SERVICOS.map((sv) => (
            <TouchableOpacity
              key={sv.label}
              style={s.iconWrap}
              onPress={() => router.push(sv.route)}
              activeOpacity={0.75}
            >
              <View style={s.iconCircle}>
                <MaterialCommunityIcons name={sv.icon} size={30} color={WHITE} />
              </View>
              <Text style={s.iconLabel}>{sv.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══ ESCOLHA SEU PROFISSIONAL ════════════════════════════════ */}
        <Text style={s.secTitle}>Escolha seu Profissional</Text>

        <View style={s.cardsRow}>
          {PROFS.map((p) => (
            <TouchableOpacity
              key={p.nome}
              style={s.card}
              onPress={() => router.push(p.route)}
              activeOpacity={0.8}
            >
              {/* Círculo com iniciais do profissional */}
              <View style={s.profCircle}>
                <Text style={s.profInitials}>{p.initials}</Text>
              </View>

              <Text style={s.profNome}>{p.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ── Estilos da silhueta ────────────────────────────────────────────────────────
const man = StyleSheet.create({
  wrap: {
    width: 110,
    height: 130,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  oval: {
    position: "absolute",
    width: 110,
    height: 130,
    borderRadius: 55,
    backgroundColor: PINK2,
    bottom: 0,
    right: -10,
  },
  head: {
    position: "absolute",
    top: 8,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
    zIndex: 2,
  },
  mustacheWrap: {
    flexDirection: "row",
    gap: 3,
  },
  mustacheLeft: {
    width: 16,
    height: 7,
    backgroundColor: WHITE,
    borderRadius: 8,
    transform: [{ rotate: "10deg" }],
  },
  mustacheRight: {
    width: 16,
    height: 7,
    backgroundColor: WHITE,
    borderRadius: 8,
    transform: [{ rotate: "-10deg" }],
  },
  neck: {
    position: "absolute",
    top: 64,
    width: 20,
    height: 14,
    backgroundColor: RED,
    zIndex: 2,
  },
  shoulders: {
    position: "absolute",
    bottom: 0,
    width: 90,
    height: 56,
    backgroundColor: RED,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    zIndex: 2,
  },
  collar: {
    position: "absolute",
    bottom: 28,
    width: 36,
    height: 24,
    backgroundColor: WHITE,
    borderRadius: 12,
    zIndex: 3,
  },
});

// ── Estilos gerais ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  root: { flex: 1, backgroundColor: WHITE },

  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 110,
    gap: 20,
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 12,
    backgroundColor: WHITE,
  },
  arrow: {
    fontSize: 28,
    color: RED,
    fontWeight: "700",
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Banner ── */
  banner: {
    backgroundColor: PINK,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    overflow: "hidden",
    height: 130,
    paddingLeft: 20,
  },
  bannerLeft: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",   // centraliza horizontalmente
    paddingBottom: 14,
    paddingTop: 14,
  },
  bannerTag: {
    fontSize: 11,            // era 9
    fontWeight: "800",
    color: RED,
    letterSpacing: 0.8,
    marginBottom: 2,
    textAlign: "center",
  },
  bannerOff: {
    fontSize: 36,            // era 34
    fontWeight: "900",
    color: RED,
    lineHeight: 40,
    textAlign: "center",
  },
  bannerSub: {
    fontSize: 12,            // era 10
    color: RED,
    opacity: 0.72,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },

  /* ── Títulos ── */
  secTitle: {
    fontSize: 24,            // era 22
    fontWeight: "800",
    fontStyle: "italic",
    color: DARK,
    marginTop: 6,
  },

  /* ── Ícones de serviço ── */
  iconsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  iconWrap: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: RED,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  iconLabel: {
    fontSize: 14,            // era 12
    fontWeight: "700",       // era 600
    color: DARK,
    textAlign: "center",
  },

  /* ── Cards dos profissionais ── */
  cardsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: CREAM,
    borderRadius: 18,
    paddingVertical: 26,     // era 22 — mais espaço pois removeu estrelas
    paddingHorizontal: 6,
    alignItems: "center",
    minHeight: 170,          // reduzido pois sem estrelas/sub
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,        // era 14
    shadowColor: RED,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  profInitials: {
    color: WHITE,
    fontSize: 22,            // era 20
    fontWeight: "800",
  },
  profNome: {
    fontSize: 15,            // era 13
    fontWeight: "800",
    color: DARK,
    textAlign: "center",
  },
  profStars: {
    fontSize: 10,
    color: RED,
    marginTop: 5,
    letterSpacing: 2,
  },
  profSub: {
    fontSize: 9,
    color: GREY,
    marginTop: 3,
  },
});
