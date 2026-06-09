// app/components/TopDropDownMenu.jsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AvatarIcon from "./AvatarIcon";

const BG     = "#0F1123";
const CARD   = "#1A1F3A";
const CYAN   = "#00C8DC";
const WHITE  = "#FFFFFF";
const GREY   = "#8892B0";
const BORDER = "#2D3461";

const chavePerfil = (id) => `perfil_${id}`;

export default function TopClientesAppbar() {
  const [sessao, setSessao] = useState(null);
  const [genero, setGenero] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem("sessao_barbearia");
      if (!raw) return;
      const s = JSON.parse(raw);
      setSessao(s);
      if (s?.id) {
        const rawPerfil = await AsyncStorage.getItem(chavePerfil(s.id));
        if (rawPerfil) setGenero(JSON.parse(rawPerfil).genero ?? null);
      }
    };
    load();
  }, []);

  const getTitle = () => {
    if (pathname.includes("AgendamentoListView"))     return sessao?.tipo === "profissional" ? "Meus Agendamentos" : "Minha Agenda";
    if (pathname.includes("AgendamentoFormView"))     return "Agendar";
    if (pathname.includes("ContatoListView"))         return "Clientes";
    if (pathname.includes("ContatoFormView"))         return "Cadastro";
    if (pathname.includes("ProfissionalDetalheView")) return "Profissional";
    if (pathname.includes("HabilidadesView"))         return "Habilidades";
    return "";
  };

  return (
    <View style={s.header}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={14} activeOpacity={0.6} style={s.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={CYAN} />
      </TouchableOpacity>
      <Text style={s.title}>{getTitle()}</Text>
      <View style={s.avatarWrap}>
        <AvatarIcon genero={genero} size={38} bgColor={CYAN} iconColor={BG} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: CARD,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: "#232845", alignItems: "center", justifyContent: "center" },
  title:      { fontSize: 15, fontWeight: "800", color: CYAN, flex: 1, textAlign: "center", letterSpacing: 1.5 },
  avatarWrap: { width: 38, height: 38, borderRadius: 19, overflow: "hidden", borderWidth: 1.5, borderColor: CYAN },
});
