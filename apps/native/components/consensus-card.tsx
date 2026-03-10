import { Ionicons } from "@expo/vector-icons";
import { Surface, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";

interface ConsensusCardProps {
  text: string;
}

export function ConsensusCard({ text }: ConsensusCardProps) {
  const primaryColor = useThemeColor("primary");

  return (
    <Surface variant="secondary" className="p-4 rounded-xl border border-primary/30">
      <View className="flex-row items-center gap-2 mb-3">
        <Ionicons name="sparkles" size={20} color={primaryColor} />
        <Text className="text-primary font-semibold text-base">
          Orientação Final
        </Text>
      </View>
      <Text className="text-foreground text-base leading-7">{text}</Text>
    </Surface>
  );
}
