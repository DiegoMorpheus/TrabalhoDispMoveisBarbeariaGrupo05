// app/views/AgendamentoFormView.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

const RED   = "#8B1A1A";
const CREAM = "#F5EDE2";
const WHITE = "#FFFFFF";
const DARK  = "#1C0A0A";
const GREY  = "#9A7A7A";
const GREEN = "#2E7D32";
const BG    = "#FAFAF8";

const CHAVE_STORAGE = "agendamentos_barbearia";
const CHAVE_SESSAO  = "sessao_barbearia";

const PROFISSIONAIS = [
  { nome: "Diego",     initials: "DG" },
  { nome: "Eduarda",   initials: "ED" },
  { nome: "Guilherme", initials: "GH" },
];

// ── Horários 08:00 → 20:00, de 30 em 30 min ──────────────────────────────────
const HORARIOS = (() => {
  const slots = [];
  for (let h = 8; h <= 20; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 20) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
})();

// ── Calendário ────────────────────────────────────────────────────────────────
const MESES    = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEM = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
function pad(n) { return String(n).padStart(2, "0"); }
function gerarDias(ano, mes) {
  const p = new Date(ano, mes, 1).getDay();
  const t = new Date(ano, mes + 1, 0).getDate();
  const d = [];
  for (let i = 0; i < p; i++) d.push(null);
  for (let x = 1; x <= t; x++) d.push(x);
  return d;
}

function Calendario({ dataSelecionada, onSelecionar }) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const dias = gerarDias(ano, mes);
  const ant = () => { if (mes===0){setMes(11);setAno(a=>a-1);}else setMes(m=>m-1); };
  const prox= () => { if (mes===11){setMes(0);setAno(a=>a+1);}else setMes(m=>m+1); };
  const sel = (dia) => { if(dia) onSelecionar(`${pad(dia)}/${pad(mes+1)}/${ano}`); };
  const ehSel  = (dia) => dia && dataSelecionada===`${pad(dia)}/${pad(mes+1)}/${ano}`;
  const ehHoje = (dia) => dia===hoje.getDate()&&mes===hoje.getMonth()&&ano===hoje.getFullYear();
  return (
    <View style={cal.container}>
      <View style={cal.navRow}>
        <TouchableOpacity onPress={ant} style={cal.navBtn}><MaterialCommunityIcons name="chevron-left" size={24} color={RED}/></TouchableOpacity>
        <Text style={cal.mesAno}>{MESES[mes]} {ano}</Text>
        <TouchableOpacity onPress={prox} style={cal.navBtn}><MaterialCommunityIcons name="chevron-right" size={24} color={RED}/></TouchableOpacity>
      </View>
      <View style={cal.semanaRow}>{DIAS_SEM.map(d=><Text key={d} style={cal.semanaLabel}>{d}</Text>)}</View>
      <View style={cal.grid}>
        {dias.map((dia,idx)=>{
          const s=ehSel(dia), t=ehHoje(dia);
          return (
            <TouchableOpacity key={idx} style={[cal.diaBtn,s&&cal.diaSel,t&&!s&&cal.diaHoje]} onPress={()=>sel(dia)} activeOpacity={dia?0.75:1} disabled={!dia}>
              {dia?<Text style={[cal.diaTexto,s&&cal.diaTextoSel]}>{dia}</Text>:null}
            </TouchableOpacity>
          );
        })}
      </View>
      {dataSelecionada
        ? <View style={cal.resultRow}><MaterialCommunityIcons name="calendar-check" size={15} color={RED}/><Text style={cal.resultTexto}>  {dataSelecionada}</Text></View>
        : <Text style={cal.dica}>Toque em um dia para selecionar</Text>}
    </View>
  );
}

function SeletorHora({ horaSelecionada, onSelecionar }) {
  return (
    <View style={hor.container}>
      <View style={hor.grid}>
        {HORARIOS.map(h=>{
          const sel=horaSelecionada===h;
          return <TouchableOpacity key={h} style={[hor.chip,sel&&hor.chipSel]} onPress={()=>onSelecionar(h)} activeOpacity={0.75}><Text style={[hor.chipTexto,sel&&hor.chipTextoSel]}>{h}</Text></TouchableOpacity>;
        })}
      </View>
      {horaSelecionada
        ? <View style={hor.resultRow}><MaterialCommunityIcons name="clock-check-outline" size={15} color={RED}/><Text style={hor.resultTexto}>  {horaSelecionada} selecionado</Text></View>
        : <Text style={hor.dica}>Toque em um horário para selecionar</Text>}
    </View>
  );
}

