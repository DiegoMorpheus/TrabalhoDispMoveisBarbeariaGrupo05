// app/components/TopDropDownMenu.jsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AvatarIcon from "./AvatarIcon";

const RED  = "#8B1A1A";
const BLUE = "#1A4A8A";
const WHITE = "#FFFFFF";

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

  const isProfissional = sessao?.tipo === "profissional";
  const ACCENT = isProfissional ? BLUE : RED;

  const getTitle = () => {
    if (pathname.includes("AgendamentoListView"))     return isProfissional ? "Meus Agendamentos" : "Minha Agenda";
    if (pathname.includes("AgendamentoFormView"))     return "Agendar";
    if (pathname.includes("ContatoListView"))         return "Clientes";
    if (pathname.includes("ContatoFormView"))         return "Cadastro";
    if (pathname.includes("ProfissionalDetalheView")) return "Profissional";
    if (pathname.includes("HabilidadesView"))         return "Habilidades";
    return "";
  };

  return (
    <View style={[s.header, { borderBottomColor: isProfissional ? "#D0E4F7" : "#F0E8E8" }]}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={14} activeOpacity={0.6}>
        <Text style={[s.arrow, { color: ACCENT }]}>←</Text>
      </TouchableOpacity>

      <Text style={[s.title, { color: ACCENT }]}>{getTitle()}</Text>

      <View style={[s.avatarWrap, { borderColor: ACCENT }]}>
        <AvatarIcon genero={genero} size={42} bgColor={ACCENT} iconColor={WHITE} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: WHITE,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
  },
  arrow:      { fontSize: 26, fontWeight: "700" },
  title:      { fontSize: 16, fontWeight: "700", fontStyle: "italic", flex: 1, textAlign: "center" },
  avatarWrap: { width: 44, height: 44, borderRadius: 22, overflow: "hidden", borderWidth: 2 },
});
