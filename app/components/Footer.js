import { useNavigation } from "@react-navigation/native";
import { Button, StyleSheet, Text, View } from "react-native";

const Footer = () => {
  
  const navigation = useNavigation();

  
  const navegarParaHome = () => {
    
    if (navigation && navigation.navigate) {
      console.log("Tentando navegar para Home...");
      navigation.navigate("Home");
    } else {
      console.error(
        "ERRO CRÍTICO NO TESTE: Objeto 'navigation' não existe no Footer.",
      );
      
    }
  };

  return (
    <View style={styles.footerTeste}>
      <Text style={styles.textoTeste}>Rodapé de Teste</Text>
      <Button title="Ir para Home" onPress={navegarParaHome} color="#A30000" />
    </View>
  );
};

const styles = StyleSheet.create({
  footerTeste: {
    height: 100,
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopWidth: 2,
    borderColor: "#A30000",
    zIndex: 9999,
  },
  textoTeste: {
    marginBottom: 10,
    fontWeight: "bold",
    color: "#333",
  },
});

export default Footer;
