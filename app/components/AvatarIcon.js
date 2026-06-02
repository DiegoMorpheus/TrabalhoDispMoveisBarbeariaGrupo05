// app/components/AvatarIcon.js
// Avatar simples baseado no gênero escolhido pelo usuário.
// genero: "M" → ícone homem | "F" → ícone mulher | null → ícone neutro
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export default function AvatarIcon({
  genero = null,
  size = 46,
  bgColor = "#888",
  iconColor = "#FFF",
}) {
  const icone =
    genero === "F" ? "face-woman" :
    genero === "M" ? "face-man"   :
    "account-circle";

  const iconSize = size * 0.65;

  return (
    <View
      style={[
        s.circulo,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <MaterialCommunityIcons name={icone} size={iconSize} color={iconColor} />
    </View>
  );
}

const s = StyleSheet.create({
  circulo: { alignItems: "center", justifyContent: "center" },
});
