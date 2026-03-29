import { api } from "@app-catolico/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Spinner } from "heroui-native";
import { FlatList, Text, View } from "react-native";

import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { QuestionCard } from "@/components/question-card";

export default function QuestionsScreen() {
  const questions = useQuery(api.questions.getMyQuestions);

  if (questions === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <Container isScrollable={false} className="px-4 pb-4">
      <View className="py-6">
        <Text className="text-3xl font-bold text-foreground tracking-tight">
          Minhas Perguntas
        </Text>
        <Text className="text-muted text-sm mt-2">
          Acompanhe o status das suas perguntas e veja as orientações recebidas.
        </Text>
      </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <QuestionCard
            id={item._id}
            text={item.normalizedText}
            status={item.status}
            answerCount={item.answerCount}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <EmptyState
            icon="create-outline"
            title="Nenhuma pergunta ainda"
            description='Vá até "Escrever" para compartilhar o que está aflingindo você.'
          />
        }
      />
    </Container>
  );
}
