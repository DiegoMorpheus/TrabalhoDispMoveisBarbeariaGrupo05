// app/views/ContatoFormView.jsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import ContatoEntity from "../entities/ClienteEntity";
import ContatoService from "../services/ContatoService";

const BG     = "#0F1123";
const CARD   = "#1A1F3A";
const CARD2  = "#232845";
const CYAN   = "#00C8DC";
const RED_A  = "#E53935";
const WHITE  = "#FFFFFF";
const GREY   = "#8892B0";
const BORDER = "#2D3461";
const GREEN  = "#2E7D32";
const DANGE  = "#E53935";

const CHAVE_SESSAO    = "sessao_barbearia";
const CHAVE_CADASTROS = "cadastros_app";
const chavePerfil     = (id) => `perfil_${id}`;

function validarFormato(v){if(!v||v.length!==6)return false;const l=v.replace(/[^a-zA-Z]/g,"").length,n=v.replace(/[^0-9]/g,"").length;return l===3&&n===3;}

export default function ContatoFormView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [sessao,               setSessao]               = useState(null);
  const [idContato,            setIdContato]            = useState(null);
  const [nome,                 setNome]                 = useState("");
  const [email,                setEmail]                = useState("");
  const [telefone,             setTelefone]             = useState("");
  const [genero,               setGenero]               = useState(null);
  const [nomeId,               setNomeId]               = useState("");
  const [nomeIdBloqueado,      setNomeIdBloqueado]      = useState(false);
  const [senha,                setSenha]                = useState("");
  const [novaSenha,            setNovaSenha]            = useState("");
  const [confirmarSenha,       setConfirmarSenha]       = useState("");
  const [alterandoSenha,       setAlterandoSenha]       = useState(false);
  const [mostrarSenha,         setMostrarSenha]         = useState(false);
  const [mostrarNova,          setMostrarNova]          = useState(false);
  const [mostrarConf,          setMostrarConf]          = useState(false);
  const [salvando,             setSalvando]             = useState(false);
  const [sucesso,              setSucesso]              = useState(false);
  const [erro,                 setErro]                 = useState("");
  const [confirmDesativar,     setConfirmDesativar]     = useState(false);
  const [favorito,             setFavorito]             = useState(false);
  const [categoria,            setCategoria]            = useState("Clientes");

  useEffect(() => {
    const carregar = async () => {
      const rawSessao = await AsyncStorage.getItem(CHAVE_SESSAO);
      const s = rawSessao ? JSON.parse(rawSessao) : null;
      setSessao(s);
      if (id) { const c=await ContatoService.findById(id); if(c){setIdContato(c.id);setNome(c.nome);setEmail(c.email);setTelefone(c.telefone);setGenero(c.sexo??null);setFavorito(c.favorito);setCategoria(c.categoria);return;} }
      if (s?.id) {
        const rp=await AsyncStorage.getItem(chavePerfil(s.id));
        if(rp){const p=JSON.parse(rp);setNome(p.nome??"");setEmail(p.email??"");setTelefone(p.telefone??"");setGenero(p.genero??null);if(p.nomeId){setNomeId(p.nomeId);setNomeIdBloqueado(true);}else setNomeId(s.id??"");}
        else setNomeId(s.id??"");
        const rc=await AsyncStorage.getItem(CHAVE_CADASTROS);
        if(rc){const c=JSON.parse(rc);if(c[s.id]?.senha)setSenha(c[s.id].senha);}
      }
    };
    carregar();
  }, [id]);

  const isProfissional = sessao?.tipo === "profissional";
  const ACCENT = isProfissional ? CYAN : CYAN; // ambos cyan no dark theme

  const salvarSenha = async () => {
    setErro("");
    if(!validarFormato(novaSenha)){setErro("Senha: 6 caracteres, 3 letras e 3 números.");return;}
    if(novaSenha!==confirmarSenha){setErro("As senhas não coincidem.");return;}
    const rc=await AsyncStorage.getItem(CHAVE_CADASTROS);
    const cads=rc?JSON.parse(rc):{};
    if(sessao?.id&&cads[sessao.id]){cads[sessao.id].senha=novaSenha.toUpperCase();await AsyncStorage.setItem(CHAVE_CADASTROS,JSON.stringify(cads));await AsyncStorage.setItem(CHAVE_SESSAO,JSON.stringify(cads[sessao.id]));}
    setSenha(novaSenha.toUpperCase());setNovaSenha("");setConfirmarSenha("");setAlterandoSenha(false);
  };

  const salvar = async () => {
    setErro("");
    if(!nome.trim()){setErro("Informe seu nome.");return;}
    if(!email.trim()){setErro("Informe seu e-mail.");return;}
    if(!nomeIdBloqueado&&nomeId&&!validarFormato(nomeId)){setErro("Nome de Id: 6 caracteres, 3 letras e 3 números.");return;}
    setSalvando(true);
    try {
      const c=new ContatoEntity(idContato,nome,email,telefone,null,favorito,categoria,genero??"M");
      await ContatoService.save(c);
      if(sessao?.id){
        const rp=await AsyncStorage.getItem(chavePerfil(sessao.id));
        const pa=rp?JSON.parse(rp):{};
        await AsyncStorage.setItem(chavePerfil(sessao.id),JSON.stringify({...pa,nome:nome.trim(),email:email.trim(),telefone:telefone.trim(),genero:genero??"M",nomeId:pa.nomeId??nomeId.trim().toUpperCase()}));
        if(isProfissional&&sessao.nome)await AsyncStorage.setItem(`genero_prof_${sessao.nome}`,genero??"M");
      }
      setSucesso(true);setSalvando(false);setTimeout(()=>router.back(),1200);
    } catch {setSalvando(false);setErro("Erro ao salvar.");}
  };

  const desativarConta = async () => {
    const rc=await AsyncStorage.getItem(CHAVE_CADASTROS);
    const cads=rc?JSON.parse(rc):{};
    if(sessao?.id&&cads[sessao.id]){cads[sessao.id].ativa=false;await AsyncStorage.setItem(CHAVE_CADASTROS,JSON.stringify(cads));}
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    router.replace("/views/LoginView");
  };

  if (sucesso) return (
    <View style={[s.root,{justifyContent:"center",alignItems:"center",gap:14,padding:32}]}>
      <View style={s.sucessoIcone}><MaterialCommunityIcons name="check-bold" size={40} color={BG}/></View>
      <Text style={s.sucessoTitulo}>Cadastro salvo!</Text>
      <Text style={{color:GREY,fontSize:13}}>Voltando…</Text>
    </View>
  );

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={s.titulo}>MEU CADASTRO</Text>

        {/* ID */}
        {sessao?.id && (<>
          <Text style={s.label}>ID</Text>
          <View style={s.readOnly}><MaterialCommunityIcons name="identifier" size={16} color={CYAN} style={{marginRight:8}}/><Text style={s.readOnlyTexto}>{sessao.id}</Text><MaterialCommunityIcons name="lock" size={13} color={GREY}/></View>
        </>)}

        {erro?<View style={s.erroBox}><MaterialCommunityIcons name="alert-circle-outline" size={14} color={RED_A}/><Text style={s.erroTexto}> {erro}</Text></View>:null}

        <Text style={s.label}>NOME</Text>
        <TextInput style={s.input} placeholder="Seu nome completo" placeholderTextColor={GREY} value={nome} onChangeText={setNome} />

        <Text style={s.label}>E-MAIL</Text>
        <TextInput style={s.input} placeholder="seu@email.com" placeholderTextColor={GREY} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={s.label}>TELEFONE</Text>
        <TextInput style={s.input} placeholder="(31) 99999-0000" placeholderTextColor={GREY} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

        <Text style={s.label}>NOME DE ID</Text>
        {nomeIdBloqueado
          ? <View style={s.readOnly}><MaterialCommunityIcons name="card-account-details-outline" size={16} color={CYAN} style={{marginRight:8}}/><Text style={s.readOnlyTexto}>{nomeId}</Text><MaterialCommunityIcons name="lock" size={13} color={GREY}/></View>
          : <><Text style={s.hint}>6 caracteres: 3 letras e 3 números  •  Ex: ABC123</Text><TextInput style={s.input} placeholder="Ex: ABC123" placeholderTextColor={GREY} value={nomeId} onChangeText={t=>setNomeId(t.toUpperCase())} autoCapitalize="characters" maxLength={6}/></>
        }

        {/* Senha */}
        <Text style={s.label}>SENHA</Text>
        {!alterandoSenha
          ? <View style={s.senhaRow}>
              <View style={[s.readOnly,{flex:1,marginBottom:0}]}><MaterialCommunityIcons name="lock-outline" size={16} color={CYAN} style={{marginRight:8}}/><Text style={s.readOnlyTexto}>{mostrarSenha?senha:"••••••"}</Text><TouchableOpacity onPress={()=>setMostrarSenha(v=>!v)} hitSlop={8}><MaterialCommunityIcons name={mostrarSenha?"eye-off-outline":"eye-outline"} size={16} color={GREY}/></TouchableOpacity></View>
              <TouchableOpacity style={[s.btnAlterar]} onPress={()=>{setAlterandoSenha(true);setErro("");}}>
                <Text style={s.btnAlterarTexto}>Alterar</Text>
              </TouchableOpacity>
            </View>
          : <View style={s.senhaBox}>
              <Text style={s.hint}>Nova senha: 6 caracteres, 3 letras e 3 números</Text>
              <View style={s.senhaContainer}><TextInput style={s.senhaInput} placeholder="Nova senha" placeholderTextColor={GREY} value={novaSenha} onChangeText={t=>setNovaSenha(t.toUpperCase())} autoCapitalize="characters" maxLength={6} secureTextEntry={!mostrarNova}/><TouchableOpacity onPress={()=>setMostrarNova(v=>!v)} style={s.olho} hitSlop={8}><MaterialCommunityIcons name={mostrarNova?"eye-off-outline":"eye-outline"} size={18} color={GREY}/></TouchableOpacity></View>
              <View style={s.senhaContainer}><TextInput style={s.senhaInput} placeholder="Confirmar" placeholderTextColor={GREY} value={confirmarSenha} onChangeText={t=>setConfirmarSenha(t.toUpperCase())} autoCapitalize="characters" maxLength={6} secureTextEntry={!mostrarConf}/><TouchableOpacity onPress={()=>setMostrarConf(v=>!v)} style={s.olho} hitSlop={8}><MaterialCommunityIcons name={mostrarConf?"eye-off-outline":"eye-outline"} size={18} color={GREY}/></TouchableOpacity></View>
              <View style={s.senhaBotoes}>
                <TouchableOpacity style={[s.btnSalvarSenha,{backgroundColor:CYAN}]} onPress={salvarSenha}><Text style={[s.botaoTexto,{color:BG}]}>Salvar senha</Text></TouchableOpacity>
                <TouchableOpacity style={s.btnCancelarSenha} onPress={()=>{setAlterandoSenha(false);setNovaSenha("");setConfirmarSenha("");setErro("");}}><Text style={{color:GREY,fontWeight:"700",fontSize:13}}>Cancelar</Text></TouchableOpacity>
              </View>
            </View>
        }

        {/* Gênero */}
        <Text style={[s.label,{marginTop:8}]}>GÊNERO</Text>
        <View style={s.generoRow}>
          <TouchableOpacity style={[s.generoBtn, genero==="M"&&{backgroundColor:CYAN,borderColor:CYAN}]} onPress={()=>setGenero("M")} activeOpacity={0.8}><MaterialCommunityIcons name="face-man" size={26} color={genero==="M"?BG:GREY}/></TouchableOpacity>
          <TouchableOpacity style={[s.generoBtn, genero==="F"&&{backgroundColor:CYAN,borderColor:CYAN}]} onPress={()=>setGenero("F")} activeOpacity={0.8}><MaterialCommunityIcons name="face-woman" size={26} color={genero==="F"?BG:GREY}/></TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.botao,salvando&&s.botaoOff]} onPress={salvar} disabled={salvando} activeOpacity={0.85}>
          {salvando?<ActivityIndicator size="small" color={BG}/>:<View style={s.botaoRow}><Text style={s.botaoTexto}>SALVAR CADASTRO</Text><MaterialCommunityIcons name="content-save" size={18} color={BG} style={{marginLeft:8}}/></View>}
        </TouchableOpacity>

        {/* Desativar */}
        <View style={s.separador}/>
        {!confirmDesativar
          ? <TouchableOpacity style={s.btnDesativar} onPress={()=>setConfirmDesativar(true)}><MaterialCommunityIcons name="account-off-outline" size={16} color={DANGE}/><Text style={s.btnDesativarTexto}> Desativar minha conta</Text></TouchableOpacity>
          : <View style={s.confirmaBox}>
              <Text style={s.confirmaTexto}>Deseja desativar sua conta?</Text>
              <View style={s.confirmaRow}>
                <TouchableOpacity style={[s.confirmaSim,{backgroundColor:DANGE}]} onPress={desativarConta}><Text style={s.confirmaSimTexto}>Sim, desativar</Text></TouchableOpacity>
                <TouchableOpacity style={s.confirmaNao} onPress={()=>setConfirmDesativar(false)}><Text style={s.confirmaNaoTexto}>Cancelar</Text></TouchableOpacity>
              </View>
            </View>
        }
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex:1, backgroundColor:BG },
  scroll:{ paddingHorizontal:20, paddingTop:12, paddingBottom:48, gap:10 },
  titulo:{ fontSize:18, fontWeight:"900", color:CYAN, letterSpacing:2, textAlign:"center", marginBottom:4 },
  sucessoIcone:  { width:72, height:72, borderRadius:36, backgroundColor:CYAN, alignItems:"center", justifyContent:"center" },
  sucessoTitulo: { fontSize:22, fontWeight:"900", color:WHITE },
  erroBox:  { flexDirection:"row", alignItems:"flex-start", backgroundColor:"rgba(229,57,53,0.12)", borderWidth:1, borderColor:RED_A, borderRadius:8, padding:10 },
  erroTexto:{ fontSize:12, color:RED_A, fontWeight:"600", flex:1 },
  label:    { fontSize:10, fontWeight:"800", color:CYAN, letterSpacing:1.5 },
  hint:     { fontSize:10, color:GREY, marginTop:-4 },
  input:    { backgroundColor:CARD2, borderWidth:1, borderColor:BORDER, borderRadius:10, height:48, paddingHorizontal:14, fontSize:14, color:WHITE },
  readOnly: { flexDirection:"row", alignItems:"center", backgroundColor:CARD2, borderWidth:1, borderColor:BORDER, borderRadius:10, height:48, paddingHorizontal:14, marginBottom:4 },
  readOnlyTexto: { flex:1, fontSize:14, color:WHITE, fontWeight:"700" },
  senhaRow:  { flexDirection:"row", gap:8, alignItems:"center", marginBottom:4 },
  btnAlterar:{ backgroundColor:CARD2, borderRadius:10, paddingHorizontal:14, height:48, justifyContent:"center", borderWidth:1, borderColor:CYAN },
  btnAlterarTexto:{ fontSize:12, fontWeight:"800", color:CYAN },
  senhaBox:  { backgroundColor:CARD, borderRadius:12, padding:14, gap:8, borderWidth:1, borderColor:BORDER },
  senhaContainer:{ flexDirection:"row", alignItems:"center", backgroundColor:CARD2, borderWidth:1, borderColor:BORDER, borderRadius:10, height:48, paddingLeft:14, paddingRight:10, overflow:"hidden" },
  senhaInput:{ flex:1, fontSize:16, color:WHITE, fontWeight:"700", letterSpacing:2, textAlign:"center" },
  olho:      { padding:4, flexShrink:0 },
  senhaBotoes:{ flexDirection:"row", gap:8 },
  btnSalvarSenha: { flex:1, borderRadius:8, height:42, justifyContent:"center", alignItems:"center" },
  btnCancelarSenha:{ flex:1, backgroundColor:CARD2, borderRadius:8, height:42, justifyContent:"center", alignItems:"center", borderWidth:1, borderColor:BORDER },
  generoRow: { flexDirection:"row", gap:10, marginBottom:8 },
  generoBtn: { width:50, height:50, borderRadius:10, borderWidth:1.5, borderColor:BORDER, backgroundColor:CARD2, alignItems:"center", justifyContent:"center" },
  botao:    { backgroundColor:CYAN, borderRadius:10, height:52, justifyContent:"center", alignItems:"center", shadowColor:CYAN, shadowOpacity:0.4, shadowRadius:8, elevation:5 },
  botaoOff: { backgroundColor:GREY, shadowOpacity:0, elevation:0 },
  botaoRow: { flexDirection:"row", alignItems:"center" },
  botaoTexto:{ color:BG, fontSize:14, fontWeight:"900", letterSpacing:1.2 },
  separador: { height:1, backgroundColor:BORDER, marginVertical:16 },
  btnDesativar:     { flexDirection:"row", alignItems:"center", justifyContent:"center", paddingVertical:10 },
  btnDesativarTexto:{ fontSize:13, fontWeight:"700", color:DANGE },
  confirmaBox:  { backgroundColor:CARD2, borderWidth:1, borderColor:DANGE, borderRadius:12, padding:14, gap:10 },
  confirmaTexto:{ fontSize:13, color:WHITE, fontWeight:"600" },
  confirmaRow:  { flexDirection:"row", gap:8 },
  confirmaSim:  { flex:1, borderRadius:8, paddingVertical:9, alignItems:"center" },
  confirmaSimTexto: { color:WHITE, fontWeight:"800", fontSize:12 },
  confirmaNao:  { flex:1, backgroundColor:CARD, borderRadius:8, paddingVertical:9, alignItems:"center", borderWidth:1, borderColor:BORDER },
  confirmaNaoTexto: { color:GREY, fontWeight:"800", fontSize:12 },
});
