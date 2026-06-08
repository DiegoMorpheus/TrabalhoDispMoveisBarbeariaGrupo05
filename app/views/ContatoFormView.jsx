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
const DANGE = "#C0392B";

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
const CHAVE_CADASTROS = "cadastros_app";
const chavePerfil = (id) => `perfil_${id}`;

function validarFormato(valor) {
  if (!valor || valor.length !== 6) return false;
  const letras = valor.replace(/[^a-zA-Z]/g, "").length;
  const numeros = valor.replace(/[^0-9]/g, "").length;
  return letras === 3 && numeros === 3;
}

export default function ContatoFormView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [sessao, setSessao] = useState(null);
  const [idContato, setIdContato] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [genero, setGenero] = useState(null);
  const [nomeId, setNomeId] = useState("");
  const [nomeIdBloqueado, setNomeIdBloqueado] = useState(false);
  // ✅ NOVO: campos de senha
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmandoDesativar, setConfirmandoDesativar] = useState(false);
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
          if (perfil.nomeId) {
            setNomeId(perfil.nomeId);
            setNomeIdBloqueado(true);
          } else {
            setNomeId(s.id ?? "");
          }
        } else {
          setNomeId(s.id ?? "");
        }

        // ✅ Carrega senha atual do cadastros_app
        const rawCad = await AsyncStorage.getItem(CHAVE_CADASTROS);
        if (rawCad) {
          const cadastros = JSON.parse(rawCad);
          if (cadastros[s.id]?.senha) setSenha(cadastros[s.id].senha);
        }
      }
    };
    carregar();
  }, [id]);

  const isProfissional = sessao?.tipo === "profissional";
  const CL = isProfissional ? COR.profissional : COR.usuario;

  // ✅ NOVO: salvar nova senha
  async function salvarSenha() {
    setErro("");
    if (!validarFormato(novaSenha)) {
      setErro("Senha deve ter 6 caracteres: 3 letras e 3 números.\nEx: XYZ456");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    try {
      // Atualiza em cadastros_app
      const rawCad = await AsyncStorage.getItem(CHAVE_CADASTROS);
      const cadastros = rawCad ? JSON.parse(rawCad) : {};
      if (sessao?.id && cadastros[sessao.id]) {
        cadastros[sessao.id].senha = novaSenha.toUpperCase();
        await AsyncStorage.setItem(CHAVE_CADASTROS, JSON.stringify(cadastros));
        // Atualiza sessão ativa também
        await AsyncStorage.setItem(
          CHAVE_SESSAO,
          JSON.stringify(cadastros[sessao.id]),
        );
      }
      setSenha(novaSenha.toUpperCase());
      setNovaSenha("");
      setConfirmarSenha("");
      setAlterandoSenha(false);
      setErro("");
    } catch {
      setErro("Erro ao alterar senha.");
    }
  }

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

    if (!nomeIdBloqueado && nomeId && !validarFormato(nomeId)) {
      setErro("Nome de Id deve ter 6 caracteres: 3 letras e 3 números.");
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
        const rawPerfil = await AsyncStorage.getItem(chavePerfil(sessao.id));
        const perfilAtual = rawPerfil ? JSON.parse(rawPerfil) : {};
        const perfil = {
          ...perfilAtual,
          nome: nome.trim(),
          email: email.trim(),
          telefone: telefone.trim(),
          genero: genero ?? "M",
          nomeId: perfilAtual.nomeId ?? nomeId.trim().toUpperCase(),
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

  async function desativarConta() {
    try {
      const raw = await AsyncStorage.getItem(CHAVE_CADASTROS);
      const cadastros = raw ? JSON.parse(raw) : {};
      if (sessao?.id && cadastros[sessao.id]) {
        cadastros[sessao.id].ativa = false;
        await AsyncStorage.setItem(CHAVE_CADASTROS, JSON.stringify(cadastros));
      }
      await AsyncStorage.removeItem(CHAVE_SESSAO);
      router.replace("/views/LoginView");
    } catch {
      setErro("Erro ao desativar conta.");
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

            {/* ID da sessão */}
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
              returnKeyType="next"
            />

            {/* Nome de Id — bloqueado após primeiro save */}
            <Text style={[s.label, { color: CL.accent }]}>NOME DE ID</Text>
            {nomeIdBloqueado ? (
              <View style={s.inputReadOnly}>
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={18}
                  color={CL.accent}
                  style={{ marginRight: 8 }}
                />
                <Text style={s.inputReadOnlyTexto}>{nomeId}</Text>
                <MaterialCommunityIcons name="lock" size={14} color={GREY} />
              </View>
            ) : (
              <>
                <Text style={s.campoHint}>
                  6 caracteres: 3 letras e 3 números • Ex: ABC123
                </Text>
                <TextInput
                  style={s.input}
                  placeholder="Ex: ABC123"
                  placeholderTextColor={GREY}
                  value={nomeId}
                  onChangeText={(t) => setNomeId(t.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={6}
                  returnKeyType="next"
                />
              </>
            )}

            {/* ✅ NOVO: Senha — mutável */}
            <Text style={[s.label, { color: CL.accent }]}>SENHA</Text>
            {!alterandoSenha ? (
              // Mostra senha mascarada + botão alterar
              <View style={s.senhaRow}>
                <View style={[s.inputReadOnly, { flex: 1, marginBottom: 0 }]}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={18}
                    color={CL.accent}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={s.inputReadOnlyTexto}>
                    {mostrarSenha ? senha : "••••••"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setMostrarSenha((v) => !v)}
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons
                      name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={GREY}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[s.btnAlterar, { borderColor: CL.accent }]}
                  onPress={() => {
                    setAlterandoSenha(true);
                    setErro("");
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[s.btnAlterarTexto, { color: CL.accent }]}>
                    Alterar
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Formulário de troca de senha
              <View style={s.senhaBox}>
                <Text style={s.campoHint}>
                  Nova senha: 6 caracteres, 3 letras e 3 números
                </Text>

                <View style={s.senhaWrap}>
                  <TextInput
                    style={s.inputSenha}
                    placeholder="Nova senha"
                    placeholderTextColor={GREY}
                    value={novaSenha}
                    onChangeText={(t) => setNovaSenha(t.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={6}
                    secureTextEntry={!mostrarNova}
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={() => setMostrarNova((v) => !v)}
                    style={s.olhoBtn}
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons
                      name={mostrarNova ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={GREY}
                    />
                  </TouchableOpacity>
                </View>

                <View style={s.senhaWrap}>
                  <TextInput
                    style={s.inputSenha}
                    placeholder="Confirmar nova senha"
                    placeholderTextColor={GREY}
                    value={confirmarSenha}
                    onChangeText={(t) => setConfirmarSenha(t.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={6}
                    secureTextEntry={!mostrarConfirmar}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => setMostrarConfirmar((v) => !v)}
                    style={s.olhoBtn}
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons
                      name={
                        mostrarConfirmar ? "eye-off-outline" : "eye-outline"
                      }
                      size={18}
                      color={GREY}
                    />
                  </TouchableOpacity>
                </View>

                <View style={s.senhaBotoes}>
                  <TouchableOpacity
                    style={[s.btnSalvarSenha, { backgroundColor: CL.accent }]}
                    onPress={salvarSenha}
                    activeOpacity={0.85}
                  >
                    <Text style={s.btnSalvarSenhaTexto}>Salvar senha</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.btnCancelar}
                    onPress={() => {
                      setAlterandoSenha(false);
                      setNovaSenha("");
                      setConfirmarSenha("");
                      setErro("");
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={s.btnCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Gênero */}
            <Text style={[s.label, { color: CL.accent, marginTop: 8 }]}>
              GÊNERO
            </Text>
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

            {/* Salvar */}
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

            {/* Desativar conta */}
            <View style={s.separador} />
            {!confirmandoDesativar ? (
              <TouchableOpacity
                style={s.btnDesativar}
                onPress={() => setConfirmandoDesativar(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="account-off-outline"
                  size={18}
                  color={DANGE}
                />
                <Text style={s.btnDesativarTexto}> Desativar minha conta</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.confirmaDesativar}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={16}
                  color={DANGE}
                />
                <Text style={s.confirmaDesativarTexto}>
                  {"  "}Deseja desativar sua conta?
                </Text>
                <View style={s.confirmaRow}>
                  <TouchableOpacity
                    style={s.confirmaSim}
                    onPress={desativarConta}
                    activeOpacity={0.8}
                  >
                    <Text style={s.confirmaSimTexto}>Sim, desativar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.confirmaNao}
                    onPress={() => setConfirmandoDesativar(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={s.confirmaNaoTexto}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  erroTexto: { fontSize: 13, fontWeight: "600", flex: 1 },

  label: { fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 4 },
  campoHint: { fontSize: 11, color: GREY, marginBottom: 6, marginTop: -2 },
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

  // Senha
  senhaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  btnAlterar: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: "center",
  },
  btnAlterarTexto: { fontSize: 13, fontWeight: "800" },

  senhaBox: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 18,
  },
  senhaWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DDD",
    borderRadius: 8,
    height: 48,
    backgroundColor: WHITE,
    paddingHorizontal: 12,
  },
  inputSenha: {
    flex: 1,
    fontSize: 16,
    color: DARK,
    fontWeight: "700",
    letterSpacing: 2,
  },
  olhoBtn: { padding: 4 },
  senhaBotoes: { flexDirection: "row", gap: 10 },
  btnSalvarSenha: {
    flex: 1,
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  btnSalvarSenhaTexto: { color: WHITE, fontWeight: "800", fontSize: 14 },
  btnCancelar: {
    flex: 1,
    backgroundColor: "#EEE",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  btnCancelarTexto: { color: DARK, fontWeight: "800", fontSize: 14 },

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

  separador: { height: 1, backgroundColor: "#EEE", marginVertical: 20 },
  btnDesativar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  btnDesativarTexto: { fontSize: 14, fontWeight: "700", color: DANGE },

  confirmaDesativar: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFCCCC",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  confirmaDesativarTexto: { fontSize: 13, color: DARK, lineHeight: 18 },
  confirmaRow: { flexDirection: "row", gap: 10 },
  confirmaSim: {
    flex: 1,
    backgroundColor: DANGE,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  confirmaSimTexto: { color: WHITE, fontWeight: "800", fontSize: 13 },
  confirmaNao: {
    flex: 1,
    backgroundColor: "#EEE",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  confirmaNaoTexto: { color: DARK, fontWeight: "800", fontSize: 13 },
});
