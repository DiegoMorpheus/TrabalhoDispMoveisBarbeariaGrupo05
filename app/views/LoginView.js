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

const RED = "#8B1A1A";
const WHITE = "#FFFFFF";
const DARK = "#1C0A0A";
const GREY = "#9A7A7A";
const GREEN = "#2E7D32";
const YELLOW = "#B8860B";
const BG = "#FAFAF8";

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
  const cadastros = raw ? JSON.parse(raw) : {};
  return !!cadastros[id.toUpperCase()];
}

async function profissionalJaCadastrado(nome) {
  const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
  const cadastros = raw ? JSON.parse(raw) : {};
  return Object.values(cadastros).some(
    (c) =>
      c.tipo === "profissional" &&
      c.nome?.toLowerCase() === nome.toLowerCase() &&
      c.ativa !== false,
  );
}

// ✅ CORREÇÃO: componente extraído FORA do LoginView
// Definir dentro causava re-montagem a cada tecla digitada (perda de foco)
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
          size={16}
          color={RED}
        />
        <Text style={s.regraTexto}>
          {"  "}ID e senha:{" "}
          <Text style={{ fontWeight: "900" }}>6 caracteres</Text> (3 letras + 3
          números){"\n"}
          {"  "}Exemplo:{" "}
          <Text style={{ fontWeight: "700" }}>ABC123 · A1B2C3 · 1A2B3C</Text>
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
        style={s.inputId}
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
      <View style={s.senhaWrap}>
        <TextInput
          style={s.inputSenha}
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
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={GREY}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[s.botao, loading && s.botaoDesativado]}
        onPress={onConfirmar}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator size="small" color={WHITE} />
        ) : (
          <View style={s.botaoConteudo}>
            <Text style={s.botaoTexto}>CRIAR CONTA</Text>
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={WHITE}
              style={{ marginLeft: 10 }}
            />
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={s.voltarBtn}
        onPress={onVoltar}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={16} color={RED} />
        <Text style={s.voltarTexto}> Voltar</Text>
      </TouchableOpacity>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LoginView() {
  const [etapa, setEtapa] = useState("login");
  const [inputId, setInputId] = useState("");
  const [inputSenha, setInputSenha] = useState("");
  const [novoId, setNovoId] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  // ✅ NOVO: nome livre para profissional
  const [nomeProf, setNomeProf] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [idConfirmado, setIdConfirmado] = useState("");
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);

  const resetRegistro = () => {
    setErro("");
    setNovoId("");
    setNovaSenha("");
    setNomeProf("");
  };

  // ── Entrar ─────────────────────────────────────────────────────────────
  const entrar = async () => {
    setErro("");
    const id = inputId.trim().toUpperCase();
    const senha = inputSenha.trim().toUpperCase();
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
      const cadastros = raw ? JSON.parse(raw) : {};

      if (!cadastros[id]) {
        setErro("ID não encontrado.");
        setLoading(false);
        return;
      }
      const conta = cadastros[id];
      if (conta.ativa === false) {
        setErro("Conta desativada. Contate a barbearia.");
        setLoading(false);
        return;
      }
      if (conta.senha !== senha) {
        setErro("Senha incorreta.");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(conta));
      setLoading(false);
      if (conta.tipo === "profissional")
        router.replace("/views/HomeProfissionalView");
      else router.replace("/");
    } catch {
      setLoading(false);
      setErro("Erro ao entrar. Tente novamente.");
    }
  };

  // ── Registrar usuário ──────────────────────────────────────────────────
  const registrarUsuario = async () => {
    setErro("");
    const id = novoId.trim().toUpperCase();
    const senha = novaSenha.trim().toUpperCase();

    if (!validarFormato(id)) {
      setErro("ID inválido: 6 caracteres, 3 letras e 3 números.");
      return;
    }
    if (!validarFormato(senha)) {
      setErro("Senha inválida: 6 caracteres, 3 letras e 3 números.");
      return;
    }
    if (await idJaExiste(id)) {
      setErro("Este ID já está em uso. Escolha outro.");
      return;
    }

    setLoading(true);
    try {
      const conta = { tipo: "usuario", id, ativa: true, senha };
      const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
      const cadastros = raw ? JSON.parse(raw) : {};
      cadastros[id] = conta;
      await AsyncStorage.setItem(CHAVE_CADASTROS, JSON.stringify(cadastros));
      await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(conta));
      setIdConfirmado(id);
      setLoading(false);
      setEtapa("novoSucesso");
    } catch {
      setLoading(false);
      setErro("Erro ao criar conta.");
    }
  };

  // ── ✅ Registrar profissional (nome livre, sem lista fixa) ─────────────
  const registrarProfissional = async () => {
    setErro("");
    const nome = nomeProf.trim();
    const id = novoId.trim().toUpperCase();
    const senha = novaSenha.trim().toUpperCase();

    if (!nome) {
      setErro("Informe seu nome.");
      return;
    }
    if (!validarFormato(id)) {
      setErro("ID inválido: 6 caracteres, 3 letras e 3 números.");
      return;
    }
    if (!validarFormato(senha)) {
      setErro("Senha inválida: 6 caracteres, 3 letras e 3 números.");
      return;
    }
    if (await idJaExiste(id)) {
      setErro("Este ID já está em uso. Escolha outro.");
      return;
    }
    if (await profissionalJaCadastrado(nome)) {
      setErro(`Já existe uma conta ativa para "${nome}".`);
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
      const cadastros = raw ? JSON.parse(raw) : {};
      cadastros[id] = conta;
      await AsyncStorage.setItem(CHAVE_CADASTROS, JSON.stringify(cadastros));
      await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(conta));
      setIdConfirmado(id);
      setLoading(false);
      setEtapa("novoSucesso");
    } catch {
      setLoading(false);
      setErro("Erro ao criar conta.");
    }
  };

  const continuar = () => {
    AsyncStorage.getItem(CHAVE_SESSAO).then((raw) => {
      const s = JSON.parse(raw);
      if (s.tipo === "profissional")
        router.replace("/views/HomeProfissionalView");
      else router.replace("/");
    });
  };

  // ── TELA: Login ──────────────────────────────────────────────────────────
  if (etapa === "login") {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.branding}>
            <View style={s.logoCircle}>
              <MaterialCommunityIcons
                name="content-cut"
                size={52}
                color={WHITE}
              />
            </View>
            <Text style={s.logoTitulo}>BARBEARIA</Text>
            <Text style={s.logoSub}>Entre com seu ID e senha</Text>
          </View>

          <View style={s.card}>
            <View style={s.cardBarra} />
            <View style={s.cardBody}>
              <Text style={s.cardTitulo}>ENTRAR</Text>

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

              <Text style={s.label}>ID</Text>
              <TextInput
                style={s.inputId}
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
              <View style={s.senhaWrap}>
                <TextInput
                  style={s.inputSenha}
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
                  hitSlop={8}
                >
                  <MaterialCommunityIcons
                    name={mostrarLogin ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={GREY}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[s.botao, loading && s.botaoDesativado]}
                onPress={entrar}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={WHITE} />
                ) : (
                  <View style={s.botaoConteudo}>
                    <Text style={s.botaoTexto}>ENTRAR</Text>
                    <MaterialCommunityIcons
                      name="login"
                      size={20}
                      color={WHITE}
                      style={{ marginLeft: 10 }}
                    />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={s.linkBtn}
                onPress={() => {
                  resetRegistro();
                  setEtapa("novoTipo");
                }}
                activeOpacity={0.7}
              >
                <Text style={s.linkTexto}>
                  Primeira vez?{" "}
                  <Text style={s.linkDestaque}>Criar minha conta</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── TELA: Escolha do tipo ────────────────────────────────────────────────
  if (etapa === "novoTipo") {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.branding}>
            <View style={s.logoCircle}>
              <MaterialCommunityIcons
                name="content-cut"
                size={52}
                color={WHITE}
              />
            </View>
            <Text style={s.logoTitulo}>BARBEARIA</Text>
          </View>
          <View style={s.card}>
            <View style={s.cardBarra} />
            <View style={s.cardBody}>
              <Text style={s.cardTitulo}>CRIAR CONTA</Text>
              <Text style={s.cardSubtitulo}>Qual é o seu perfil?</Text>

              <TouchableOpacity
                style={s.tipoCard}
                onPress={() => setEtapa("novoUsuario")}
                activeOpacity={0.85}
              >
                <View style={[s.tipoIcone, { backgroundColor: RED }]}>
                  <MaterialCommunityIcons
                    name="account"
                    size={34}
                    color={WHITE}
                  />
                </View>
                <View style={s.tipoTextos}>
                  <Text style={s.tipoTitulo}>Usuário</Text>
                  <Text style={s.tipoSub}>
                    Agende serviços e acompanhe sua agenda
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={GREY}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={s.tipoCard}
                onPress={() => setEtapa("novoProfissional")}
                activeOpacity={0.85}
              >
                <View style={[s.tipoIcone, { backgroundColor: "#4A0E0E" }]}>
                  <MaterialCommunityIcons
                    name="account-tie"
                    size={34}
                    color={WHITE}
                  />
                </View>
                <View style={s.tipoTextos}>
                  <Text style={s.tipoTitulo}>Profissional</Text>
                  <Text style={s.tipoSub}>
                    Gerencie seus agendamentos e habilidades
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
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
                  color={RED}
                />
                <Text style={s.voltarTexto}> Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── TELA: Registro — Usuário ─────────────────────────────────────────────
  if (etapa === "novoUsuario") {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <View style={s.cardBarra} />
            <View style={s.cardBody}>
              <Text style={s.cardTitulo}>CRIAR CONTA</Text>
              <Text style={s.cardSubtitulo}>Usuário</Text>
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
                  resetRegistro();
                  setEtapa("novoTipo");
                }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── TELA: Registro — Profissional (nome livre) ───────────────────────────
  if (etapa === "novoProfissional") {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <View style={s.cardBarra} />
            <View style={s.cardBody}>
              <Text style={s.cardTitulo}>CRIAR CONTA</Text>
              <Text style={s.cardSubtitulo}>Profissional</Text>
              {/* ✅ Campo de nome livre — acima dos campos de ID/senha */}
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
                  resetRegistro();
                  setEtapa("novoTipo");
                }}
                labelExtra={
                  <>
                    <Text style={s.label}>SEU NOME</Text>
                    <TextInput
                      style={[
                        s.inputId,
                        {
                          letterSpacing: 0,
                          fontSize: 16,
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
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── TELA: Sucesso ────────────────────────────────────────────────────────
  if (etapa === "novoSucesso") {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <ScrollView
          contentContainerStyle={[s.scroll, { justifyContent: "center" }]}
        >
          <View style={s.sucessoCard}>
            <View style={s.sucessoIcone}>
              <MaterialCommunityIcons
                name="check-bold"
                size={44}
                color={WHITE}
              />
            </View>
            <Text style={s.sucessoTitulo}>Conta criada!</Text>
            <Text style={s.sucessoSub}>Seu ID de acesso:</Text>
            <View style={s.idDestaque}>
              <Text style={s.idDestaqueTexto}>{idConfirmado}</Text>
            </View>
            <View style={s.alertaBox}>
              <MaterialCommunityIcons name="alert" size={18} color={YELLOW} />
              <Text style={s.alertaTexto}>
                {"  "}Guarde seu <Text style={{ fontWeight: "900" }}>ID</Text> e
                sua <Text style={{ fontWeight: "900" }}>senha</Text>. Sem eles
                não será possível entrar.
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
                size={20}
                color={WHITE}
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 48, gap: 16 },
  branding: { alignItems: "center", gap: 10, marginBottom: 8 },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: RED,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoTitulo: {
    fontSize: 28,
    fontWeight: "900",
    color: DARK,
    letterSpacing: 4,
  },
  logoSub: { fontSize: 14, color: GREY },
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
  cardBarra: { height: 6, backgroundColor: RED },
  cardBody: { padding: 24, gap: 12 },
  cardTitulo: {
    fontSize: 20,
    fontWeight: "900",
    color: DARK,
    textAlign: "center",
    letterSpacing: 1.5,
  },
  cardSubtitulo: {
    fontSize: 14,
    color: GREY,
    textAlign: "center",
    marginTop: -6,
  },
  erroBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFCCCC",
    borderRadius: 8,
    padding: 10,
  },
  erroTexto: { fontSize: 13, color: RED, fontWeight: "600", flex: 1 },
  regraBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF5F0",
    borderWidth: 1,
    borderColor: "#FFCCCC",
    borderRadius: 8,
    padding: 12,
  },
  regraTexto: { fontSize: 13, color: DARK, flex: 1, lineHeight: 20 },
  label: { fontSize: 11, fontWeight: "800", color: RED, letterSpacing: 1 },
  labelHint: { fontSize: 10, fontWeight: "600", color: GREY, letterSpacing: 0 },
  inputId: {
    borderWidth: 1.5,
    borderColor: "#DDD",
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 22,
    color: DARK,
    backgroundColor: WHITE,
    textAlign: "center",
    fontWeight: "800",
    letterSpacing: 4,
  },
  senhaWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DDD",
    borderRadius: 8,
    height: 56,
    backgroundColor: WHITE,
    paddingHorizontal: 12,
  },
  inputSenha: {
    flex: 1,
    fontSize: 22,
    color: DARK,
    fontWeight: "800",
    letterSpacing: 4,
    textAlign: "center",
  },
  botao: {
    backgroundColor: RED,
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: RED,
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
  linkBtn: { alignItems: "center", paddingVertical: 4 },
  linkTexto: { fontSize: 14, color: GREY },
  linkDestaque: { color: RED, fontWeight: "800" },
  tipoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: BG,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  tipoIcone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  tipoTextos: { flex: 1, gap: 2 },
  tipoTitulo: { fontSize: 17, fontWeight: "800", color: DARK },
  tipoSub: { fontSize: 12, color: GREY },
  voltarBtn: { flexDirection: "row", alignItems: "center", paddingTop: 4 },
  voltarTexto: { fontSize: 14, fontWeight: "700", color: RED },
  sucessoCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sucessoIcone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  sucessoTitulo: { fontSize: 26, fontWeight: "900", color: DARK },
  sucessoSub: { fontSize: 14, color: GREY },
  idDestaque: {
    backgroundColor: "#F5EDE2",
    borderWidth: 2.5,
    borderColor: RED,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginVertical: 4,
  },
  idDestaqueTexto: {
    fontSize: 36,
    fontWeight: "900",
    color: RED,
    letterSpacing: 6,
  },
  alertaBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8E8",
    borderWidth: 1.5,
    borderColor: "#D4A010",
    borderRadius: 10,
    padding: 12,
    width: "100%",
  },
  alertaTexto: { fontSize: 13, color: "#7A5500", flex: 1, lineHeight: 18 },
});
