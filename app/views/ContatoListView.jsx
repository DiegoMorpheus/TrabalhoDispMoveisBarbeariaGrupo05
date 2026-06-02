import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, Button } from "react-native";
import { useTheme } from "react-native-paper";

import ContatoItem from "../components/ClienteItem";
import ContatoService from "../services/ContatoService";

export default function ContatoListView() {
  const theme = useTheme();
  const router = useRouter();
  const [contatos, setContatos] = useState([]);

  useEffect(() => {
    carregarContatos();
  }, []);

  function carregarContatos() {
    ContatoService.findAll().then((dados) => {
      setContatos(dados);
    });
  }

  function abrirFormulario(contato) {
    router.push({
      pathname: "/views/ContatoFormView",
      params: { id: contato.id },
    });
  }

  async function handleReset() {
    const lista = await ContatoService.clear();
    setContatos(lista);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <View style={styles.botao}>
        <Button title="🔄 Restaurar contatos" onPress={handleReset} />
      </View>

      <View style={styles.areaLista}>
        <FlatList
          data={contatos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ContatoItem
              item={item}
              index={index}
              onPress={() => abrirFormulario(item)}
            />
          )}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      </View>

    </View>
  );
}

/* 🔥 ESTILOS (FALTAVA ISSO) */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  botao: {
    margin: 14,
  },

  areaLista: {
    flex: 1,
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: "#F5F5F5",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  lista: {
    paddingBottom: 10,
  },
});