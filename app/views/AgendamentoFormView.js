// app/views/AgendamentoFormView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const BG     = "#0F1123";
const CARD   = "#1A1F3A";
const CARD2  = "#232845";
const CYAN   = "#00C8DC";
const RED    = "#E53935";
const WHITE  = "#FFFFFF";
const GREY   = "#8892B0";
const BORDER = "#2D3461";
const GREEN  = "#2E7D32";

const CHAVE_STORAGE   = "agendamentos_barbearia";
const CHAVE_SESSAO    = "sessao_barbearia";
const CHAVE_CADASTROS = "cadastros_app";

const MESES    = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEM = ["D","S","T","Q","Q","S","S"];
const HORARIOS = (() => { const h=[]; for(let i=8;i<=20;i++){h.push(`${String(i).padStart(2,"0")}:00`);if(i<20)h.push(`${String(i).padStart(2,"0")}:30`);} return h; })();
function pad(n){return String(n).padStart(2,"0");}
function gerarDias(a,m){const p=new Date(a,m,1).getDay(),t=new Date(a,m+1,0).getDate(),d=[];for(let i=0;i<p;i++)d.push(null);for(let x=1;x<=t;x++)d.push(x);return d;}

function Calendario({ dataSelecionada, onSelecionar }) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const dias = gerarDias(ano, mes);
  const ant  = () => mes===0?[setMes(11),setAno(a=>a-1)]:setMes(m=>m-1);
  const prox = () => mes===11?[setMes(0),setAno(a=>a+1)]:setMes(m=>m+1);
  const sel  = (dia) => { if(dia) onSelecionar(`${pad(dia)}/${pad(mes+1)}/${ano}`); };
  const ehSel  = (dia) => dia && dataSelecionada===`${pad(dia)}/${pad(mes+1)}/${ano}`;
  const ehHoje = (dia) => dia===hoje.getDate()&&mes===hoje.getMonth()&&ano===hoje.getFullYear();
  return (
    <View style={cal.wrap}>
      <View style={cal.nav}>
        <TouchableOpacity onPress={ant} style={cal.navBtn}><MaterialCommunityIcons name="chevron-left" size={22} color={CYAN}/></TouchableOpacity>
        <Text style={cal.mesAno}>{MESES[mes]} {ano}</Text>
        <TouchableOpacity onPress={prox} style={cal.navBtn}><MaterialCommunityIcons name="chevron-right" size={22} color={CYAN}/></TouchableOpacity>
      </View>
      <View style={cal.semRow}>{DIAS_SEM.map((d,i)=><Text key={i} style={cal.semLabel}>{d}</Text>)}</View>
      <View style={cal.grid}>
        {dias.map((dia,idx)=>{
          const sel2=ehSel(dia),hoje2=ehHoje(dia);
          return <TouchableOpacity key={idx} style={[cal.dia, sel2&&{backgroundColor:CYAN}, hoje2&&!sel2&&{borderWidth:1,borderColor:CYAN}]} onPress={()=>sel(dia)} disabled={!dia} activeOpacity={dia?0.75:1}>
            {dia?<Text style={[cal.diaTexto, sel2&&{color:BG,fontWeight:"900"}]}>{dia}</Text>:null}
          </TouchableOpacity>;
        })}
      </View>
      {dataSelecionada
        ? <View style={cal.result}><MaterialCommunityIcons name="calendar-check" size={14} color={CYAN}/><Text style={cal.resultTexto}>  {dataSelecionada}</Text></View>
        : <Text style={cal.dica}>Toque em um dia para selecionar</Text>}
    </View>
  );
}

function SeletorHora({ horaSelecionada, onSelecionar }) {
  return (
    <View style={hor.wrap}>
      <View style={hor.grid}>
        {HORARIOS.map(h=>{
          const sel=horaSelecionada===h;
          const isBusy = false; // pode-se implementar lógica de ocupado
          return <TouchableOpacity key={h} style={[hor.chip, sel&&{backgroundColor:CYAN}, isBusy&&{backgroundColor:RED}]} onPress={()=>onSelecionar(h)} activeOpacity={0.75}>
            <Text style={[hor.texto, (sel||isBusy)&&{color:BG,fontWeight:"800"}]}>{h}</Text>
          </TouchableOpacity>;
        })}
      </View>
      {horaSelecionada
        ? <View style={hor.result}><MaterialCommunityIcons name="clock-check-outline" size={14} color={CYAN}/><Text style={hor.resultTexto}>  {horaSelecionada}</Text></View>
        : <Text style={hor.dica}>Selecione um horário disponível</Text>}
    </View>
  );
}

