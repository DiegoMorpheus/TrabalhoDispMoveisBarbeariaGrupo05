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
import BarberPoleLogo from "../components/BarberPoleLogo";

// ── Paleta dark ───────────────────────────────────────────────────────────────
const BG = "#0F1123";
const CARD = "#1A1F3A";
const CARD2 = "#232845";
const CYAN = "#00C8DC";
const CYAN_DK = "#007A8A";
const RED = "#E53935";
const WHITE = "#FFFFFF";
const GREY = "#8892B0";
const BORDER = "#2D3461";
const GREEN = "#2E7D32";
const YELLOW = "#F5A623";

export const CHAVE_SESSAO = "sessao_barbearia";
export const CHAVE_CADASTROS = "cadastros_app";

function validarFormato(valor) {
  if (!valor || valor.length !== 6) return false;
  const letras = valor.replace(/[^a-zA-Z]/g, "").length;
  const numeros = valor.replace(/[^0-9]/g, "").length;
  return letras === 3 && numeros === 3;
}
async function idJaExiste(id) {
  const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
  const c = raw ? JSON.parse(raw) : {};
  return !!c[id.toUpperCase()];
}
async function profesionalJaCadastrado(nome) {
  const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
  const c = raw ? JSON.parse(raw) : {};
  return Object.values(c).some(
    (x) =>
      x.tipo === "profissional" &&
      x.nome?.toLowerCase() === nome.toLowerCase() &&
      x.ativa !== false,
  );
}

