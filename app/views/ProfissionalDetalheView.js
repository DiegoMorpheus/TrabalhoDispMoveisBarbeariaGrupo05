// app/views/ProfissionalDetalheView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RED   = "#8B1A1A";
const CREAM = "#F5EDE2";
const WHITE = "#FFFFFF";
const DARK  = "#1C0A0A";
const GREY  = "#9A7A7A";
const BG    = "#FAFAF8";


function chaveHabilidades(nome) {
  return `habilidades_perfil_${nome}`;
}

export default function ProfissionalDetalheView() {
  const { nome, initials } = useLocalSearchParams();
  const [habilidades, setHabilidades] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      const raw = await AsyncStorage.getItem(chaveHabilidades(nome));
      if (raw) setHabilidades(JSON.parse(raw));
    };
    carregar();
  }, [nome]);

  const agendar = () => {
    router.push({
      pathname: "/views/AgendamentoFormView",
      params: { profissionalNome: nome, profissionalInitials: initials },
    });
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Perfil ── */}
        <View style={s.perfilBox}>
          <View style={s.avatarGrande}>
            <Text style={s.avatarTexto}>{initials}</Text>
          </View>
          <Text style={s.nomeTexto}>{nome}</Text>
          <View style={s.badgeProfissional}>
            <MaterialCommunityIcons name="account-tie" size={14} color={WHITE} />
            <Text style={s.badgeTexto}> Profissional</Text>
          </View>
        </View>

        {/* ── Habilidades ── */}
        <View style={s.secao}>
          <Text style={s.secTitulo}>
            <MaterialCommunityIcons name="star-circle" size={18} color={RED} /> Habilidades
          </Text>

          {habilidades.length > 0 ? (
            <View style={s.habGrid}>
              {habilidades.map((h) => (
                <View key={h} style={s.habCard}>
                  <MaterialCommunityIcons name="check-decagram" size={22} color={RED} />
                  <Text style={s.habTexto}>{h}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={s.vazioBox}>
              <MaterialCommunityIcons name="information-outline" size={28} color={GREY} />
              <Text style={s.vazioTexto}>Este profissional ainda não cadastrou suas habilidades.</Text>
            </View>
          )}
        </View>

        {/* ── Botão agendar com este profissional ── */}
        <TouchableOpacity style={s.botao} onPress={agendar} activeOpacity={0.85}>
          <MaterialCommunityIcons name="calendar-plus" size={20} color={WHITE} />
          <Text style={s.botaoTexto}>  Agendar com {nome}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48, gap: 24 },

  // Perfil
  perfilBox: { alignItems: "center", gap: 10, backgroundColor: WHITE, borderRadius: 20, padding: 28, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  avatarGrande: { width: 100, height: 100, borderRadius: 50, backgroundColor: RED, alignItems: "center", justifyContent: "center", shadowColor: RED, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  avatarTexto:  { color: WHITE, fontSize: 32, fontWeight: "900" },
  nomeTexto:    { fontSize: 26, fontWeight: "900", color: DARK },
  badgeProfissional: { flexDirection: "row", alignItems: "center", backgroundColor: RED, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  badgeTexto:   { color: WHITE, fontWeight: "800", fontSize: 13 },

  // Seção habilidades
  secao:    { backgroundColor: WHITE, borderRadius: 16, padding: 20, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  secTitulo:{ fontSize: 17, fontWeight: "800", color: DARK, marginBottom: 14 },
  habGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  habCard:  { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: CREAM, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E8D8D8" },
  habTexto: { fontSize: 13, fontWeight: "700", color: DARK },

  vazioBox:  { alignItems: "center", gap: 8, paddingVertical: 12 },
  vazioTexto:{ fontSize: 13, color: GREY, textAlign: "center" },

  // Botão
  botao:     { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: RED, borderRadius: 14, height: 56, shadowColor: RED, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
  botaoTexto:{ color: WHITE, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
});
