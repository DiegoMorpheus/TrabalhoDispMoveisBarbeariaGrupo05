// app/views/CadastroView.js 
import React from "react";

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


const styles = StyleSheet.create({
  
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
