import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Chip, Surface } from "heroui-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/themed-text";
import type { Id } from "@app-catolico/backend/convex/_generated/dataModel";

interface QuestionCardProps {
  id: Id<"questions">;
  text: string;
  status: "pending" | "answering" | "consensus_ready";
  answerCount: number;
  showStatus?: boolean;
}

const statusConfig = {
  pending: { label: "Aguardando", color: "warning" as const },
  answering: { label: "Em resposta", color: "primary" as const },
  consensus_ready: { label: "Respondida", color: "success" as const },
};

export function QuestionCard({
  id,
  text,
  status,
  answerCount,
  showStatus = true,
}: QuestionCardProps) {
  const router = useRouter();
  const config = statusConfig[status];

  return (
    <Pressable onPress={() => router.push(`/question/${id}`)}>
      <Surface variant="secondary" className="p-4 rounded-xl">
        <Text className="text-foreground text-base leading-6" numberOfLines={3}>
          {text}
        </Text>

        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="chatbubbles-outline" size={14} color="#888" />
            <Text className="text-muted text-xs">
              {answerCount} {answerCount === 1 ? "resposta" : "respostas"}
            </Text>
          </View>

          {showStatus && (
            <Chip variant="flat" color={config.color} size="sm">
              <Chip.Label>{config.label}</Chip.Label>
            </Chip>
          )}
        </View>
      </Surface>
    </Pressable>
  );
}
