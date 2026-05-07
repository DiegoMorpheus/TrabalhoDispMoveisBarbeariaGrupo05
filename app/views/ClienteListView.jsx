import { FlatList, StyleSheet, View } from "react-native";
import { FAB, useTheme } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";

import ClienteItem from "../components/ClienteItem";
import ClienteService from "../services/ClienteService";

export default function ClienteListView() {
  const theme = useTheme();
  const router = useRouter();
  const [clientes, setClientes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      ClienteService.findAll().then((dados) => setClientes(dados));
    }, []),
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.areaLista}>
        <FlatList
          data={clientes}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <ClienteItem
              item={item}
              onPress={() =>
                router.push(`/views/ClienteFormView?id=${item.id}`)
              }
            />
          )}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/views/ClienteFormView")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  areaLista: {
    flex: 1,
    margin: 14,
    backgroundColor: "#F5F5F5",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  lista: { paddingBottom: 10 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
