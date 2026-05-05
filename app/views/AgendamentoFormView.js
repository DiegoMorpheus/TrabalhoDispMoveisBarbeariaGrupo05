import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../services/colors/colors';

export default function AgendamentoFormView() {
  const [clienteId, setClienteId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [dataHora, setDataHora] = useState('');

  const salvar = () => {
    const novoAgendamento = {
      clienteId,
      servicoId,
      dataHoraInicio: dataHora,
      status: 'pendente'
    };

    console.log('Agendamento criado:', novoAgendamento);

    router.push('/views/AgendamentoListView');
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Novo Agendamento</Text>

      <TextInput
        placeholder="ID Cliente"
        value={clienteId}
        onChangeText={setClienteId}
        style={styles.input}
      />

      <TextInput
        placeholder="ID Serviço"
        value={servicoId}
        onChangeText={setServicoId}
        style={styles.input}
      />

      <TextInput
        placeholder="Data e Hora (ex: 2026-01-25 14:00)"
        value={dataHora}
        onChangeText={setDataHora}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={salvar}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: colors.primary,
  },

  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },

  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: colors.background,
    fontWeight: '700',
  },
});