// ── Seletor de Profissional ───────────────────────────────────────────────────
function SeletorProfissional({ profSelecionado, onSelecionar }) {
  return (
    <View style={prof.container}>
      <View style={prof.grid}>
        {PROFISSIONAIS.map(p => {
          const sel = profSelecionado === p.nome;
          return (
            <TouchableOpacity
              key={p.nome}
              style={[prof.card, sel && prof.cardSel]}
              onPress={() => onSelecionar(p.nome)}
              activeOpacity={0.8}
            >
              <View style={[prof.circulo, sel && prof.circuloSel]}>
                <Text style={prof.iniciais}>{p.initials}</Text>
              </View>
              <Text style={[prof.nome, sel && prof.nomeSel]}>{p.nome}</Text>
              {sel && <MaterialCommunityIcons name="check-circle" size={18} color={WHITE} />}
            </TouchableOpacity>
          );
        })}
      </View>
      {profSelecionado
        ? <View style={prof.resultRow}><MaterialCommunityIcons name="account-check" size={15} color={RED}/><Text style={prof.resultTexto}>  {profSelecionado} selecionado</Text></View>
        : <Text style={prof.dica}>Toque em um profissional para selecionar</Text>}
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────
export default function AgendamentoFormView() {
  
  const params = useLocalSearchParams();

  const [clienteId,       setClienteId]      = useState("");
  const [nomeServico,     setNomeServico]     = useState("");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [profSelecionado, setProfSelecionado] = useState(params?.profissionalNome || "");
  const [calAberto,       setCalAberto]       = useState(false);
  const [horaAberta,      setHoraAberta]      = useState(false);
  const [profAberto,      setProfAberto]      = useState(false);
  const [salvando,        setSalvando]        = useState(false);
  const [erro,            setErro]            = useState("");
  const [sucesso,         setSucesso]         = useState(false);

  // Pré-preenche o clienteId com o ID da sessão
  useEffect(() => {
    const carregarSessao = async () => {
      const raw = await AsyncStorage.getItem(CHAVE_SESSAO);
      if (raw) {
        const s = JSON.parse(raw);
        setClienteId(s.id || "");
      }
    };
    carregarSessao();
  }, []);

  const salvar = async () => {
    setErro("");
    if (!clienteId.trim() || !nomeServico.trim() || !dataSelecionada || !horaSelecionada || !profSelecionado) {
      setErro("Preencha todos os campos antes de salvar.");
      return;
    }
    setSalvando(true);
    try {
      const novoAgendamento = {
        id:              Date.now().toString(),
        clienteId:       clienteId.trim(),
        nomeServico:     nomeServico.trim(),
        dataSelecionada,
        horaSelecionada,
        profissionalNome: profSelecionado,
        status:          "Confirmado",
        dataCriacao:     new Date().toISOString(),
      };
      const dadosSalvos = await AsyncStorage.getItem(CHAVE_STORAGE);
      let lista = [];
      if (dadosSalvos) {
        try { const p=JSON.parse(dadosSalvos); if(Array.isArray(p)) lista=p; } catch(_) {}
      }
      lista.push(novoAgendamento);
      await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
      setSucesso(true);
      setSalvando(false);
      setTimeout(() => router.replace("/"), 1200);
    } catch (err) {
      setSalvando(false);
      setErro("Não foi possível salvar. Tente novamente.");
    }
  };

  if (sucesso) {
    return (
      <View style={s.root}>
        <View style={s.sucessoTela}>
          <View style={s.sucessoIcone}><MaterialCommunityIcons name="check-bold" size={48} color={WHITE}/></View>
          <Text style={s.sucessoTitulo}>Agendamento salvo!</Text>
          <Text style={s.sucessoSub}>{dataSelecionada} às {horaSelecionada}</Text>
          <Text style={s.sucessoProf}>com {profSelecionado}</Text>
          <Text style={s.sucessoSub2}>Voltando para a tela inicial…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <View style={s.cardTopBar} />
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>NOVO AGENDAMENTO</Text>

            {erro ? (
              <View style={s.erroBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={RED}/>
                <Text style={s.erroTexto}> {erro}</Text>
              </View>
            ) : null}

            {/* ID Cliente (pré-preenchido e bloqueado) */}
            <Text style={s.label}>ID DO CLIENTE</Text>
            <View style={s.inputReadOnly}>
              <MaterialCommunityIcons name="account-circle" size={18} color={RED} style={{marginRight:8}}/>
              <Text style={s.inputReadOnlyTexto}>{clienteId || "Carregando…"}</Text>
              <MaterialCommunityIcons name="lock" size={14} color={GREY}/>
            </View>

            {/* Nome Serviço */}
            <Text style={s.label}>NOME DO SERVIÇO</Text>
            <TextInput style={s.input} placeholder="Ex: Corte + Barba" placeholderTextColor={GREY} value={nomeServico} onChangeText={setNomeServico} returnKeyType="done"/>

            {/* Profissional */}
            <Text style={s.label}>PROFISSIONAL</Text>
            <TouchableOpacity style={[s.input, s.seletorBtn]} onPress={()=>{setProfAberto(o=>!o);setCalAberto(false);setHoraAberta(false);}} activeOpacity={0.8}>
              <MaterialCommunityIcons name="account-tie" size={20} color={profSelecionado?RED:GREY} style={{marginRight:10}}/>
              <Text style={profSelecionado?s.seletorTexto:s.seletorPlaceholder}>{profSelecionado||"Toque para escolher o profissional"}</Text>
              <MaterialCommunityIcons name={profAberto?"chevron-up":"chevron-down"} size={20} color={GREY}/>
            </TouchableOpacity>
            {profAberto && <SeletorProfissional profSelecionado={profSelecionado} onSelecionar={(n)=>{setProfSelecionado(n);setProfAberto(false);}}/>}

            {/* Dia */}
            <Text style={s.label}>DIA DO SERVIÇO</Text>
            <TouchableOpacity style={[s.input, s.seletorBtn]} onPress={()=>{setCalAberto(o=>!o);setHoraAberta(false);setProfAberto(false);}} activeOpacity={0.8}>
              <MaterialCommunityIcons name="calendar-month" size={20} color={dataSelecionada?RED:GREY} style={{marginRight:10}}/>
              <Text style={dataSelecionada?s.seletorTexto:s.seletorPlaceholder}>{dataSelecionada||"Toque para escolher a data"}</Text>
              <MaterialCommunityIcons name={calAberto?"chevron-up":"chevron-down"} size={20} color={GREY}/>
            </TouchableOpacity>
            {calAberto && <Calendario dataSelecionada={dataSelecionada} onSelecionar={(d)=>{setDataSelecionada(d);setCalAberto(false);}}/>}

            {/* Horário */}
            <Text style={s.label}>HORÁRIO</Text>
            <TouchableOpacity style={[s.input, s.seletorBtn]} onPress={()=>{setHoraAberta(o=>!o);setCalAberto(false);setProfAberto(false);}} activeOpacity={0.8}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={horaSelecionada?RED:GREY} style={{marginRight:10}}/>
              <Text style={horaSelecionada?s.seletorTexto:s.seletorPlaceholder}>{horaSelecionada||"Toque para escolher o horário"}</Text>
              <MaterialCommunityIcons name={horaAberta?"chevron-up":"chevron-down"} size={20} color={GREY}/>
            </TouchableOpacity>
            {horaAberta && <SeletorHora horaSelecionada={horaSelecionada} onSelecionar={(h)=>{setHoraSelecionada(h);setHoraAberta(false);}}/>}

            {/* Botão */}
            <TouchableOpacity style={[s.botao,salvando&&s.botaoDesativado]} onPress={salvar} disabled={salvando} activeOpacity={0.85}>
              {salvando ? <ActivityIndicator size="small" color={WHITE}/> : (
                <View style={s.botaoConteudo}>
                  <Text style={s.botaoTexto}>SALVAR AGENDAMENTO</Text>
                  <MaterialCommunityIcons name="content-save" size={20} color={WHITE} style={{marginLeft:10}}/>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Resumo */}
        {(nomeServico||dataSelecionada||horaSelecionada||profSelecionado) ? (
          <View style={s.resumo}>
            {nomeServico ? <View style={s.resumoLinha}><MaterialCommunityIcons name="content-cut" size={16} color={RED}/><Text style={s.resumoLabel}> SERVIÇO: </Text><Text style={s.resumoValor}>{nomeServico.toUpperCase()}</Text></View> : null}
            {profSelecionado ? <View style={s.resumoLinha}><MaterialCommunityIcons name="account-tie" size={16} color={RED}/><Text style={s.resumoLabel}> PROFISSIONAL: </Text><Text style={s.resumoValor}>{profSelecionado.toUpperCase()}</Text></View> : null}
            {dataSelecionada&&horaSelecionada ? <View style={[s.resumoLinha,{borderBottomWidth:0}]}><MaterialCommunityIcons name="calendar-clock" size={16} color={RED}/><Text style={s.resumoLabel}> DATA/HORA: </Text><Text style={s.resumoValor}>{dataSelecionada} às {horaSelecionada}</Text></View> : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ── Estilos Calendário ────────────────────────────────────────────────────────
const cal = StyleSheet.create({
  container: {backgroundColor:CREAM,borderRadius:14,padding:16,marginTop:4,marginBottom:18},
  navRow:    {flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:12},
  navBtn:    {padding:6,borderRadius:20,backgroundColor:WHITE},
  mesAno:    {fontSize:15,fontWeight:"800",color:DARK,letterSpacing:0.5},
  semanaRow: {flexDirection:"row",marginBottom:6},
  semanaLabel:{flex:1,textAlign:"center",fontSize:11,fontWeight:"700",color:RED},
  grid:      {flexDirection:"row",flexWrap:"wrap"},
  diaBtn:    {width:`${100/7}%`,aspectRatio:1,alignItems:"center",justifyContent:"center",borderRadius:100,marginVertical:2},
  diaHoje:   {borderWidth:1.5,borderColor:RED},
  diaSel:    {backgroundColor:RED},
  diaTexto:  {fontSize:13,fontWeight:"600",color:DARK},
  diaTextoSel:{color:WHITE,fontWeight:"800"},
  resultRow: {flexDirection:"row",alignItems:"center",justifyContent:"center",marginTop:10,paddingTop:10,borderTopWidth:1,borderTopColor:"#E8D8D8"},
  resultTexto:{fontSize:14,fontWeight:"700",color:RED},
  dica:      {textAlign:"center",marginTop:10,paddingTop:10,fontSize:12,color:GREY,borderTopWidth:1,borderTopColor:"#E8D8D8"},
});

// ── Estilos Horário ───────────────────────────────────────────────────────────
const hor = StyleSheet.create({
  container:  {backgroundColor:CREAM,borderRadius:14,padding:16,marginTop:4,marginBottom:18},
  grid:       {flexDirection:"row",flexWrap:"wrap",gap:8},
  chip:       {width:"22%",paddingVertical:10,alignItems:"center",justifyContent:"center",borderRadius:8,backgroundColor:WHITE,borderWidth:1.5,borderColor:"#DDD"},
  chipSel:    {backgroundColor:RED,borderColor:RED},
  chipTexto:  {fontSize:13,fontWeight:"700",color:DARK},
  chipTextoSel:{color:WHITE},
  resultRow:  {flexDirection:"row",alignItems:"center",justifyContent:"center",marginTop:12,paddingTop:10,borderTopWidth:1,borderTopColor:"#E8D8D8"},
  resultTexto:{fontSize:14,fontWeight:"700",color:RED},
  dica:       {textAlign:"center",marginTop:12,paddingTop:10,fontSize:12,color:GREY,borderTopWidth:1,borderTopColor:"#E8D8D8"},
});

// ── Estilos Profissional ──────────────────────────────────────────────────────
const prof = StyleSheet.create({
  container:  {backgroundColor:CREAM,borderRadius:14,padding:16,marginTop:4,marginBottom:18},
  grid:       {flexDirection:"row",gap:8},
  card:       {flex:1,alignItems:"center",backgroundColor:WHITE,borderRadius:12,paddingVertical:14,gap:6,borderWidth:1.5,borderColor:"#DDD"},
  cardSel:    {backgroundColor:RED,borderColor:RED},
  circulo:    {width:44,height:44,borderRadius:22,backgroundColor:CREAM,alignItems:"center",justifyContent:"center"},
  circuloSel: {backgroundColor:"rgba(255,255,255,0.2)"},
  iniciais:   {fontSize:15,fontWeight:"800",color:RED},
  nome:       {fontSize:12,fontWeight:"700",color:DARK},
  nomeSel:    {color:WHITE},
  resultRow:  {flexDirection:"row",alignItems:"center",justifyContent:"center",marginTop:10,paddingTop:10,borderTopWidth:1,borderTopColor:"#E8D8D8"},
  resultTexto:{fontSize:14,fontWeight:"700",color:RED},
  dica:       {textAlign:"center",marginTop:10,paddingTop:10,fontSize:12,color:GREY,borderTopWidth:1,borderTopColor:"#E8D8D8"},
});

// ── Estilos gerais ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   {flex:1,backgroundColor:BG},
  scroll: {paddingHorizontal:20,paddingTop:16,paddingBottom:48},
  sucessoTela:  {flex:1,justifyContent:"center",alignItems:"center",gap:14,padding:32},
  sucessoIcone: {width:90,height:90,borderRadius:45,backgroundColor:GREEN,justifyContent:"center",alignItems:"center",marginBottom:8},
  sucessoTitulo:{fontSize:24,fontWeight:"900",color:DARK,letterSpacing:1},
  sucessoSub:   {fontSize:16,fontWeight:"700",color:RED},
  sucessoProf:  {fontSize:14,fontWeight:"600",color:DARK},
  sucessoSub2:  {fontSize:13,color:GREY,marginTop:4},
  card:        {backgroundColor:WHITE,borderRadius:16,overflow:"hidden",shadowColor:"#000",shadowOffset:{width:0,height:3},shadowOpacity:0.1,shadowRadius:8,elevation:4,marginBottom:16},
  cardTopBar:  {height:6,backgroundColor:RED},
  cardBody:    {padding:24},
  cardTitle:   {fontSize:20,fontWeight:"900",color:DARK,textAlign:"center",letterSpacing:1.5,marginBottom:24},
  erroBox:     {flexDirection:"row",alignItems:"center",backgroundColor:"#FFF0F0",borderWidth:1,borderColor:"#FFCCCC",borderRadius:8,padding:10,marginBottom:16},
  erroTexto:   {fontSize:13,color:RED,fontWeight:"600",flex:1},
  label:       {fontSize:11,fontWeight:"800",color:RED,letterSpacing:1,marginBottom:6},
  inputReadOnly:{flexDirection:"row",alignItems:"center",borderWidth:1.5,borderColor:"#DDD",borderRadius:8,height:48,paddingHorizontal:14,backgroundColor:"#F5F5F5",marginBottom:18},
  inputReadOnlyTexto:{flex:1,fontSize:15,color:DARK,fontWeight:"700"},
  input:       {borderWidth:1.5,borderColor:"#DDD",borderRadius:8,height:48,paddingHorizontal:14,fontSize:15,color:DARK,backgroundColor:WHITE,marginBottom:18},
  seletorBtn:  {flexDirection:"row",alignItems:"center"},
  seletorTexto:{flex:1,fontSize:15,color:DARK,fontWeight:"600"},
  seletorPlaceholder:{flex:1,fontSize:15,color:GREY},
  botao:       {backgroundColor:RED,borderRadius:8,height:52,justifyContent:"center",alignItems:"center",marginTop:8,shadowColor:RED,shadowOffset:{width:0,height:4},shadowOpacity:0.35,shadowRadius:8,elevation:5},
  botaoDesativado:{backgroundColor:GREY,shadowOpacity:0,elevation:0},
  botaoConteudo:{flexDirection:"row",alignItems:"center"},
  botaoTexto:  {color:WHITE,fontSize:15,fontWeight:"900",letterSpacing:1.2},
  resumo:      {backgroundColor:WHITE,borderRadius:14,paddingHorizontal:18,paddingVertical:6,shadowColor:"#000",shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:6,elevation:2},
  resumoLinha: {flexDirection:"row",alignItems:"center",paddingVertical:10,borderBottomWidth:1,borderBottomColor:"#F0F0F0"},
  resumoLabel: {fontSize:12,fontWeight:"800",color:RED,letterSpacing:0.8},
  resumoValor: {fontSize:13,fontWeight:"600",color:DARK,flex:1},
});
