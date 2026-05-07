import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { usePathname, router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const RED   = "#8B1A1A";
const WHITE = "#FFFFFF";
const PINK  = "#F5C4C4";

export default function TopClientesAppbar() {
  const [usuario, setUsuario] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const load = async () => {
      const d = await AsyncStorage.getItem("usuarioLogado");
      if (d) setUsuario(JSON.parse(d));
    };
    load();
  }, []);

  const getTitle = () => {
    if (pathname.includes("AgendamentoListView")) return "Agendamentos";
    if (pathname.includes("AgendamentoFormView")) return "Agendar";
    if (pathname.includes("ContatoListView"))     return "Clientes";
    if (pathname.includes("ContatoFormView"))     return "Cadastro";
    return "";
  };

  return (
    <View style={s.header}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={14} activeOpacity={0.6}>
        <Text style={s.arrow}>←</Text>
      </TouchableOpacity>

      <Text style={s.title}>{getTitle()}</Text>

      <View style={s.avatarCircle}>
        <MaterialCommunityIcons name="account" size={24} color={PINK} />
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
    borderBottomColor: "#F0E8E8",
  },
  arrow: {
    fontSize: 26,
    color: RED,
    fontWeight: "700",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    fontStyle: "italic",
    color: RED,
    flex: 1,
    textAlign: "center",
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
});
