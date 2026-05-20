// app/_layout.tsx
import { Stack } from "expo-router";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import TopClientesAppbar from "./components/TopDropDownMenu";

const tema = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#b2c3d8",
    secondary: "#021123",
    background: "#e2e6eb",
    surface: "#7babe7",
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={tema}>
      <Stack
        screenOptions={{
          headerShown: true,
          header: ({ options }) => (
            <TopClientesAppbar title={options.title} />
          ),
        }}
      >
        {/* ── Sem header próprio ── */}
        <Stack.Screen name="index"                         options={{ headerShown: false }} />
        <Stack.Screen name="views/LoginView"               options={{ headerShown: false }} />
        <Stack.Screen name="views/HomeProfissionalView"    options={{ headerShown: false }} />

        {/* ── Com header padrão (TopClientesAppbar) ── */}
        <Stack.Screen name="views/ContatoListView"         options={{ title: "CLIENTES" }} />
        <Stack.Screen name="views/ContatoFormView"         options={{ title: "CADASTRO" }} />
        <Stack.Screen name="views/AgendamentoListView"     options={{ title: "AGENDAMENTOS" }} />
        <Stack.Screen name="views/AgendamentoFormView"     options={{ title: "AGENDAR" }} />
        <Stack.Screen name="views/ProfissionalDetalheView" options={{ title: "PROFISSIONAL" }} />
        <Stack.Screen name="views/HabilidadesView"         options={{ title: "HABILIDADES" }} />

      </Stack>
    </PaperProvider>
  );
}
