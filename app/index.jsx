import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";
import { colors } from "./services/colors/colors";

export default function Index() {
  return (
    <View style={styles.container}>

      {/* 📅 AGENDAMENTOS */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/views/AgendamentoListView")}
      >
        <Text style={styles.icon}>📅</Text>
        <View>
          <Text style={styles.cardTitle}>Agendamentos</Text>
          <Text style={styles.cardSub}>Ver e gerenciar agenda</Text>
        </View>
      </TouchableOpacity>

      {/* ➕ NOVO AGENDAMENTO */}
      <TouchableOpacity
        style={[styles.card, styles.accent]}
        onPress={() => router.push("/views/AgendamentoFormView")}
      >
        <Text style={styles.icon}>➕</Text>
        <View>
          <Text style={styles.cardTitle}>Novo Agendamento</Text>
          <Text style={styles.cardSub}>Criar nova marcação</Text>
        </View>
      </TouchableOpacity>

      {/* 👥 CLIENTES */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/views/ContatoListView")}
      >
        <Text style={styles.icon}>👥</Text>
        <View>
          <Text style={styles.cardTitle}>Clientes</Text>
          <Text style={styles.cardSub}>Lista de clientes</Text>
        </View>
      </TouchableOpacity>

      {/* 🧾 NOVO CLIENTE */}
      <TouchableOpacity
        style={[styles.card, styles.form]}
        onPress={() => router.push("/views/ContatoFormView")}
      >
        <Text style={styles.icon}>📝</Text>
        <View>
          <Text style={styles.cardTitle}>Novo Cliente</Text>
          <Text style={styles.cardSub}>Cadastrar cliente</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
    gap: 12,
  },

  accent: {
    backgroundColor: colors.surface,
  },

  form: {
    backgroundColor: "#4a90e2",
  },

  icon: {
    fontSize: 22,
  },

  cardTitle: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "700",
  },

  cardSub: {
    color: colors.background,
    opacity: 0.9,
  },
});