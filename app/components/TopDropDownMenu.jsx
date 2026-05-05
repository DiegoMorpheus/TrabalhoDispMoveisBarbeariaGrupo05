import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { usePathname } from "expo-router";
import { colors } from "../services/colors/colors";

export default function TopClientesAppbar() {
  const [usuario, setUsuario] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const carregar = async () => {
      const data = await AsyncStorage.getItem("usuarioLogado");
      if (data) setUsuario(JSON.parse(data));
    };
    carregar();
  }, []);

  const getTitle = () => {
    if (pathname.includes("AgendamentoListView")) return "AGENDAMENTOS";
    if (pathname.includes("AgendamentoFormView")) return "NOVO AGENDAMENTO";
    if (pathname.includes("ContatoListView")) return "CLIENTES";
    if (pathname.includes("ContatoFormView")) return "NOVO CLIENTE";
    return "DASHBOARD";
  };

  return (
    <View style={styles.header}>

      <View style={styles.left}>
        <Avatar.Text
          size={32}
          label={usuario?.nome?.charAt(0)?.toUpperCase() || "U"}
          style={{ backgroundColor: colors.surface }}
        />
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>{getTitle()}</Text>
      </View>

      <View style={styles.right} />

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
  },

  left: {
    width: 60,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  right: {
    width: 60,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.background,
    letterSpacing: 1,
  },
});