function SeletorProfissional({ profissionais, profSelecionado, onSelecionar }) {
  if (profissionais.length === 0) return (
    <View style={prof.wrap}><Text style={{ color:GREY, textAlign:"center", fontSize:13, padding:12 }}>Nenhum profissional cadastrado.</Text></View>
  );
  return (
    <View style={prof.wrap}>
      <View style={prof.grid}>
        {profissionais.map(p => {
          const sel = profSelecionado === p.nome;
          return (
            <TouchableOpacity key={p.id} style={[prof.card, sel&&{backgroundColor:CYAN, borderColor:CYAN}]} onPress={()=>onSelecionar(p.nome)} activeOpacity={0.8}>
              <View style={[prof.circulo, sel&&{backgroundColor:BG}]}><Text style={[prof.iniciais, sel&&{color:CYAN}]}>{p.initials}</Text></View>
              <Text style={[prof.nome, sel&&{color:BG}]} numberOfLines={1}>{p.nome}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {profSelecionado
        ? <View style={prof.result}><MaterialCommunityIcons name="account-check" size={14} color={CYAN}/><Text style={prof.resultTexto}>  {profSelecionado}</Text></View>
        : <Text style={prof.dica}>Escolha um profissional</Text>}
    </View>
  );
}

export default function AgendamentoFormView() {
  const params = useLocalSearchParams();
  const [sessao,          setSessao]         = useState(null);
  const [clienteId,       setClienteId]      = useState("");
  const [nomeServico,     setNomeServico]    = useState("");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [profSelecionado, setProfSelecionado] = useState(params?.profissionalNome || "");
  const [profissionais,   setProfissionais]   = useState([]);
  const [calAberto,    setCalAberto]    = useState(false);
  const [horaAberta,   setHoraAberta]   = useState(false);
  const [profAberto,   setProfAberto]   = useState(false);
  const [salvando,     setSalvando]     = useState(false);
  const [erro,         setErro]         = useState("");
  const [sucesso,      setSucesso]      = useState(false);

  useEffect(() => {
    const carregar = async () => {
      const rawSessao = await AsyncStorage.getItem(CHAVE_SESSAO);
      if (rawSessao) { const s=JSON.parse(rawSessao); setSessao(s); setClienteId(s.id||""); }
      const rawCad = await AsyncStorage.getItem(CHAVE_CADASTROS);
      if (rawCad) setProfissionais(Object.values(JSON.parse(rawCad)).filter(c=>c.tipo==="profissional"&&c.ativa!==false));
    };
    carregar();
  }, []);

  const salvar = async () => {
    setErro("");
    if (!clienteId||!nomeServico||!dataSelecionada||!horaSelecionada||!profSelecionado) { setErro("Preencha todos os campos."); return; }
    setSalvando(true);
    try {
      const ag = { id:Date.now().toString(), clienteId:clienteId.trim(), nomeServico:nomeServico.trim(), dataSelecionada, horaSelecionada, profissionalNome:profSelecionado, status:"Confirmado", dataCriacao:new Date().toISOString() };
      const raw = await AsyncStorage.getItem(CHAVE_STORAGE);
      let lista=[]; try{const p=JSON.parse(raw);if(Array.isArray(p))lista=p;}catch(_){}
      lista.push(ag);
      await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
      setSucesso(true); setSalvando(false);
      setTimeout(()=>router.replace("/"),1200);
    } catch { setSalvando(false); setErro("Erro ao salvar."); }
  };

  if (sucesso) return (
    <View style={[s.root,s.centro]}>
      <View style={s.sucessoIcone}><MaterialCommunityIcons name="check-bold" size={40} color={BG}/></View>
      <Text style={s.sucessoTitulo}>Agendamento salvo!</Text>
      <Text style={s.sucessoSub}>{dataSelecionada} às {horaSelecionada}</Text>
      <Text style={{ color:CYAN, fontWeight:"700", fontSize:13 }}>com {profSelecionado}</Text>
    </View>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={s.titulo}>BOOK AN APPOINTMENT</Text>

        {erro ? <View style={s.erroBox}><MaterialCommunityIcons name="alert-circle-outline" size={14} color={RED}/><Text style={s.erroTexto}> {erro}</Text></View> : null}

        {/* ID */}
        <Text style={s.label}>ID DO CLIENTE</Text>
        <View style={s.readOnly}><MaterialCommunityIcons name="account-circle" size={16} color={CYAN} style={{marginRight:8}}/><Text style={s.readOnlyTexto}>{clienteId||"..."}</Text><MaterialCommunityIcons name="lock" size={13} color={GREY}/></View>

        {/* Serviço */}
        <Text style={s.label}>NOME DO SERVIÇO</Text>
        <TextInput style={s.input} placeholder="Ex: Corte + Barba" placeholderTextColor={GREY} value={nomeServico} onChangeText={setNomeServico} returnKeyType="done" />

        {/* Profissional */}
        <Text style={s.label}>PROFISSIONAL</Text>
        <TouchableOpacity style={[s.seletor, profAberto&&{borderColor:CYAN}]} onPress={()=>{setProfAberto(o=>!o);setCalAberto(false);setHoraAberta(false);}} activeOpacity={0.8}>
          <MaterialCommunityIcons name="account-tie" size={18} color={profSelecionado?CYAN:GREY} style={{marginRight:8}}/>
          <Text style={profSelecionado?s.seletorTexto:s.seletorPlaceholder}>{profSelecionado||"Escolher profissional"}</Text>
          <MaterialCommunityIcons name={profAberto?"chevron-up":"chevron-down"} size={18} color={GREY}/>
        </TouchableOpacity>
        {profAberto && <SeletorProfissional profissionais={profissionais} profSelecionado={profSelecionado} onSelecionar={n=>{setProfSelecionado(n);setProfAberto(false);}} />}

        {/* Data */}
        <Text style={s.label}>DATA DO SERVIÇO</Text>
        <TouchableOpacity style={[s.seletor, calAberto&&{borderColor:CYAN}]} onPress={()=>{setCalAberto(o=>!o);setHoraAberta(false);setProfAberto(false);}} activeOpacity={0.8}>
          <MaterialCommunityIcons name="calendar-month" size={18} color={dataSelecionada?CYAN:GREY} style={{marginRight:8}}/>
          <Text style={dataSelecionada?s.seletorTexto:s.seletorPlaceholder}>{dataSelecionada||"Escolher data"}</Text>
          <MaterialCommunityIcons name={calAberto?"chevron-up":"chevron-down"} size={18} color={GREY}/>
        </TouchableOpacity>
        {calAberto && <Calendario dataSelecionada={dataSelecionada} onSelecionar={d=>{setDataSelecionada(d);setCalAberto(false);}} />}

        {/* Horário */}
        <Text style={s.label}>HORÁRIO</Text>
        <TouchableOpacity style={[s.seletor, horaAberta&&{borderColor:CYAN}]} onPress={()=>{setHoraAberta(o=>!o);setCalAberto(false);setProfAberto(false);}} activeOpacity={0.8}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={horaSelecionada?CYAN:GREY} style={{marginRight:8}}/>
          <Text style={horaSelecionada?s.seletorTexto:s.seletorPlaceholder}>{horaSelecionada||"Escolher horário"}</Text>
          <MaterialCommunityIcons name={horaAberta?"chevron-up":"chevron-down"} size={18} color={GREY}/>
        </TouchableOpacity>
        {horaAberta && <SeletorHora horaSelecionada={horaSelecionada} onSelecionar={h=>{setHoraSelecionada(h);setHoraAberta(false);}} />}

        {/* Botão */}
        <TouchableOpacity style={[s.botao, salvando&&s.botaoOff]} onPress={salvar} disabled={salvando} activeOpacity={0.85}>
          {salvando ? <ActivityIndicator size="small" color={BG}/> : <View style={s.botaoRow}><Text style={s.botaoTexto}>CONTINUE</Text><MaterialCommunityIcons name="arrow-right" size={18} color={BG} style={{marginLeft:8}}/></View>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const cal = StyleSheet.create({
  wrap: { backgroundColor:CARD2, borderRadius:14, padding:14, marginBottom:16, borderWidth:1, borderColor:BORDER },
  nav:  { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10 },
  navBtn: { padding:4 },
  mesAno: { fontSize:14, fontWeight:"800", color:WHITE },
  semRow: { flexDirection:"row", marginBottom:6 },
  semLabel:{ flex:1, textAlign:"center", fontSize:11, fontWeight:"700", color:GREY },
  grid: { flexDirection:"row", flexWrap:"wrap" },
  dia:  { width:`${100/7}%`, aspectRatio:1, alignItems:"center", justifyContent:"center", borderRadius:100, marginVertical:2 },
  diaTexto: { fontSize:13, fontWeight:"600", color:WHITE },
  result:   { flexDirection:"row", alignItems:"center", justifyContent:"center", marginTop:10, paddingTop:8, borderTopWidth:1, borderTopColor:BORDER },
  resultTexto: { fontSize:13, fontWeight:"700", color:CYAN },
  dica: { textAlign:"center", marginTop:8, paddingTop:8, fontSize:12, color:GREY, borderTopWidth:1, borderTopColor:BORDER },
});
const hor = StyleSheet.create({
  wrap: { backgroundColor:CARD2, borderRadius:14, padding:14, marginBottom:16, borderWidth:1, borderColor:BORDER },
  grid: { flexDirection:"row", flexWrap:"wrap", gap:6 },
  chip: { width:"22%", paddingVertical:9, alignItems:"center", borderRadius:8, backgroundColor:CARD, borderWidth:1, borderColor:BORDER },
  texto:{ fontSize:12, fontWeight:"700", color:WHITE },
  result:   { flexDirection:"row", alignItems:"center", justifyContent:"center", marginTop:10, paddingTop:8, borderTopWidth:1, borderTopColor:BORDER },
  resultTexto: { fontSize:13, fontWeight:"700", color:CYAN },
  dica: { textAlign:"center", marginTop:8, paddingTop:8, fontSize:12, color:GREY, borderTopWidth:1, borderTopColor:BORDER },
});
const prof = StyleSheet.create({
  wrap: { backgroundColor:CARD2, borderRadius:14, padding:14, marginBottom:16, borderWidth:1, borderColor:BORDER },
  grid: { flexDirection:"row", flexWrap:"wrap", gap:8 },
  card: { flexDirection:"row", alignItems:"center", gap:8, backgroundColor:CARD, borderRadius:10, paddingVertical:10, paddingHorizontal:12, borderWidth:1, borderColor:BORDER, minWidth:"45%" },
  circulo: { width:34, height:34, borderRadius:17, backgroundColor:CARD2, alignItems:"center", justifyContent:"center", borderWidth:1, borderColor:BORDER },
  iniciais:{ fontSize:12, fontWeight:"800", color:CYAN },
  nome:    { flex:1, fontSize:12, fontWeight:"700", color:WHITE },
  result:   { flexDirection:"row", alignItems:"center", justifyContent:"center", marginTop:10, paddingTop:8, borderTopWidth:1, borderTopColor:BORDER },
  resultTexto: { fontSize:13, fontWeight:"700", color:CYAN },
  dica: { textAlign:"center", marginTop:8, paddingTop:8, fontSize:12, color:GREY, borderTopWidth:1, borderTopColor:BORDER },
});
const s = StyleSheet.create({
  root:  { flex:1, backgroundColor:BG },
  scroll:{ paddingHorizontal:20, paddingTop:12, paddingBottom:48, gap:10 },
  centro:{ justifyContent:"center", alignItems:"center", gap:14, padding:32 },
  titulo:{ fontSize:18, fontWeight:"900", color:CYAN, letterSpacing:2, textAlign:"center", marginBottom:4 },
  erroBox:  { flexDirection:"row", alignItems:"center", backgroundColor:"rgba(229,57,53,0.12)", borderWidth:1, borderColor:RED, borderRadius:8, padding:10 },
  erroTexto:{ fontSize:12, color:RED, fontWeight:"600", flex:1 },
  label:    { fontSize:10, fontWeight:"800", color:CYAN, letterSpacing:1.5 },
  input:    { backgroundColor:CARD2, borderWidth:1, borderColor:BORDER, borderRadius:10, height:48, paddingHorizontal:14, fontSize:14, color:WHITE },
  readOnly: { flexDirection:"row", alignItems:"center", backgroundColor:CARD2, borderWidth:1, borderColor:BORDER, borderRadius:10, height:48, paddingHorizontal:14 },
  readOnlyTexto: { flex:1, fontSize:14, color:WHITE, fontWeight:"700" },
  seletor:  { flexDirection:"row", alignItems:"center", backgroundColor:CARD2, borderWidth:1, borderColor:BORDER, borderRadius:10, height:48, paddingHorizontal:14 },
  seletorTexto:{ flex:1, fontSize:14, color:WHITE, fontWeight:"600" },
  seletorPlaceholder:{ flex:1, fontSize:14, color:GREY },
  botao:    { backgroundColor:CYAN, borderRadius:10, height:52, justifyContent:"center", alignItems:"center", shadowColor:CYAN, shadowOpacity:0.4, shadowRadius:8, elevation:5, marginTop:8 },
  botaoOff: { backgroundColor:GREY, shadowOpacity:0, elevation:0 },
  botaoRow: { flexDirection:"row", alignItems:"center" },
  botaoTexto:{ color:BG, fontSize:15, fontWeight:"900", letterSpacing:1.5 },
  sucessoIcone:  { width:72, height:72, borderRadius:36, backgroundColor:CYAN, alignItems:"center", justifyContent:"center" },
  sucessoTitulo: { fontSize:22, fontWeight:"900", color:WHITE },
  sucessoSub:    { fontSize:15, fontWeight:"700", color:GREY },
});
