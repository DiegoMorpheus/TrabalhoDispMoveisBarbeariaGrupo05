import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../services/colors/colors";

export default function ClienteItem({ item, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>

      <Image
        source={{ uri: item.avatar }}
        style={styles.avatar}
      />

      <View style={styles.info}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.sub}>{item.telefone}</Text>
        <Text style={styles.sub}>{item.email}</Text>
        <Text style={styles.id}>ID: {item.id}</Text>
      </View>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  nome: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },

  sub: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  id: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 4,
  },
});