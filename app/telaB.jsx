import { FlatList, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import ClienteItem from "./components/ClienteItem";

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
      telefone: "11 99999-0005",
      avatar: "https://i.pravatar.cc/150?img=6",
    },
    {
      id: "7",
      nome: "Alice",
      telefone: "11 99999-0001",
      avatar: "https://i.pravatar.cc/150?img=7",
    },
    {
      id: "8",
      nome: "Bruno",
      telefone: "11 99999-0002",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    {
      id: "9",
      nome: "Carla",
      telefone: "11 99999-0003",
      avatar: "https://i.pravatar.cc/150?img=9",
    },
    {
      id: "10",
      nome: "Diego",
      telefone: "11 99999-0004",
      avatar: "https://i.pravatar.cc/150?img=10",
    },
    {
      id: "11",
      nome: "Elisa",
      telefone: "11 99999-0005",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
      id: "12",
      nome: "Jony",
      telefone: "11 99999-0005",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.areaLista}>
        <FlatList
          data={contatos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ClienteItem item={item} index={index} />
          )}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  topo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 12,
  },

  botaoTopo: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: "#1d5db3",
    borderRadius: 8,
  },

  textoBotaoTopo: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
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

  card: {
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 12,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 8,
  },

  nome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
  },

  telefone: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },

  rodape: {
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    borderTopWidth: 1,
    borderTopColor: "#D0D0D0",
  },

  textoRodape: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
});
