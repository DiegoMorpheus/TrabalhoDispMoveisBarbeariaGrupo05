// app/index.jsx
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
  ActivityIndicator,
} from "react-native";
import AvatarIcon from "./components/AvatarIcon";

const RED = "#8B1A1A";
const PINK = "#F5C4C4";
const PINK2 = "#EDACAC";
const CREAM = "#F5EDE2";
const WHITE = "#FFFFFF";
const DARK = "#1C0A0A";

const CHAVE_SESSAO = "sessao_barbearia";
const CHAVE_CADASTROS = "cadastros_app";
const chavePerfil = (id) => `perfil_${id}`;

const OPCOES = [
  {
    icon: "calendar-check",
    label: "Minha Agenda",
    route: "/views/AgendamentoListView",
  },
  {
    icon: "calendar-plus",
    label: "Agendar",
    route: "/views/AgendamentoFormView",
  },
  {
    icon: "account-edit",
    label: "Meu Cadastro",
    route: "/views/ContatoFormView",
  },
];

const PROFS_DEFAULT = [
  { initials: "DG", nome: "Diego", generoDefault: "M" },
  { initials: "ED", nome: "Eduarda", generoDefault: "F" },
  { initials: "GH", nome: "Guilherme", generoDefault: "M" },
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

export default function Index() {
  const [sessao, setSessao] = useState(null);
  const [genero, setGenero] = useState(null);
  const [generosProfs, setGenerosProfs] = useState({});
  // ✅ Loading impede flash da tela antes de validar a sessão
  const [validando, setValidando] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      try {
        const rawSessao = await AsyncStorage.getItem(CHAVE_SESSAO);

        // Sem sessão → login
        if (!rawSessao) {
          router.replace("/views/LoginView");
          return;
        }

        const s = JSON.parse(rawSessao);

        // ✅ Revalida sessão contra o banco (segurança contra URL direta)
        const rawCad = await AsyncStorage.getItem(CHAVE_CADASTROS);
        const cadastros = rawCad ? JSON.parse(rawCad) : {};
        const contaAtual = cadastros[s.id];

        // Conta não existe ou foi desativada → limpa sessão e vai para login
        if (!contaAtual || contaAtual.ativa === false) {
          await AsyncStorage.removeItem(CHAVE_SESSAO);
          router.replace("/views/LoginView");
          return;
        }

        // Profissional tentando acessar tela de usuário → redireciona
        if (s.tipo === "profissional") {
          router.replace("/views/HomeProfissionalView");
          return;
        }

        setSessao(s);

        // Carrega gênero do perfil
        const rawPerfil = await AsyncStorage.getItem(chavePerfil(s.id));
        if (rawPerfil) setGenero(JSON.parse(rawPerfil).genero ?? null);

        // Carrega gêneros dos profissionais
        const mapa = {};
        for (const p of PROFS_DEFAULT) {
          const g = await AsyncStorage.getItem(`genero_prof_${p.nome}`);
          mapa[p.nome] = g ?? p.generoDefault;
        }
        setGenerosProfs(mapa);
      } catch {
        await AsyncStorage.removeItem(CHAVE_SESSAO);
        router.replace("/views/LoginView");
      } finally {
        setValidando(false);
      }
    };
    verificar();
  }, []);

  const sair = async () => {
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    router.replace("/views/LoginView");
  };

  const abrirProfissional = (prof) => {
    router.push({
      pathname: "/views/ProfissionalDetalheView",
      params: { nome: prof.nome, initials: prof.initials },
    });
  };

  // ✅ Tela de carregamento enquanto valida — evita flash da tela de login
  if (validando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: WHITE,
        }}
      >
        <ActivityIndicator size="large" color={RED} />
      </View>
    );
  }

  if (!sessao) return null;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      <View style={s.header}>
        <TouchableOpacity onPress={sair} hitSlop={16} activeOpacity={0.6}>
          <MaterialCommunityIcons name="logout" size={22} color={RED} />
        </TouchableOpacity>
        <View style={s.idBadge}>
          <Text style={s.idTexto}>{sessao.id}</Text>
        </View>
        <AvatarIcon genero={genero} size={46} bgColor={RED} iconColor={WHITE} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.banner}>
          <View style={s.bannerLeft}>
            <Text style={s.bannerTag}>PROMOÇÃO ANIVERSÁRIO</Text>
            <Text style={s.bannerOff}>15% OFF</Text>
            <Text style={s.bannerSub}>No próximo serviço</Text>
          </View>
          <ManFigure />
        </View>

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
                <MaterialCommunityIcons
                  name={op.icon}
                  size={30}
                  color={WHITE}
                />
              </View>
              <Text style={s.iconLabel}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.secTitle}>PROFISSIONAIS</Text>
        <View style={s.cardsRow}>
          {PROFS_DEFAULT.map((p) => (
            <TouchableOpacity
              key={p.nome}
              style={s.card}
              onPress={() => abrirProfissional(p)}
              activeOpacity={0.8}
            >
              <AvatarIcon
                genero={generosProfs[p.nome] ?? p.generoDefault}
                size={76}
                bgColor={RED}
                iconColor={WHITE}
              />
              <Text style={s.profNome}>{p.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

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
  mustacheWrap: { flexDirection: "row", gap: 3 },
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

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: WHITE },
  scroll: { paddingHorizontal: 24, paddingBottom: 110, gap: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 12,
    backgroundColor: WHITE,
  },
  idBadge: {
    backgroundColor: CREAM,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: RED,
  },
  idTexto: { fontSize: 13, fontWeight: "800", color: RED, letterSpacing: 1 },
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
    alignItems: "center",
    paddingBottom: 14,
    paddingTop: 14,
  },
  bannerTag: {
    fontSize: 11,
    fontWeight: "800",
    color: RED,
    letterSpacing: 0.8,
    textAlign: "center",
  },
  bannerOff: {
    fontSize: 36,
    fontWeight: "900",
    color: RED,
    lineHeight: 40,
    textAlign: "center",
  },
  bannerSub: {
    fontSize: 12,
    color: RED,
    opacity: 0.72,
    fontWeight: "600",
    textAlign: "center",
  },
  secTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: DARK,
    textAlign: "center",
    letterSpacing: 1.5,
    marginTop: 6,
  },
  iconsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  iconWrap: { alignItems: "center", gap: 8, flex: 1 },
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
    fontSize: 13,
    fontWeight: "700",
    color: DARK,
    textAlign: "center",
  },
  cardsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  card: {
    flex: 1,
    backgroundColor: CREAM,
    borderRadius: 18,
    paddingVertical: 26,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 14,
    minHeight: 160,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profNome: {
    fontSize: 15,
    fontWeight: "800",
    color: DARK,
    textAlign: "center",
  },
});
