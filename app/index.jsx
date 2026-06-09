// app/index.jsx
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
import AvatarIcon from "./components/AvatarIcon";

const BG = "#0F1123";
const CARD = "#1A1F3A";
const CARD2 = "#232845";
const CYAN = "#00C8DC";
const RED = "#E53935";
const WHITE = "#FFFFFF";
const GREY = "#8892B0";
const BORDER = "#2D3461";

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

export default function Index() {
  const [sessao, setSessao] = useState(null);
  const [nomeUsuario, setNomeUsuario] = useState(""); // 1. NOVO ESTADO PARA O NOME
  const [genero, setGenero] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [validando, setValidando] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      try {
        const rawSessao = await AsyncStorage.getItem(CHAVE_SESSAO);
        if (!rawSessao) {
          router.replace("/views/LoginView");
          return;
        }
        const s = JSON.parse(rawSessao);
        const rawCad = await AsyncStorage.getItem(CHAVE_CADASTROS);
        const cads = rawCad ? JSON.parse(rawCad) : {};
        const conta = cads[s.id];

        if (!conta || conta.ativa === false) {
          await AsyncStorage.removeItem(CHAVE_SESSAO);
          router.replace("/views/LoginView");
          return;
        }
        if (s.tipo === "profissional") {
          router.replace("/views/HomeProfissionalView");
          return;
        }

        // 2. LOGICA PARA PEGAR O PRIMEIRO NOME DO USUÁRIO
        if (conta && conta.nome) {
          const primeiroNome = conta.nome.trim().split(" ")[0];
          setNomeUsuario(primeiroNome);
        } else {
          setNomeUsuario(s.id); // Caso antigo ou sem nome salvo, mostra o ID
        }

        setSessao(s);
        const rawPerfil = await AsyncStorage.getItem(chavePerfil(s.id));
        if (rawPerfil) setGenero(JSON.parse(rawPerfil).genero ?? null);
        const profs = Object.values(cads).filter(
          (c) => c.tipo === "profissional" && c.ativa !== false,
        );
        setProfissionais(profs);
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
  const abrirProf = (p) =>
    router.push({
      pathname: "/views/ProfissionalDetalheView",
      params: { nome: p.nome, initials: p.initials },
    });

  if (validando)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BG,
        }}
      >
        <ActivityIndicator size="large" color={CYAN} />
      </View>
    );
  if (!sessao) return null;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={sair} hitSlop={16} activeOpacity={0.6}>
          <MaterialCommunityIcons name="logout" size={22} color={GREY} />
        </TouchableOpacity>
        <View style={s.idBadge}>
          <Text style={s.idTexto}>{sessao.id}</Text>
        </View>
        <View style={s.avatarWrap}>
          <AvatarIcon genero={genero} size={42} bgColor={CYAN} iconColor={BG} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner boas-vindas */}
        <View style={s.banner}>
          <View style={s.bannerTextos}>
            <Text style={s.bannerBem}>BEM VINDO DE VOLTA</Text>
            {/* 3. EXIBE O NOME TRATADO AQUI */}
            <Text style={s.bannerNome}>{nomeUsuario}</Text>
            <Text style={s.bannerSub}>Pronto para um novo corte?</Text>
          </View>
          <View style={s.bannerPromo}>
            <Text style={s.promoOff}>15%</Text>
            <Text style={s.promoLabel}>OFF</Text>
          </View>
        </View>

        {/* Opções */}
        <Text style={s.secTitle}>SERVIÇOS</Text>
        <View style={s.iconsRow}>
          {OPCOES.map((op) => (
            <TouchableOpacity
              key={op.label}
              style={s.iconWrap}
              onPress={() => router.push(op.route)}
              activeOpacity={0.75}
            >
              <View style={s.iconCircle}>
                <MaterialCommunityIcons name={op.icon} size={26} color={BG} />
              </View>
              <Text style={s.iconLabel}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profissionais */}
        <Text style={s.secTitle}>PROFISSIONAIS</Text>
        {profissionais.length === 0 ? (
          <View style={s.semProfs}>
            <MaterialCommunityIcons
              name="account-off-outline"
              size={36}
              color={BORDER}
            />
            <Text style={s.semProfsTexto}>Nenhum profissional cadastrado</Text>
          </View>
        ) : (
          <View style={s.cardsRow}>
            {profissionais.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={s.profCard}
                onPress={() => abrirProf(p)}
                activeOpacity={0.8}
              >
                <View style={s.profCircle}>
                  <Text style={s.profInitials}>{p.initials}</Text>
                </View>
                <Text style={s.profNome} numberOfLines={1}>
                  {p.nome}
                </Text>
                <View style={s.profBadge}>
                  <Text style={s.profBadgeTexto}>PROF</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: BG,
  },
  idBadge: {
    backgroundColor: CARD2,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  idTexto: { fontSize: 12, fontWeight: "800", color: CYAN, letterSpacing: 1 },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: CYAN,
  },
  banner: {
    backgroundColor: CARD,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 8,
  },
  bannerTextos: { flex: 1 },
  bannerBem: { fontSize: 11, fontWeight: "800", color: CYAN, letterSpacing: 2 },
  bannerNome: { fontSize: 26, fontWeight: "900", color: WHITE },
  bannerSub: { fontSize: 12, color: GREY, marginTop: 2 },
  bannerPromo: {
    backgroundColor: RED,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  promoOff: { fontSize: 20, fontWeight: "900", color: WHITE },
  promoLabel: { fontSize: 11, fontWeight: "800", color: WHITE, marginTop: -4 },
  secTitle: { fontSize: 13, fontWeight: "800", color: CYAN, letterSpacing: 2 },
  iconsRow: { flexDirection: "row", justifyContent: "space-between" },
  iconWrap: { alignItems: "center", gap: 8, flex: 1 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CYAN,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: CYAN,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  iconLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: WHITE,
    textAlign: "center",
  },
  cardsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  profCard: {
    width: "30%",
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  profCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: CARD2,
    borderWidth: 2,
    borderColor: CYAN,
    alignItems: "center",
    justifyContent: "center",
  },
  profInitials: { fontSize: 16, fontWeight: "900", color: CYAN },
  profNome: {
    fontSize: 12,
    fontWeight: "700",
    color: WHITE,
    textAlign: "center",
  },
  profBadge: {
    backgroundColor: "rgba(0,200,220,0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: CYAN,
  },
  profBadgeTexto: {
    fontSize: 9,
    fontWeight: "800",
    color: CYAN,
    letterSpacing: 1,
  },
  semProfs: { alignItems: "center", gap: 8, paddingVertical: 20 },
  semProfsTexto: { fontSize: 13, color: GREY },
});