// ── Campos ID + Senha — fora do componente para não perder foco ───────────────
function CamposIdSenha({
  novoId,
  setNovoId,
  novaSenha,
  setNovaSenha,
  mostrarSenha,
  setMostrarSenha,
  erro,
  loading,
  onConfirmar,
  onVoltar,
  labelExtra,
}) {
  return (
    <>
      <View style={s.regraBox}>
        <MaterialCommunityIcons
          name="information-outline"
          size={15}
          color={CYAN}
        />
        <Text style={s.regraTexto}>
          {"  "}ID e senha:{" "}
          <Text style={{ color: CYAN, fontWeight: "900" }}>6 caracteres</Text>{" "}
          (3 letras + 3 números){"\n"}
          {"  "}Ex:{" "}
          <Text style={{ color: WHITE, fontWeight: "700" }}>
            ABC123 · A1B2C3
          </Text>
        </Text>
      </View>
      {erro ? (
        <View style={s.erroBox}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={15}
            color={RED}
          />
          <Text style={s.erroTexto}> {erro}</Text>
        </View>
      ) : null}

      {labelExtra}

      <Text style={s.label}>
        NOME DE ID <Text style={s.labelHint}>(fixo após criação)</Text>
      </Text>
      <TextInput
        style={s.inputCodigo}
        placeholder="Ex: ABC123"
        placeholderTextColor={GREY}
        value={novoId}
        onChangeText={(t) => setNovoId(t.toUpperCase())}
        autoCapitalize="characters"
        maxLength={6}
        returnKeyType="next"
      />

      <Text style={s.label}>
        SENHA <Text style={s.labelHint}>(pode ser alterada depois)</Text>
      </Text>
      <View style={s.senhaContainer}>
        <TextInput
          style={s.senhaInput}
          placeholder="Ex: XYZ456"
          placeholderTextColor={GREY}
          value={novaSenha}
          onChangeText={(t) => setNovaSenha(t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={6}
          secureTextEntry={!mostrarSenha}
          returnKeyType="done"
        />
        <TouchableOpacity
          onPress={() => setMostrarSenha((v) => !v)}
          style={s.olhoIcone}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={GREY}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[s.botao, loading && s.botaoOff]}
        onPress={onConfirmar}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator size="small" color={BG} />
        ) : (
          <View style={s.botaoRow}>
            <Text style={s.botaoTexto}>CRIAR CONTA</Text>
            <MaterialCommunityIcons
              name="check"
              size={18}
              color={BG}
              style={{ marginLeft: 8 }}
            />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={s.voltarBtn}
        onPress={onVoltar}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={16} color={CYAN} />
        <Text style={s.voltarTexto}> Voltar</Text>
      </TouchableOpacity>
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function LoginView() {
  const [etapa, setEtapa] = useState("login");
  const [inputId, setInputId] = useState("");
  const [inputSenha, setInputSenha] = useState("");
  const [novoId, setNovoId] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState(""); // Ajuste: Novo estado para nome do usuário
  const [nomeProf, setNomeProf] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [idConf, setIdConf] = useState("");
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

  const reset = () => {
    setErro("");
    setNovoId("");
    setNovaSenha("");
    setNomeProf("");
    setNomeUsuario(""); // Ajuste: Limpa o nome do usuário também
  };

  const entrar = async () => {
    setErro("");
    const id = inputId.trim().toUpperCase(),
      senha = inputSenha.trim().toUpperCase();
    if (!id) {
      setErro("Digite seu ID.");
      return;
    }
    if (!senha) {
      setErro("Digite sua senha.");
      return;
    }
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
      const cads = raw ? JSON.parse(raw) : {};
      if (!cads[id]) {
        setErro("ID não encontrado.");
        setLoading(false);
        return;
      }
      const c = cads[id];
      if (c.ativa === false) {
        setErro("Conta desativada.");
        setLoading(false);
        return;
      }
      if (c.senha !== senha) {
        setErro("Senha incorreta.");
        setLoading(false);
        return;
      }
      await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(c));
      setLoading(false);
      c.tipo === "profissional"
        ? router.replace("/views/HomeProfissionalView")
        : router.replace("/");
    } catch {
      setLoading(false);
      setErro("Erro. Tente novamente.");
    }
  };

  const registrarUsuario = async () => {
    setErro("");
    const nome = nomeUsuario.trim(), // Ajuste: Captura o nome digitado
      id = novoId.trim().toUpperCase(),
      senha = novaSenha.trim().toUpperCase();

    if (!nome) {
      setErro("Informe seu nome."); // Ajuste: Validação de campo obrigatório
      return;
    }
    if (!validarFormato(id)) {
      setErro("ID inválido.");
      return;
    }
    if (!validarFormato(senha)) {
      setErro("Senha inválida.");
      return;
    }
    if (await idJaExiste(id)) {
      setErro("ID já em uso.");
      return;
    }
    setLoading(true);
    try {
      // Ajuste: O objeto "conta" agora salva a propriedade "nome"
      const conta = { tipo: "usuario", id, nome, ativa: true, senha };
      const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
      const cads = raw ? JSON.parse(raw) : {};
      cads[id] = conta;
      await AsyncStorage.setItem(CHAVE_CADASTROS, JSON.stringify(cads));
      await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(conta));
      setIdConf(id);
      setLoading(false);
      setEtapa("sucesso");
    } catch {
      setLoading(false);
      setErro("Erro ao criar conta.");
    }
  };

  const registrarProfissional = async () => {
    setErro("");
    const nome = nomeProf.trim(),
      id = novoId.trim().toUpperCase(),
      senha = novaSenha.trim().toUpperCase();
    if (!nome) {
      setErro("Informe seu nome.");
      return;
    }
    if (!validarFormato(id)) {
      setErro("ID inválido.");
      return;
    }
    if (!validarFormato(senha)) {
      setErro("Senha inválida.");
      return;
    }
    if (await idJaExiste(id)) {
      setErro("ID já em uso.");
      return;
    }
    if (await profissionalJaCadastrado(nome)) {
      setErro(`Já existe conta ativa para "${nome}".`);
      return;
    }
    const initials = nome
      .trim()
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    setLoading(true);
    try {
      const conta = {
        tipo: "profissional",
        id,
        nome,
        initials,
        ativa: true,
        senha,
      };
      const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
      const cads = raw ? JSON.parse(raw) : {};
      cads[id] = conta;
      await AsyncStorage.setItem(CHAVE_CADASTROS, JSON.stringify(cads));
      await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(conta));
      setIdConf(id);
      setLoading(false);
      setEtapa("sucesso");
    } catch {
      setLoading(false);
      setErro("Erro ao criar conta.");
    }
  };

  const continuar = () => {
    AsyncStorage.getItem(CHAVE_SESSAO).then((raw) => {
      const s = JSON.parse(raw);
      s.tipo === "profissional"
        ? router.replace("/views/HomeProfissionalView")
        : router.replace("/");
    });
  };

  // ── TELA: Login ──────────────────────────────────────────────────────────
  if (etapa === "login")
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.logoWrap}>
            <BarberPoleLogo size={56} />
            <Text style={s.logoTitulo}>CORTE-FINO</Text>
            <Text style={s.logoSub}>Seu estilo, nossa especialidade</Text>
          </View>
          <View style={s.card}>
            <Text style={s.cardTitulo}>LOG IN</Text>
            {erro ? (
              <View style={s.erroBox}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={15}
                  color={RED}
                />
                <Text style={s.erroTexto}> {erro}</Text>
              </View>
            ) : null}

            <Text style={s.label}>E-MAIL / ID</Text>
            <TextInput
              style={s.input}
              placeholder="Ex: ABC123"
              placeholderTextColor={GREY}
              value={inputId}
              onChangeText={(t) => {
                setErro("");
                setInputId(t.toUpperCase());
              }}
              autoCapitalize="characters"
              maxLength={6}
              returnKeyType="next"
            />

            <Text style={s.label}>SENHA</Text>
            <View style={s.senhaContainer}>
              <TextInput
                style={s.senhaInput}
                placeholder="Ex: XYZ456"
                placeholderTextColor={GREY}
                value={inputSenha}
                onChangeText={(t) => {
                  setErro("");
                  setInputSenha(t.toUpperCase());
                }}
                autoCapitalize="characters"
                maxLength={6}
                secureTextEntry={!mostrarLogin}
                returnKeyType="done"
                onSubmitEditing={entrar}
              />
              <TouchableOpacity
                onPress={() => setMostrarLogin((v) => !v)}
                style={s.olhoIcone}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name={mostrarLogin ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={GREY}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[s.botao, loading && s.botaoOff]}
              onPress={entrar}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={BG} />
              ) : (
                <View style={s.botaoRow}>
                  <Text style={s.botaoTexto}>LOG IN</Text>
                  <MaterialCommunityIcons
                    name="login"
                    size={18}
                    color={BG}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              )}
            </TouchableOpacity>

            <View style={s.linkRow}>
              <Text style={s.linkTexto}>Novo por aqui? </Text>
              <TouchableOpacity
                onPress={() => {
                  reset();
                  setEtapa("tipo");
                }}
                activeOpacity={0.7}
              >
                <Text style={s.linkDestaque}>SIGN UP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );

  // ── TELA: Tipo ───────────────────────────────────────────────────────────
  if (etapa === "tipo")
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.logoWrap}>
            <BarberPoleLogo size={48} />
            <Text style={s.logoTitulo}>CRIAR CONTA</Text>
          </View>
          <View style={s.card}>
            <Text style={s.cardTitulo}>VOCÊ É?</Text>
            <TouchableOpacity
              style={s.tipoCard}
              onPress={() => setEtapa("usuario")}
              activeOpacity={0.85}
            >
              <View style={[s.tipoIcone, { backgroundColor: CYAN }]}>
                <MaterialCommunityIcons name="account" size={30} color={BG} />
              </View>
              <View style={s.tipoTextos}>
                <Text style={s.tipoTitulo}>Usuário</Text>
                <Text style={s.tipoSub}>Agende e gerencie sua agenda</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={GREY}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.tipoCard}
              onPress={() => setEtapa("profissional")}
              activeOpacity={0.85}
            >
              <View style={[s.tipoIcone, { backgroundColor: RED }]}>
                <MaterialCommunityIcons
                  name="account-tie"
                  size={30}
                  color={WHITE}
                />
              </View>
              <View style={s.tipoTextos}>
                <Text style={s.tipoTitulo}>Profissional</Text>
                <Text style={s.tipoSub}>
                  Gerencie atendimentos e habilidades
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={GREY}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.voltarBtn}
              onPress={() => setEtapa("login")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={16}
                color={CYAN}
              />
              <Text style={s.voltarTexto}> Voltar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );

  // ── TELA: Registro Usuário ───────────────────────────────────────────────
  if (etapa === "usuario")
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <Text style={s.cardTitulo}>NOVO USUÁRIO</Text>
            <CamposIdSenha
              novoId={novoId}
              setNovoId={setNovoId}
              novaSenha={novaSenha}
              setNovaSenha={setNovaSenha}
              mostrarSenha={mostrarNovaSenha}
              setMostrarSenha={setMostrarNovaSenha}
              erro={erro}
              loading={loading}
              onConfirmar={registrarUsuario}
              onVoltar={() => {
                reset();
                setEtapa("tipo");
              }}
              // Ajuste: Injetando o campo "SEU NOME" também para o Usuário
              labelExtra={
                <>
                  <Text style={s.label}>SEU NOME</Text>
                  <TextInput
                    style={[
                      s.inputCodigo,
                      {
                        letterSpacing: 0,
                        fontSize: 15,
                        textAlign: "left",
                        paddingHorizontal: 14,
                      },
                    ]}
                    placeholder="Ex: Diego Oliveira"
                    placeholderTextColor={GREY}
                    value={nomeUsuario}
                    onChangeText={(t) => {
                      setErro("");
                      setNomeUsuario(t);
                    }}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </>
              }
            />
          </View>
        </ScrollView>
      </View>
    );

  // ── TELA: Registro Profissional ──────────────────────────────────────────
  if (etapa === "profissional")
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <Text style={s.cardTitulo}>NOVO PROFISSIONAL</Text>
            <CamposIdSenha
              novoId={novoId}
              setNovoId={setNovoId}
              novaSenha={novaSenha}
              setNovaSenha={setNovaSenha}
              mostrarSenha={mostrarNovaSenha}
              setMostrarSenha={setMostrarNovaSenha}
              erro={erro}
              loading={loading}
              onConfirmar={registrarProfissional}
              onVoltar={() => {
                reset();
                setEtapa("tipo");
              }}
              labelExtra={
                <>
                  <Text style={s.label}>SEU NOME</Text>
                  <TextInput
                    style={[
                      s.inputCodigo,
                      {
                        letterSpacing: 0,
                        fontSize: 15,
                        textAlign: "left",
                        paddingHorizontal: 14,
                      },
                    ]}
                    placeholder="Ex: Diego Oliveira"
                    placeholderTextColor={GREY}
                    value={nomeProf}
                    onChangeText={(t) => {
                      setErro("");
                      setNomeProf(t);
                    }}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </>
              }
            />
          </View>
        </ScrollView>
      </View>
    );

  // ── TELA: Sucesso ────────────────────────────────────────────────────────
  if (etapa === "sucesso")
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <ScrollView
          contentContainerStyle={[s.scroll, { justifyContent: "center" }]}
        >
          <View style={s.sucessoCard}>
            <View style={s.sucessoIcone}>
              <MaterialCommunityIcons name="check-bold" size={40} color={BG} />
            </View>
            <Text style={s.sucessoTitulo}>Conta criada!</Text>
            <Text style={[s.logoSub, { textAlign: "center" }]}>
              Seu ID de acesso:
            </Text>
            <View style={s.idDestaque}>
              <Text style={s.idDestaqueTexto}>{idConf}</Text>
            </View>
            <View style={s.alertaBox}>
              <MaterialCommunityIcons name="alert" size={16} color={YELLOW} />
              <Text style={s.alertaTexto}>
                {"  "}Guarde seu{" "}
                <Text style={{ fontWeight: "900", color: WHITE }}>ID</Text> e{" "}
                <Text style={{ fontWeight: "900", color: WHITE }}>senha</Text>.
                Sem eles não é possível entrar.
              </Text>
            </View>
            <TouchableOpacity
              style={s.botao}
              onPress={continuar}
              activeOpacity={0.85}
            >
              <Text style={s.botaoTexto}>CONTINUAR</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={BG}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );

  return null;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 48, gap: 20 },

  logoWrap: { alignItems: "center", gap: 10, marginBottom: 4 },
  logoTitulo: {
    fontSize: 26,
    fontWeight: "900",
    color: WHITE,
    letterSpacing: 4,
  },
  logoSub: { fontSize: 13, color: GREY },

  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: "900",
    color: CYAN,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 4,
  },

  erroBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(229,57,53,0.15)",
    borderWidth: 1,
    borderColor: RED,
    borderRadius: 8,
    padding: 10,
  },
  erroTexto: { fontSize: 13, color: RED, fontWeight: "600", flex: 1 },
  regraBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: CARD2,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 12,
  },
  regraTexto: { fontSize: 12, color: GREY, flex: 1, lineHeight: 18 },

  label: { fontSize: 10, fontWeight: "800", color: CYAN, letterSpacing: 1.5 },
  labelHint: { fontSize: 9, fontWeight: "600", color: GREY, letterSpacing: 0 },
  input: {
    backgroundColor: CARD2,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: WHITE,
  },
  inputCodigo: {
    backgroundColor: CARD2,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 20,
    color: WHITE,
    textAlign: "center",
    fontWeight: "800",
    letterSpacing: 3,
  },

  senhaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD2,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    height: 50,
    paddingLeft: 16,
    paddingRight: 12,
    overflow: "hidden",
  },
  senhaInput: {
    flex: 1,
    height: "100%",
    fontSize: 18,
    color: WHITE,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
  },
  olhoIcone: { padding: 4, flexShrink: 0 },

  botao: {
    backgroundColor: CYAN,
    borderRadius: 10,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: CYAN,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  botaoOff: { backgroundColor: GREY, shadowOpacity: 0, elevation: 0 },
  botaoRow: { flexDirection: "row", alignItems: "center" },
  botaoTexto: {
    color: BG,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  linkTexto: { fontSize: 13, color: GREY },
  linkDestaque: { fontSize: 13, color: CYAN, fontWeight: "800" },

  tipoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: CARD2,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  tipoIcone: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  tipoTextos: { flex: 1 },
  tipoTitulo: { fontSize: 16, fontWeight: "800", color: WHITE },
  tipoSub: { fontSize: 12, color: GREY, marginTop: 2 },

  voltarBtn: { flexDirection: "row", alignItems: "center" },
  voltarTexto: { fontSize: 13, fontWeight: "700", color: CYAN },

  sucessoCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sucessoIcone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: CYAN,
    alignItems: "center",
    justifyContent: "center",
  },
  sucessoTitulo: { fontSize: 24, fontWeight: "900", color: WHITE },
  idDestaque: {
    backgroundColor: CARD2,
    borderWidth: 2,
    borderColor: CYAN,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  idDestaqueTexto: {
    fontSize: 32,
    fontWeight: "900",
    color: CYAN,
    letterSpacing: 5,
  },
  alertaBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(245,166,35,0.12)",
    borderWidth: 1,
    borderColor: YELLOW,
    borderRadius: 10,
    padding: 12,
    width: "100%",
  },
  alertaTexto: { fontSize: 12, color: GREY, flex: 1, lineHeight: 17 },
});
