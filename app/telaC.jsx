import { SectionList, StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";
import ClienteItem from "./components/ClienteItem"; // ✅

export default function TelaC() {
  const theme = useTheme();

  const contatosAgrupados = [
    {
      title: "A até E",
      data: [
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
      ],
    },
    {
      title: "F até J",
      data: [
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
      ],
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.areaLista}>
        <SectionList
          sections={contatosAgrupados}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ClienteItem item={item} index={index} />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.cabecalhoSecao}>
              <Text style={styles.textoCabecalho}>{section.title}</Text>
            </View>
          )}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
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

  cabecalhoSecao: {
    backgroundColor: "#D9E6F2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    marginTop: 4,
  },

  textoCabecalho: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1d5db3",
  },
});
