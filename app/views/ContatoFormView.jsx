// app/views/ContatoFormView.jsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ContatoEntity from "../entities/ClienteEntity";
import ContatoService from "../services/ContatoService";

const WHITE = "#FFFFFF";
const DARK = "#1C0A0A";
const GREY = "#9A7A7A";
const GREEN = "#2E7D32";

const COR = {
  usuario: {
    accent: "#8B1A1A",
    lt: "#F5EDE2",
    bg: "#FAFAF8",
    erroBg: "#FFF0F0",
    erroBorder: "#FFCCCC",
  },
  profissional: {
    accent: "#1A4A8A",
    lt: "#EBF2FC",
    bg: "#F0F5FA",
    erroBg: "#EBF2FC",
    erroBorder: "#A8C4E8",
  },
};

const CHAVE_SESSAO = "sessao_barbearia";
const chavePerfil = (id) => `perfil_${id}`;

export default function ContatoFormView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [sessao, setSessao] = useState(null);
  const [idContato, setIdContato] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [genero, setGenero] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [favorito, setFavorito] = useState(false);
  const [categoria, setCategoria] = useState("Clientes");

  useEffect(() => {
    const carregar = async () => {
      const rawSessao = await AsyncStorage.getItem(CHAVE_SESSAO);
      const s = rawSessao ? JSON.parse(rawSessao) : null;
      setSessao(s);

      if (id) {
        const contato = await ContatoService.findById(id);
        if (contato) {
          setIdContato(contato.id);
          setNome(contato.nome);
          setEmail(contato.email);
          setTelefone(contato.telefone);
          setGenero(contato.sexo ?? null);
          setFavorito(contato.favorito);
          setCategoria(contato.categoria);
          return;
        }
      }

      if (s?.id) {
        const rawPerfil = await AsyncStorage.getItem(chavePerfil(s.id));
        if (rawPerfil) {
          const perfil = JSON.parse(rawPerfil);
          setNome(perfil.nome ?? "");
          setEmail(perfil.email ?? "");
          setTelefone(perfil.telefone ?? "");
          setGenero(perfil.genero ?? null);
        }
      }
    };
    carregar();
  }, [id]);

  const isProfissional = sessao?.tipo === "profissional";
  const CL = isProfissional ? COR.profissional : COR.usuario;

  async function salvar() {
    setErro("");
    if (!nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }
    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }

    setSalvando(true);
    try {
      const contato = new ContatoEntity(
        idContato,
        nome,
        email,
        telefone,
        null,
        favorito,
        categoria,
        genero ?? "M",
      );
      await ContatoService.save(contato);

      if (sessao?.id) {
        const perfil = {
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
          genero: genero ?? "M",
        };
        await AsyncStorage.setItem(
          chavePerfil(sessao.id),
          JSON.stringify(perfil),
        );

        if (isProfissional && sessao.nome) {
          await AsyncStorage.setItem(
            `genero_prof_${sessao.nome}`,
            genero ?? "M",
          );
        }
      }

      setSucesso(true);
      setSalvando(false);
      setTimeout(() => router.back(), 1200);
    } catch {
      setSalvando(false);
      setErro("Erro ao salvar. Tente novamente.");
    }
  }

  if (sucesso) {
    return (
      <View style={[s.root, { backgroundColor: CL.bg }]}>
        <View style={s.sucessoTela}>
          <View style={[s.sucessoIcone, { backgroundColor: GREEN }]}>
            <MaterialCommunityIcons name="check-bold" size={48} color={WHITE} />
          </View>
          <Text style={s.sucessoTitulo}>Cadastro salvo!</Text>
          <Text style={s.sucessoSub}>Voltando…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: CL.bg }]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.card}>
          <View style={[s.cardBarra, { backgroundColor: CL.accent }]} />
          <View style={s.cardBody}>
            <Text style={s.cardTitulo}>MEU CADASTRO</Text>

            {/* ID */}
            {sessao?.id && (
              <>
                <Text style={[s.label, { color: CL.accent }]}>ID</Text>
                <View style={s.inputReadOnly}>
                  <MaterialCommunityIcons
                    name="identifier"
                    size={18}
                    color={CL.accent}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={s.inputReadOnlyTexto}>{sessao.id}</Text>
                  <MaterialCommunityIcons name="lock" size={14} color={GREY} />
                </View>
              </>
            )}

            {/* Erro */}
            {erro ? (
              <View
                style={[
                  s.erroBox,
                  { backgroundColor: CL.erroBg, borderColor: CL.erroBorder },
                ]}
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={15}
                  color={CL.accent}
                />
                <Text style={[s.erroTexto, { color: CL.accent }]}> {erro}</Text>
              </View>
            ) : null}

            {/* Nome */}
            <Text style={[s.label, { color: CL.accent }]}>NOME</Text>
            <TextInput
              style={s.input}
              placeholder="Seu nome completo"
              placeholderTextColor={GREY}
              value={nome}
              onChangeText={setNome}
              returnKeyType="next"
            />

            {/* E-mail */}
            <Text style={[s.label, { color: CL.accent }]}>E-MAIL</Text>
            <TextInput
              style={s.input}
              placeholder="seu@email.com"
              placeholderTextColor={GREY}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            {/* Telefone */}
            <Text style={[s.label, { color: CL.accent }]}>TELEFONE</Text>
            <TextInput
              style={s.input}
              placeholder="(31) 99999-0000"
              placeholderTextColor={GREY}
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
              returnKeyType="done"
            />

            {/* Gênero — compacto, só ícone ── */}
            <Text style={[s.label, { color: CL.accent }]}>GÊNERO</Text>
            <View style={s.generoRow}>
              <TouchableOpacity
                style={[
                  s.generoBtn,
                  { borderColor: genero === "M" ? CL.accent : "#DDD" },
                  genero === "M" && { backgroundColor: CL.accent },
                ]}
                onPress={() => setGenero("M")}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="face-man"
                  size={28}
                  color={genero === "M" ? WHITE : GREY}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  s.generoBtn,
                  { borderColor: genero === "F" ? CL.accent : "#DDD" },
                  genero === "F" && { backgroundColor: CL.accent },
                ]}
                onPress={() => setGenero("F")}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="face-woman"
                  size={28}
                  color={genero === "F" ? WHITE : GREY}
                />
              </TouchableOpacity>
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity
              style={[
                s.botao,
                { backgroundColor: CL.accent, shadowColor: CL.accent },
                salvando && s.botaoDesativado,
              ]}
              onPress={salvar}
              disabled={salvando}
              activeOpacity={0.85}
            >
              {salvando ? (
                <ActivityIndicator size="small" color={WHITE} />
              ) : (
                <View style={s.botaoConteudo}>
                  <Text style={s.botaoTexto}>SALVAR CADASTRO</Text>
                  <MaterialCommunityIcons
                    name="content-save"
                    size={20}
                    color={WHITE}
                    style={{ marginLeft: 10 }}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },

  sucessoTela: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    padding: 32,
  },
  sucessoIcone: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  sucessoTitulo: { fontSize: 24, fontWeight: "900", color: DARK },
  sucessoSub: { fontSize: 13, color: GREY },

  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBarra: { height: 6 },
  cardBody: { padding: 24 },
  cardTitulo: {
    fontSize: 20,
    fontWeight: "900",
    color: DARK,
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 24,
  },

  erroBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  erroTexto: { fontSize: 13, fontWeight: "600", flex: 1 },

  label: { fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: "#DDD",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    color: DARK,
    backgroundColor: WHITE,
    marginBottom: 18,
  },

  inputReadOnly: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DDD",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: "#F5F5F5",
    marginBottom: 18,
  },
  inputReadOnlyTexto: { flex: 1, fontSize: 15, color: DARK, fontWeight: "700" },

  // Gênero — compacto
  generoRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  generoBtn: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },

  botao: {
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  botaoDesativado: { backgroundColor: GREY, shadowOpacity: 0, elevation: 0 },
  botaoConteudo: { flexDirection: "row", alignItems: "center" },
  botaoTexto: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
});
