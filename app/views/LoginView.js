// app/views/LoginView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const RED    = "#8B1A1A";
const CREAM  = "#F5EDE2";
const WHITE  = "#FFFFFF";
const DARK   = "#1C0A0A";
const GREY   = "#9A7A7A";
const GREEN  = "#2E7D32";
const YELLOW = "#B8860B";
const BG     = "#FAFAF8";

// ── Chaves de storage ─────────────────────────────────────────────────────────
export const CHAVE_SESSAO    = "sessao_barbearia";
export const CHAVE_CADASTROS = "cadastros_app";       // mapa id → {tipo, nome, initials}

// ── Profissionais disponíveis ─────────────────────────────────────────────────
export const PROFISSIONAIS = [
  { nome: "Diego",     initials: "DG" },
  { nome: "Eduarda",   initials: "ED" },
  { nome: "Guilherme", initials: "GH" },
];

function gerarId(prefixo) {
  const n = Math.floor(Math.random() * 999) + 1;
  return `${prefixo}${String(n).padStart(3, "0")}`;
}

// ── Etapas: "login" | "novoTipo" | "novoProfissional" | "novoSucesso" ─────────
export default function LoginView() {
  const [etapa,    setEtapa]    = useState("login");
  const [inputId,  setInputId]  = useState("");
  const [erro,     setErro]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [novoId,   setNovoId]   = useState("");  // ID gerado no cadastro

  // ── Entrar com ID existente ──────────────────────────────────────────────
  /*const entrar = async () => {
    setErro("");
    const id = inputId.trim().toUpperCase();
    if (!id) { setErro("Digite seu ID para entrar."); return; }

    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
      const cadastros = raw ? JSON.parse(raw) : {};

      if (!cadastros[id]) {
        setErro("ID não encontrado. Verifique ou crie uma conta.");
        setLoading(false);
        return;
      }

      const conta = cadastros[id];
      await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(conta));
      setLoading(false);

      if (conta.tipo === "profissional") {
        router.replace("/views/HomeProfissionalView");
      } else {
        router.replace("/");
      }
    } catch {
      setLoading(false);
      setErro("Erro ao entrar. Tente novamente.");
    }
  };*/

  const entrar = async () => {
  setErro("");
  const id = inputId.trim().toUpperCase();

  if (!id) {
    setErro("Digite seu ID para entrar.");
    return;
  }

  setLoading(true);

  try {
    let cadastros = {};

    const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
    cadastros = raw ? JSON.parse(raw) : {};

    if (!cadastros[id]) {
      setErro("ID não encontrado.");
      setLoading(false);
      return;
    }

    const conta = cadastros[id];

    await AsyncStorage.setItem(
      CHAVE_SESSAO,
      JSON.stringify(conta)
    );

    setLoading(false);

    if (conta.tipo === "profissional") {
      router.replace("/views/HomeProfissionalView");
    } else {
      router.replace("/");
    }

  } catch (e) {
    setLoading(false);
    console.log("Erro login:", e);
    setErro("Erro ao entrar.");
  }
};

  

  // ── Registrar como Usuário ───────────────────────────────────────────────
  const registrarUsuario = async () => {
    const id = gerarId("U");
    const conta = { tipo: "usuario", id };
    await _salvarConta(id, conta);
    setNovoId(id);
    setEtapa("novoSucesso");
  };

  // ── Registrar como Profissional ──────────────────────────────────────────
  const registrarProfissional = async (prof) => {
    const id = gerarId("P");
    const conta = { tipo: "profissional", id, nome: prof.nome, initials: prof.initials };
    await _salvarConta(id, conta);
    setNovoId(id);
    setEtapa("novoSucesso");
  };

  const _salvarConta = async (id, conta) => {
  try {
    let cadastros = {};

    const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
    cadastros = raw ? JSON.parse(raw) : {};

    cadastros[id] = conta;

    await AsyncStorage.setItem(
      CHAVE_CADASTROS,
      JSON.stringify(cadastros)
    );

    await AsyncStorage.setItem(
      CHAVE_SESSAO,
      JSON.stringify(conta)
    );

  } catch (e) {
    console.log("Erro ao salvar conta:", e);
  }
};

 const continuar = async () => {
  try {
    const raw = await AsyncStorage.getItem(CHAVE_SESSAO);

    if (!raw) {
      setErro("Sessão não encontrada.");
      return;
    }

    const s = JSON.parse(raw);

    if (s.tipo === "profissional") {
      router.replace("/views/HomeProfissionalView");
    } else {
      router.replace("/");
    }

  } catch (e) {
    console.log("Erro ao continuar:", e);
    setErro("Erro ao acessar sessão.");
  }
};

  // ─────────────────────────────────────────────────────────────────────────
  // TELA: Login por ID
  // ─────────────────────────────────────────────────────────────────────────
  if (etapa === "login") {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Branding */}
          <View style={s.branding}>
            <View style={s.logoCircle}>
              <MaterialCommunityIcons name="content-cut" size={52} color={WHITE} />
            </View>
            <Text style={s.logoTitulo}>BARBEARIA</Text>
            <Text style={s.logoSub}>Entre com seu ID de acesso</Text>
          </View>

          <View style={s.card}>
            <View style={s.cardBarra} />
            <View style={s.cardBody}>
              <Text style={s.cardTitulo}>ENTRAR</Text>

              {erro ? (
                <View style={s.erroBox}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={15} color={RED} />
                  <Text style={s.erroTexto}> {erro}</Text>
                </View>
              ) : null}

              <Text style={s.label}>SEU ID</Text>
              <TextInput
                style={s.input}
                placeholder="Ex: U365 ou P001"
                placeholderTextColor={GREY}
                value={inputId}
                onChangeText={setInputId}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={entrar}
              />

              <TouchableOpacity style={[s.botao, loading && s.botaoDesativado]} onPress={entrar} disabled={loading} activeOpacity={0.85}>
                {loading
                  ? <ActivityIndicator size="small" color={WHITE} />
                  : <View style={s.botaoConteudo}>
                      <Text style={s.botaoTexto}>ENTRAR</Text>
                      <MaterialCommunityIcons name="login" size={20} color={WHITE} style={{ marginLeft: 10 }} />
                    </View>
                }
              </TouchableOpacity>

              <TouchableOpacity style={s.linkBtn} onPress={() => { setErro(""); setEtapa("novoTipo"); }} activeOpacity={0.7}>
                <Text style={s.linkTexto}>Primeira vez?  <Text style={s.linkDestaque}>Criar minha conta</Text></Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TELA: Escolha do tipo (Usuário / Profissional)
  // ─────────────────────────────────────────────────────────────────────────
  if (etapa === "novoTipo") {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <ScrollView contentContainerStyle={s.scroll}>

          <View style={s.branding}>
            <View style={s.logoCircle}>
              <MaterialCommunityIcons name="content-cut" size={52} color={WHITE} />
            </View>
            <Text style={s.logoTitulo}>BARBEARIA</Text>
          </View>

          <View style={s.card}>
            <View style={s.cardBarra} />
            <View style={s.cardBody}>
              <Text style={s.cardTitulo}>CRIAR CONTA</Text>
              <Text style={s.cardSubtitulo}>Qual é o seu perfil?</Text>

              {/* Usuário */}
              <TouchableOpacity style={s.tipoCard} onPress={registrarUsuario} activeOpacity={0.85}>
                <View style={[s.tipoIcone, { backgroundColor: RED }]}>
                  <MaterialCommunityIcons name="account" size={34} color={WHITE} />
                </View>
                <View style={s.tipoTextos}>
                  <Text style={s.tipoTitulo}>Usuário</Text>
                  <Text style={s.tipoSub}>Agende serviços e acompanhe sua agenda</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={GREY} />
              </TouchableOpacity>

              {/* Profissional */}
              <TouchableOpacity style={s.tipoCard} onPress={() => setEtapa("novoProfissional")} activeOpacity={0.85}>
                <View style={[s.tipoIcone, { backgroundColor: "#4A0E0E" }]}>
                  <MaterialCommunityIcons name="account-tie" size={34} color={WHITE} />
                </View>
                <View style={s.tipoTextos}>
                  <Text style={s.tipoTitulo}>Profissional</Text>
                  <Text style={s.tipoSub}>Gerencie seus agendamentos e habilidades</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={GREY} />
              </TouchableOpacity>

              <TouchableOpacity style={s.voltarBtn} onPress={() => setEtapa("login")} activeOpacity={0.7}>
                <MaterialCommunityIcons name="arrow-left" size={16} color={RED} />
                <Text style={s.voltarTexto}> Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TELA: Escolha do nome (profissional)
  // ─────────────────────────────────────────────────────────────────────────
  if (etapa === "novoProfissional") {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <ScrollView contentContainerStyle={s.scroll}>

          <View style={s.card}>
            <View style={s.cardBarra} />
            <View style={s.cardBody}>
              <Text style={s.cardTitulo}>QUAL É O SEU NOME?</Text>

              {PROFISSIONAIS.map((p) => (
                <TouchableOpacity key={p.nome} style={s.profCard} onPress={() => registrarProfissional(p)} activeOpacity={0.85}>
                  <View style={s.profCirculo}>
                    <Text style={s.profIniciais}>{p.initials}</Text>
                  </View>
                  <Text style={s.profNome}>{p.nome}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={GREY} />
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={s.voltarBtn} onPress={() => setEtapa("novoTipo")} activeOpacity={0.7}>
                <MaterialCommunityIcons name="arrow-left" size={16} color={RED} />
                <Text style={s.voltarTexto}> Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TELA: Sucesso — exibe o ID gerado com instrução para guardar
  // ─────────────────────────────────────────────────────────────────────────
  if (etapa === "novoSucesso") {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <ScrollView contentContainerStyle={[s.scroll, { justifyContent: "center" }]}>

          <View style={s.sucessoCard}>
            {/* Ícone verde */}
            <View style={s.sucessoIcone}>
              <MaterialCommunityIcons name="check-bold" size={44} color={WHITE} />
            </View>

            <Text style={s.sucessoTitulo}>Conta criada!</Text>
            <Text style={s.sucessoSub}>Este é o seu ID de acesso:</Text>

            {/* ID em destaque */}
            <View style={s.idDestaque}>
              <Text style={s.idDestaqueTexto}>{novoId}</Text>
            </View>

            {/* Alerta para guardar */}
            <View style={s.alertaBox}>
              <MaterialCommunityIcons name="alert" size={18} color={YELLOW} />
              <Text style={s.alertaTexto}>
                {"  "}Guarde este ID — ele é sua <Text style={{ fontWeight: "900" }}>senha de acesso</Text>. Sem ele não será possível entrar novamente.
              </Text>
            </View>

            <TouchableOpacity style={s.botao} onPress={continuar} activeOpacity={0.85}>
              <Text style={s.botaoTexto}>CONTINUAR</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={WHITE} style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    );
  }

  return null;
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 48, gap: 16 },

  // Branding
  branding:   { alignItems: "center", gap: 10, marginBottom: 8 },
  logoCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: RED, alignItems: "center", justifyContent: "center", shadowColor: RED, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  logoTitulo: { fontSize: 28, fontWeight: "900", color: DARK, letterSpacing: 4 },
  logoSub:    { fontSize: 14, color: GREY },

  // Card genérico
  card:      { backgroundColor: WHITE, borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardBarra: { height: 6, backgroundColor: RED },
  cardBody:  { padding: 24, gap: 12 },
  cardTitulo:   { fontSize: 20, fontWeight: "900", color: DARK, textAlign: "center", letterSpacing: 1.5 },
  cardSubtitulo:{ fontSize: 14, color: GREY, textAlign: "center", marginTop: -6 },

  // Erro
  erroBox:   { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FFCCCC", borderRadius: 8, padding: 10 },
  erroTexto: { fontSize: 13, color: RED, fontWeight: "600", flex: 1 },

  // Campos
  label: { fontSize: 11, fontWeight: "800", color: RED, letterSpacing: 1 },
  input: { borderWidth: 1.5, borderColor: "#DDD", borderRadius: 8, height: 52, paddingHorizontal: 16, fontSize: 20, color: DARK, backgroundColor: WHITE, textAlign: "center", fontWeight: "800", letterSpacing: 3 },

  // Botão principal
  botao:          { backgroundColor: RED, borderRadius: 8, height: 52, justifyContent: "center", alignItems: "center", shadowColor: RED, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5 },
  botaoDesativado:{ backgroundColor: GREY, shadowOpacity: 0, elevation: 0 },
  botaoConteudo:  { flexDirection: "row", alignItems: "center" },
  botaoTexto:     { color: WHITE, fontSize: 15, fontWeight: "900", letterSpacing: 1.2 },

  // Link "Criar conta"
  linkBtn:      { alignItems: "center", paddingVertical: 4 },
  linkTexto:    { fontSize: 14, color: GREY },
  linkDestaque: { color: RED, fontWeight: "800" },

  // Tipos de conta
  tipoCard:   { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: BG, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#EEE" },
  tipoIcone:  { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  tipoTextos: { flex: 1, gap: 2 },
  tipoTitulo: { fontSize: 17, fontWeight: "800", color: DARK },
  tipoSub:    { fontSize: 12, color: GREY },

  // Profissionais
  profCard:    { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: BG, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#EEE" },
  profCirculo: { width: 48, height: 48, borderRadius: 24, backgroundColor: RED, alignItems: "center", justifyContent: "center" },
  profIniciais:{ color: WHITE, fontSize: 16, fontWeight: "900" },
  profNome:    { flex: 1, fontSize: 16, fontWeight: "700", color: DARK },

  // Voltar
  voltarBtn:   { flexDirection: "row", alignItems: "center", paddingTop: 4 },
  voltarTexto: { fontSize: 14, fontWeight: "700", color: RED },

  // Tela de sucesso com ID
  sucessoCard:  { backgroundColor: WHITE, borderRadius: 20, padding: 28, alignItems: "center", gap: 14, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  sucessoIcone: { width: 80, height: 80, borderRadius: 40, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  sucessoTitulo:{ fontSize: 26, fontWeight: "900", color: DARK },
  sucessoSub:   { fontSize: 14, color: GREY },

  idDestaque:      { backgroundColor: CREAM, borderWidth: 2.5, borderColor: RED, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginVertical: 4 },
  idDestaqueTexto: { fontSize: 36, fontWeight: "900", color: RED, letterSpacing: 6 },

  alertaBox:   { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#FFF8E8", borderWidth: 1.5, borderColor: "#D4A010", borderRadius: 10, padding: 12, width: "100%" },
  alertaTexto: { fontSize: 13, color: "#7A5500", flex: 1, lineHeight: 18 },
});
