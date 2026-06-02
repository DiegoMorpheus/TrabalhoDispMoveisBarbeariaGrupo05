// app/views/CadastroView.js (ARQUIVO CORRIGIDO E BLINDADO)
import React from "react";
// CORREÇÃO: Adicionado 'StyleSheet' nas importações do 'react-native'
import { StyleSheet, View, Text, SafeAreaView } from "react-native";

const CadastroView = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Seu Cadastro</Text>
        <Text style={styles.text}>Aqui você pode ver e editar seus dados.</Text>
      </View>
    </SafeAreaView>
  );
};

// --- ESTILIZAÇÃO (CORRIGIDO: Removido StyleSheet.StyleSheet) ---
const styles = StyleSheet.create({
  // CORRETO: Acessando create diretamente
  container: { flex: 1, backgroundColor: "#FFF" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#A30000",
    marginBottom: 15,
  }, // Vermelho
  text: { fontSize: 16, color: "#555" },
});

export default CadastroView;
