import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, TextInput, useTheme } from "react-native-paper";

import ClienteEntity from "../entities/ClienteEntity";
import ClienteService from "../services/ClienteService";

export default function ClienteFormView() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [idCliente, setIdCliente] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  useEffect(() => {
    if (!id) return;

    ClienteService.findById(id).then((cliente) => {
      if (!cliente) return;
      setIdCliente(cliente.id);
      setNome(cliente.nome);
      setEmail(cliente.email);
      setTelefone(cliente.telefone);
    });
  }, [id]);

  function salvar() {
    const cliente = new ClienteEntity(idCliente, nome, email, telefone);
    ClienteService.save(cliente).then(() => {
      router.back();
    });
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <TextInput
        label="Nome"
        value={nome}
        onChangeText={setNome}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        mode="outlined"
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Button mode="contained" onPress={salvar} style={styles.botao}>
        Salvar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 12 },
  botao: { marginTop: 16 },
});
