import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { View } from "react-native";
import { Text } from "@/components/ui/themed-text";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({
  icon = "document-text-outline",
  title,
  description,
}: EmptyStateProps) {
  const mutedColor = useThemeColor("foreground");

  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <Ionicons
        name={icon}
        size={48}
        color={mutedColor}
        style={{ opacity: 0.4 }}
      />
      <Text className="text-foreground font-semibold text-lg mt-4 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-muted text-sm mt-2 text-center">
          {description}
        </Text>
      )}
    </View>
  );
}
