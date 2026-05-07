import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import ClienteItem from "./components/ClienteItem"; // ✅

export default function TelaB() {
  const theme = useTheme();

  const contatos = [
    {
      id: "1",
      nome: "Alice",
      telefone: "11 99999-0001",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "2",
      nome: "Bruno",
      telefone: "11 99999-0002",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: "3",
      nome: "Carla",
      telefone: "11 99999-0003",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: "4",
      nome: "Diego",
      telefone: "11 99999-0004",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    {
      id: "5",
      nome: "Elisa",
      telefone: "11 99999-0005",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: "6",
      nome: "Jony",
      telefone: "11 99999-0006",
      avatar: "https://i.pravatar.cc/150?img=6",
    },
    {
      id: "7",
      nome: "Marcos",
      telefone: "11 99999-0007",
      avatar: "https://i.pravatar.cc/150?img=7",
    },
    {
      id: "8",
      nome: "Paula",
      telefone: "11 99999-0008",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    {
      id: "9",
      nome: "Renata",
      telefone: "11 99999-0009",
      avatar: "https://i.pravatar.cc/150?img=9",
    },
    {
      id: "10",
      nome: "Tiago",
      telefone: "11 99999-0010",
      avatar: "https://i.pravatar.cc/150?img=10",
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.areaLista}>
        <ScrollView
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        >
          {contatos.map((item, index) => (
            <ClienteItem key={item.id} item={item} index={index} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  areaLista: {
    flex: 1,
    margin: 14,
    backgroundColor: "#F5F5F5",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  lista: {
    paddingBottom: 10,
  },
});
