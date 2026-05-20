import { View, StyleSheet } from "react-native";
import TopClientesAppbar from "./TopDropDownMenu";
import BottomNav from "./BottonNav";
import { colors } from "../services/colors/colors";

export default function AppLayout({ children, title }) {
  return (
    <View style={styles.container}>

      {}
      <TopClientesAppbar title={title} />

      {}
      <View style={styles.content}>
        {children}
      </View>

      {}
      <BottomNav />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    paddingBottom: 90, // evita ficar atrás do BottomNav
  },
});
