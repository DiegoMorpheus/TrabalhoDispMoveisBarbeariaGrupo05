// app/components/BarberPoleLogo.js
// Logo do poste de barbearia (barber pole) desenhado em SVG
import { Svg, Rect, Ellipse, Path, Defs, ClipPath, G } from "react-native-svg";
import { View } from "react-native";

export default function BarberPoleLogo({ size = 80 }) {
  const w = size;
  const h = size * 1.5;
  const rx = w * 0.3;  // raio das bordas arredondadas

  return (
    <View style={{ width: w, height: h, alignItems: "center" }}>
      <Svg width={w} height={h} viewBox="0 0 60 90">
        <Defs>
          <ClipPath id="pole">
            <Rect x="15" y="8" width="30" height="74" rx="15" />
          </ClipPath>
        </Defs>

        {/* Fundo branco do poste */}
        <Rect x="15" y="8" width="30" height="74" rx="15" fill="#FFFFFF" />

        {/* Listras diagonais — clippadas no poste */}
        <G clipPath="url(#pole)">
          {/* Listras vermelhas */}
          <Path d="M5 0 L55 30 L55 45 L5 15Z"  fill="#E53935" />
          <Path d="M5 30 L55 60 L55 75 L5 45Z" fill="#E53935" />
          <Path d="M5 60 L55 90 L55 100 L5 75Z" fill="#E53935" />
          {/* Listras azuis entre as vermelhas */}
          <Path d="M5 15 L55 45 L55 52 L5 22Z"  fill="#1565C0" />
          <Path d="M5 45 L55 75 L55 82 L5 52Z"  fill="#1565C0" />
          {/* Fundo branco entre listras */}
          <Rect x="0" y="0" width="60" height="100" fill="none" />
        </G>

        {/* Tampa superior — metálica */}
        <Ellipse cx="30" cy="10" rx="15" ry="6" fill="#424242" />
        <Ellipse cx="30" cy="8"  rx="15" ry="5" fill="#616161" />

        {/* Tampa inferior */}
        <Ellipse cx="30" cy="80" rx="15" ry="6" fill="#424242" />
        <Ellipse cx="30" cy="78" rx="15" ry="5" fill="#616161" />

        {/* Brilho lateral */}
        <Path d="M20 12 Q16 45 20 78" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}
