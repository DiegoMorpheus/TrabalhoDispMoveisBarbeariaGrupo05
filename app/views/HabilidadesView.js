// app/views/HabilidadesView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const BG     = "#0F1123";
const CARD   = "#1A1F3A";
const CARD2  = "#232845";
const CYAN   = "#00C8DC";
const RED    = "#E53935";
const WHITE  = "#FFFFFF";
const GREY   = "#8892B0";
const BORDER = "#2D3461";

export default function HabilidadesView() {
  const [habilidades, setHabilidades] = useState([]);
  const [novaHab,     setNovaHab]     = useState("");
  const [sessaoId,    setSessaoId]    = useState(null);
  const [removendoIdx,setRemovendoIdx]= useState(null);

  useFocusEffect(useCallback(() => {
    const carregar = async () => {
      const rawSessao = await AsyncStorage.getItem("sessao_barbearia");
      if (!rawSessao) return;
      const s = JSON.parse(rawSessao);
      setSessaoId(s.id);
      const rawHab = await AsyncStorage.getItem(`habilidades_${s.id}`);
      if (rawHab) setHabilidades(JSON.parse(rawHab));
    };
    carregar();
  }, []));

  const salvar = async (lista) => {
    if (!sessaoId) return;
    await AsyncStorage.setItem(`habilidades_${sessaoId}`, JSON.stringify(lista));
  };

  const adicionar = async () => {
    const h = novaHab.trim();
    if (!h || habilidades.includes(h)) { setNovaHab(""); return; }
    const nova = [...habilidades, h];
    setHabilidades(nova);
    setNovaHab("");
    await salvar(nova);
  };

  const remover = async (idx) => {
    const nova = habilidades.filter((_, i) => i !== idx);
    setHabilidades(nova);
    setRemovendoIdx(null);
    await salvar(nova);
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.titulo}>MINHAS HABILIDADES</Text>
        <Text style={s.sub}>Adicione os serviços que você realiza</Text>

        {/* Input */}
        <View style={s.addRow}>
          <TextInput
            style={s.input}
            placeholder="Ex: Corte degradê"
            placeholderTextColor={GREY}
            value={novaHab}
            onChangeText={setNovaHab}
            onSubmitEditing={adicionar}
            returnKeyType="done"
          />
          <TouchableOpacity style={s.addBtn} onPress={adicionar} activeOpacity={0.8}>
            <MaterialCommunityIcons name="plus" size={24} color={BG} />
          </TouchableOpacity>
        </View>

        {/* Lista */}
        {habilidades.length === 0 ? (
          <View style={s.vazio}>
            <MaterialCommunityIcons name="star-outline" size={52} color={BORDER} />
            <Text style={s.vazioTexto}>Nenhuma habilidade cadastrada ainda</Text>
            <Text style={s.vazioSub}>Adicione seus serviços acima</Text>
          </View>
        ) : (
          <View style={s.lista}>
            {habilidades.map((h, idx) => (
              <View key={idx} style={s.habItem}>
                <View style={s.habIcone}>
                  <MaterialCommunityIcons name="check" size={16} color={CYAN} />
                </View>
                <Text style={s.habTexto} numberOfLines={1}>{h}</Text>
                {removendoIdx === idx ? (
                  <View style={s.confirmRow}>
                    <TouchableOpacity style={s.confirmSim} onPress={() => remover(idx)} activeOpacity={0.8}>
                      <MaterialCommunityIcons name="check" size={14} color={BG} />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.confirmNao} onPress={() => setRemovendoIdx(null)} activeOpacity={0.8}>
                      <MaterialCommunityIcons name="close" size={14} color={GREY} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setRemovendoIdx(idx)} hitSlop={10} activeOpacity={0.6}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={GREY} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {habilidades.length > 0 && (
          <View style={s.total}>
            <MaterialCommunityIcons name="star-circle" size={16} color={CYAN} />
            <Text style={s.totalTexto}>  {habilidades.length} habilidade{habilidades.length > 1 ? "s" : ""} cadastrada{habilidades.length > 1 ? "s" : ""}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: BG },
  scroll:{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48, gap: 16 },
  titulo:{ fontSize: 18, fontWeight: "900", color: CYAN, letterSpacing: 2, textAlign: "center" },
  sub:   { fontSize: 12, color: GREY, textAlign: "center", marginTop: -8 },
  addRow:{ flexDirection: "row", gap: 10 },
  input: { flex: 1, backgroundColor: CARD2, borderWidth: 1, borderColor: BORDER, borderRadius: 10, height: 50, paddingHorizontal: 14, fontSize: 14, color: WHITE },
  addBtn:{ width: 50, height: 50, borderRadius: 10, backgroundColor: CYAN, alignItems: "center", justifyContent: "center", shadowColor: CYAN, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 },
  vazio: { alignItems: "center", gap: 8, paddingVertical: 40 },
  vazioTexto: { fontSize: 15, fontWeight: "700", color: GREY, textAlign: "center" },
  vazioSub:   { fontSize: 12, color: BORDER, textAlign: "center" },
  lista: { gap: 8 },
  habItem: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER },
  habIcone:{ width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(0,200,220,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: CYAN },
  habTexto:{ flex: 1, fontSize: 14, fontWeight: "600", color: WHITE },
  confirmRow:{ flexDirection: "row", gap: 6 },
  confirmSim:{ width: 28, height: 28, borderRadius: 8, backgroundColor: RED, alignItems: "center", justifyContent: "center" },
  confirmNao:{ width: 28, height: 28, borderRadius: 8, backgroundColor: CARD2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BORDER },
  total: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  totalTexto: { fontSize: 13, fontWeight: "700", color: GREY },
});
