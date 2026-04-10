import { Ionicons } from "@expo/vector-icons";
import { Surface } from "heroui-native";
import { View } from "react-native";
import { Text } from "@/components/ui/themed-text";

interface AnswerCardProps {
  directorName: string;
  text: string;
}

export function AnswerCard({ directorName, text }: AnswerCardProps) {
  return (
    <Surface variant="secondary" className="p-4 rounded-xl">
      <View className="flex-row items-center gap-2 mb-2">
        <Ionicons name="person-circle-outline" size={20} color="#888" />
        <Text className="text-muted text-sm font-medium">{directorName}</Text>
      </View>
      <Text className="text-foreground text-base leading-6">{text}</Text>
    </Surface>
  );
}
