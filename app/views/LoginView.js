// app/views/LoginView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RED   = "#8B1A1A";
const PINK  = "#F5C4C4";
const CREAM = "#F5EDE2";
const WHITE = "#FFFFFF";
const DARK  = "#1C0A0A";
const GREY  = "#9A7A7A";
const BG    = "#FAFAF8";

export const CHAVE_SESSAO = "sessao_barbearia";

// Profissionais cadastrados inicialmente
export const PROFISSIONAIS = [
  { nome: "Diego",     initials: "DG" },
  { nome: "Eduarda",   initials: "ED" },
  { nome: "Guilherme", initials: "GH" },
];

// Gera ID aleatório: prefixo + 001-999
function gerarId(prefixo) {
  const num = Math.floor(Math.random() * 999) + 1;
  return `${prefixo}${String(num).padStart(3, "0")}`;
}

export default function LoginView() {
  // etapa: "escolha" | "profissional"
  const [etapa, setEtapa] = useState("escolha");

  const entrarComoUsuario = async () => {
    const id = gerarId("U");
    const sessao = { tipo: "usuario", id };
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    router.replace("/");
  };

  const entrarComoProfissional = async (prof) => {
    const id = gerarId("P");
    const sessao = { tipo: "profissional", id, nome: prof.nome, initials: prof.initials };
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    router.replace("/views/HomeProfissionalView");
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Logo / Branding ── */}
        <View style={s.branding}>
          <View style={s.logoCircle}>
            <MaterialCommunityIcons name="content-cut" size={52} color={WHITE} />
          </View>
          <Text style={s.logoTitle}>BARBEARIA</Text>
          <Text style={s.logoSub}>Bem-vindo! Escolha seu perfil para continuar.</Text>
        </View>

        {etapa === "escolha" && (
          <>
            {/* ── Card Usuário ── */}
            <TouchableOpacity style={s.card} onPress={entrarComoUsuario} activeOpacity={0.85}>
              <View style={[s.cardIcon, { backgroundColor: RED }]}>
                <MaterialCommunityIcons name="account" size={36} color={WHITE} />
              </View>
              <View style={s.cardTextos}>
                <Text style={s.cardTitulo}>Usuário</Text>
                <Text style={s.cardSub}>Agende serviços e acompanhe sua agenda</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={26} color={GREY} />
            </TouchableOpacity>

            {/* ── Card Profissional ── */}
            <TouchableOpacity
              style={s.card}
              onPress={() => setEtapa("profissional")}
              activeOpacity={0.85}
            >
              <View style={[s.cardIcon, { backgroundColor: "#4A0E0E" }]}>
                <MaterialCommunityIcons name="account-tie" size={36} color={WHITE} />
              </View>
              <View style={s.cardTextos}>
                <Text style={s.cardTitulo}>Profissional</Text>
                <Text style={s.cardSub}>Acesse sua agenda e gerencie habilidades</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={26} color={GREY} />
            </TouchableOpacity>
          </>
        )}

        {etapa === "profissional" && (
          <>
            {/* ── Voltar ── */}
            <TouchableOpacity style={s.voltarBtn} onPress={() => setEtapa("escolha")} activeOpacity={0.7}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={RED} />
              <Text style={s.voltarTexto}> Voltar</Text>
            </TouchableOpacity>

            <Text style={s.subtitulo}>Qual é o seu nome?</Text>

            {PROFISSIONAIS.map((prof) => (
              <TouchableOpacity
                key={prof.nome}
                style={s.profCard}
                onPress={() => entrarComoProfissional(prof)}
                activeOpacity={0.85}
              >
                <View style={s.profCircle}>
                  <Text style={s.profInitials}>{prof.initials}</Text>
                </View>
                <Text style={s.profNome}>{prof.nome}</Text>
                <MaterialCommunityIcons name="chevron-right" size={22} color={GREY} />
              </TouchableOpacity>
            ))}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 48, gap: 14 },

  // Branding
  branding: { alignItems: "center", marginBottom: 20, gap: 10 },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: RED, alignItems: "center", justifyContent: "center",
    shadowColor: RED, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  logoTitle: { fontSize: 30, fontWeight: "900", color: DARK, letterSpacing: 4 },
  logoSub:   { fontSize: 14, color: GREY, textAlign: "center" },

  // Card de tipo (Usuário / Profissional)
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: WHITE, borderRadius: 18,
    padding: 18, gap: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  cardIcon:   { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  cardTextos: { flex: 1, gap: 3 },
  cardTitulo: { fontSize: 18, fontWeight: "800", color: DARK },
  cardSub:    { fontSize: 12, color: GREY },

  // Escolha de profissional
  voltarBtn:  { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  voltarTexto:{ fontSize: 14, fontWeight: "700", color: RED },
  subtitulo:  { fontSize: 18, fontWeight: "800", color: DARK, marginBottom: 4 },

  profCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: WHITE, borderRadius: 16,
    padding: 16, gap: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  profCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: RED, alignItems: "center", justifyContent: "center",
  },
  profInitials: { color: WHITE, fontSize: 18, fontWeight: "800" },
  profNome:     { flex: 1, fontSize: 17, fontWeight: "700", color: DARK },
});
