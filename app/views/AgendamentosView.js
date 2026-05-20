// app/views/AgendamentosView.js
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // CORRIGIDO: AsyncStorage funciona no PC e em dispositivos
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- CONFIGURAÇÃO DA PALETA DE CORES (Vermelho e Branco) ---
const PALETA = {
  vermelho: "#A30000",
  branco: "#FFFFFF",
  preto: "#000000",
  cinzaClaro: "#F5F5F5",
  cinzaMedio: "#CCC",
  cinzaEscuro: "#555",
  verde: "#28A745",
};

// Mesma chave usada no AgendamentoFormView.js
const CHAVE_STORAGE = "agendamentos_barbearia";

const AgendamentosView = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarAgendamentosLocais = useCallback(async () => {
    setCarregando(true);
    try {
      const dadosSalvos = await AsyncStorage.getItem(CHAVE_STORAGE);

      if (dadosSalvos !== null) {
        try {
          const lista = JSON.parse(dadosSalvos);
          if (Array.isArray(lista)) {
            // Ordena por ID decrescente (mais novos primeiro)
            setAgendamentos(lista.sort((a, b) => Number(b.id) - Number(a.id)));
          } else {
            setAgendamentos([]);
          }
        } catch (e) {
          console.error("Erro ao fazer parse dos dados salvos:", e);
          setAgendamentos([]);
        }
      } else {
        setAgendamentos([]); // Nenhum agendamento salvo ainda
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      Alert.alert("Erro", "Não foi possível carregar seus agendamentos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega a lista sempre que esta tela ganha foco
  useFocusEffect(
    useCallback(() => {
      carregarAgendamentosLocais();
    }, [carregarAgendamentosLocais])
  );

  const deletarAgendamentoLocal = (id) => {
    Alert.alert(
      "Deletar Agendamento",
      "Tem certeza que deseja remover este agendamento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              const listaAtualizada = agendamentos.filter(
                (item) => item.id !== id
              );
              await AsyncStorage.setItem(
                CHAVE_STORAGE,
                JSON.stringify(listaAtualizada)
              );
              setAgendamentos(listaAtualizada);
              Alert.alert("Sucesso", "Agendamento removido.");
            } catch (error) {
              console.error("Erro ao deletar agendamento:", error);
              Alert.alert("Erro", "Não foi possível remover o agendamento.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceInfo}>
          <Ionicons
            name="cut-outline"
            size={22}
            color={PALETA.vermelho}
            style={styles.serviceIcon}
          />
          <Text style={styles.serviceTitle}>{item.servico}</Text>
        </View>
        <TouchableOpacity
          onPress={() => deletarAgendamentoLocal(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color={PALETA.cinzaMedio} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons
            name="person-outline"
            size={18}
            color={PALETA.cinzaEscuro}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>{item.nome}</Text>
        </View>
        <View style={styles.dateTimeRow}>
          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={PALETA.cinzaEscuro}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>{item.data}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={18}
              color={PALETA.cinzaEscuro}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>{item.hora}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.statusBadge}>
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={PALETA.branco}
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{item.status || "Confirmado"}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seus Agendamentos</Text>
      </View>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PALETA.vermelho} />
          <Text style={styles.loadingText}>Carregando agendamentos...</Text>
        </View>
      ) : agendamentos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="calendar-outline"
            size={80}
            color={PALETA.cinzaMedio}
          />
          <Text style={styles.emptyText}>
            Você ainda não tem agendamentos salvos.
          </Text>
          <Text style={styles.emptySubtext}>
            Vá para a aba "Agendar" para criar um novo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={agendamentos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETA.branco },
  header: {
    height: 70,
    backgroundColor: PALETA.vermelho,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingTop: 10,
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: PALETA.branco },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PALETA.branco,
  },
  loadingText: { marginTop: 15, fontSize: 16, color: PALETA.cinzaEscuro },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: PALETA.branco,
  },
  emptyText: {
    marginTop: 25,
    fontSize: 18,
    fontWeight: "bold",
    color: PALETA.preto,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 10,
    fontSize: 14,
    color: PALETA.cinzaEscuro,
    textAlign: "center",
  },
  listContent: { padding: 15, paddingBottom: 30 },
  card: {
    backgroundColor: PALETA.branco,
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 10,
  },
  serviceInfo: { flexDirection: "row", alignItems: "center" },
  serviceIcon: { marginRight: 10 },
  serviceTitle: { fontSize: 18, fontWeight: "bold", color: PALETA.preto },
  deleteButton: { padding: 5 },
  cardBody: { marginBottom: 15 },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  infoIcon: { marginRight: 8 },
  infoText: { fontSize: 15, color: PALETA.preto },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PALETA.verde,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusIcon: { marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "bold", color: PALETA.branco },
});

export default AgendamentosView;
