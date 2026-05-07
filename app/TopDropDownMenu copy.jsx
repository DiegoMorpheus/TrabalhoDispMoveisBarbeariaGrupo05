import { router } from "expo-router";
import { useState } from "react";
import { Appbar, Menu } from "react-native-paper";

export default function TopDropDownMenu() {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const navigate = (path) => {
    closeMenu();
    router.push(path);
  };

  return (
    <Appbar.Header>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon="menu" color="black" onPress={openMenu} />}
      >
        <Menu.Item
          onPress={() => navigate("/views/ClienteListView")}
          title="Clientes"
        />
      </Menu>
      <Appbar.Content title="Barbearia" />
    </Appbar.Header>
  );
}
