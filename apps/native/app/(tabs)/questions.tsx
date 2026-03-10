import { api } from "@app-catolico/backend/convex/_generated/api";
import type { Id } from "@app-catolico/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { Spinner, Surface } from "heroui-native";
import { FlatList, Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";
import { EmptyState } from "@/components/empty-state";
import { QuestionCard } from "@/components/question-card";
import { useUserRole } from "@/hooks/use-user-role";

function UserQuestionsScreen() {
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
            description='Vá até "Escrever" para compartilhar o que está aflindo você.'
          />
        }
      />
    </Container>
  );
}

function DirectorAnswerItem({
  questionId,
  answerText,
}: {
  questionId: Id<"questions">;
  answerText: string;
}) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/question/${questionId}`)}>
      <Surface variant="secondary" className="p-4 rounded-xl">
        <Text className="text-foreground text-base leading-6" numberOfLines={3}>
          {answerText}
        </Text>
        <Text className="text-muted text-xs mt-2">Toque para ver a pergunta</Text>
      </Surface>
    </Pressable>
  );
}

function DirectorAnsweredScreen() {
  const myAnswers = useQuery(api.answers.getMyAnswers);

  if (myAnswers === undefined) {
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
          Respondidas
        </Text>
        <Text className="text-muted text-sm mt-2">
          Perguntas que você já ofereceu orientação.
        </Text>
      </View>

      <FlatList
        data={myAnswers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <DirectorAnswerItem
            questionId={item.questionId}
            answerText={item.text}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="Nenhuma resposta ainda"
            description="Vá até Perguntas para oferecer orientação espiritual."
          />
        }
      />
    </Container>
  );
}

export default function QuestionsScreen() {
  const role = useUserRole();
  const isDirector = role === "director" || role === "admin";

  return isDirector ? <DirectorAnsweredScreen /> : <UserQuestionsScreen />;
}
