import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/themed-text";

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Pressable
        onPress={onBack ?? (() => router.back())}
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        hitSlop={12}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
      >
        <Ionicons name="chevron-back" size={28} color="#1a1a1a" />
      </Pressable>
      <Text
        style={{
          flex: 1,
          fontSize: 18,
          fontWeight: "700",
          color: "#1a1a1a",
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}
