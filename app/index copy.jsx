import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Snackbar, useTheme } from "react-native-paper";

export default function Index() {
  const theme = useTheme();

  const TEMPO_INICIAL = 25 * 60;

  const [tempo, setTempo] = useState(TEMPO_INICIAL);
  const [rodando, setRodando] = useState(false);
  const [exibeMensagem, setExibeMensagem] = useState(false);

  useEffect(() => {
    let intervalo;

    if (rodando && tempo > 0) {
      intervalo = setInterval(() => {
        setTempo((valorAtual) => valorAtual - 1);
      }, 1000);
    }

    return () => clearInterval(intervalo);
  }, [rodando, tempo]);

  function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    return `${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;
  }

  return (
    <View style={[style.container, { backgroundColor: theme.colors.background }]}>
      <View style={[style.topo, { backgroundColor: theme.colors.primary }]}>
        <Pressable
          style={style.botaoTopo}
          onPress={() => router.push("/")}>
          <Text style={style.textoBotaoTopo}>Home</Text>
        </Pressable>
        <Pressable
          style={style.botaoTopo}
          onPress={() => router.push("/telaA")}>
          <Text style={style.textoBotaoTopo}>Tela A</Text>
        </Pressable>
        <Pressable
          style={style.botaoTopo}
          onPress={() => router.push("/telaB")}>
          <Text style={style.textoBotaoTopo}>Tela B</Text>
        </Pressable>
        <Pressable
          style={style.botaoTopo}
          onPress={() => router.push("/telaC")}>
          <Text style={style.textoBotaoTopo}>Tela C</Text>
        </Pressable>
        <Pressable
          style={style.botaoTopo}
          onPress={() => router.push("/telaD")}>
          <Text style={style.textoBotaoTopo}>Tela D</Text>
        </Pressable>
      </View>

      <View style={style.conteudo}>
        <Image source={require("./relogio.png")} style={style.image} />

        <View
          style={[
            style.acttions,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Text style={style.timer}>{formatarTempo(tempo)}</Text>

          <Button  mode="contained" style={[rodando ? style.buttonStop : style.buttonStart,
              {backgroundColor: rodando ? "#990000" : theme.colors.secondary}]} labelStyle={style.textButton}
            onPress={() => {
              setRodando(!rodando);
              setExibeMensagem(true);
            }}
          >
            {rodando ? "Pausar" : "Iniciar"}
          </Button>

          <Snackbar
            visible={exibeMensagem}
            duration={1500}
            onDismiss={() => setExibeMensagem(false)}
          >
            {rodando ? "Cronômetro iniciado" : "Cronômetro pausado"}
          </Snackbar>
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },

  topo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
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

  conteudo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },

  image: {
    width: 400,
    height: 400,
    resizeMode: "contain"
  },

  acttions: {
    padding: 24,
    width: "80%",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#14448080",
    alignItems: "center",
    gap: 32
  },

  timer: {
    fontSize: 54,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },

  buttonStart: {
    width: "80%",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#144480",
  },

  buttonStop: {
    width: "80%",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#144480",
  },

  textButton: {
    fontSize: 25,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
  }
});