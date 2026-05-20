import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../services/colors/colors';

export default function BottomNav() {
  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.item}>🏠</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/views/AgendamentoListView')}>
        <Text style={styles.item}>📅</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/views/ContatoListView')}>
        <Text style={styles.item}>👥</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    backgroundColor: colors.primary,
    paddingVertical: 14,

    borderRadius: 20,

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  item: {
    fontSize: 22,
    color: colors.background,
  },
});
