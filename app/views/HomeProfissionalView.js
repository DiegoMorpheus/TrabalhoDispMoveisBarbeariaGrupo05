// app/views/HomeProfissionalView.js
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
import AvatarIcon from "../components/AvatarIcon";

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
    icon: "calendar-text",
    label: "Agendamentos",
    route: "/views/AgendamentoListView",
  },
  {
    icon: "star-circle",
    label: "Habilidades",
    route: "/views/HabilidadesView",
  },
  { icon: "account-edit", label: "Cadastro", route: "/views/ContatoFormView" },
];

export default function HomeProfissionalView() {
  const [sessao, setSessao] = useState(null);
  const [habs, setHabs] = useState([]);
  const [genero, setGenero] = useState(null);
  const [validando, setValidando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
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
        if (s.tipo !== "profissional") {
          router.replace("/");
          return;
        }
        setSessao(s);
        const rawHab = await AsyncStorage.getItem(`habilidades_${s.id}`);
        if (rawHab) setHabs(JSON.parse(rawHab));
        const rawPerfil = await AsyncStorage.getItem(chavePerfil(s.id));
        if (rawPerfil) setGenero(JSON.parse(rawPerfil).genero ?? null);
      } catch {
        await AsyncStorage.removeItem(CHAVE_SESSAO);
        router.replace("/views/LoginView");
      } finally {
        setValidando(false);
      }
    };
    carregar();
  }, []);

  const sair = async () => {
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    router.replace("/views/LoginView");
  };

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
        <TouchableOpacity onPress={sair} hitSlop={16} activeOpacity={0.7}>
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
          <View style={s.bannerLeft}>
            <Text style={s.bannerTag}>BEM VINDO DE VOLTA</Text>
            <Text style={s.bannerNome}>{sessao.nome}</Text>
            <Text style={s.bannerSub}>Gerencie sua agenda</Text>
          </View>
          <View style={s.bannerAvatar}>
            <AvatarIcon
              genero={genero}
              size={70}
              bgColor={CARD2}
              iconColor={CYAN}
            />
          </View>
        </View>

        {/* Opções */}
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
                <MaterialCommunityIcons name={op.icon} size={26} color={BG} />
              </View>
              <Text style={s.iconLabel}>{op.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Habilidades */}
        {habs.length > 0 && (
          <>
            <Text style={s.secTitle}>HABILIDADES</Text>
            <View style={s.habRow}>
              {habs.map((h) => (
                <View key={h} style={s.habChip}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={13}
                    color={CYAN}
                  />
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

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 20, paddingBottom: 100, gap: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: CARD,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 4,
  },
  idBadge: {
    backgroundColor: CARD2,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CYAN,
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
    gap: 12,
  },
  bannerLeft: { flex: 1 },
  bannerTag: { fontSize: 11, fontWeight: "800", color: CYAN, letterSpacing: 2 },
  bannerNome: { fontSize: 26, fontWeight: "900", color: WHITE },
  bannerSub: { fontSize: 12, color: GREY, marginTop: 2 },
  bannerAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: CARD2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BORDER,
  },
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
  habRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  habChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD2,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: BORDER,
  },
  habTexto: { fontSize: 12, fontWeight: "600", color: WHITE },
});
