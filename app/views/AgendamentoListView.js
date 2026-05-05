import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../services/colors/colors';

export default function AgendamentoListView() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendamentos</Text>

      <Text style={styles.text}>
        Nenhum agendamento ainda.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },

  text: {
    marginTop: 20,
    color: colors.dark,
  },
});