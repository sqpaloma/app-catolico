import { api } from "@app-catolico/backend/convex/_generated/api";
import type { Id } from "@app-catolico/backend/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { Button, Chip, Separator, Spinner, Surface } from "heroui-native";
import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

import { AnswerCard } from "@/components/answer-card";
import { ConsensusCard } from "@/components/consensus-card";
import { Container } from "@/components/container";
import { useUserRole } from "@/hooks/use-user-role";

const statusConfig = {
  pending: { label: "Aguardando diretores", color: "warning" as const },
  answering: { label: "Em resposta", color: "primary" as const },
  consensus_ready: {
    label: "Orientação disponível",
    color: "success" as const,
  },
};

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const role = useUserRole();
  const isDirector = role === "director" || role === "admin";

  const question = useQuery(api.questions.getById, {
    questionId: id as Id<"questions">,
  });
  const answers = useQuery(api.answers.getByQuestion, {
    questionId: id as Id<"questions">,
  });

  if (question === undefined || answers === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Spinner size="lg" />
      </View>
    );
  }

  if (question === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4">
        <Text className="text-foreground text-lg">
          Pergunta não encontrada
        </Text>
      </View>
    );
  }

  const config = statusConfig[question.status];

  return (
    <Container className="px-4 pb-4 bg-background">
      <View className="py-4">
        <Chip variant="flat" color={config.color} size="sm">
          <Chip.Label>{config.label}</Chip.Label>
        </Chip>
      </View>

      <Surface variant="secondary" className="p-4 rounded-xl">
        <Text className="text-foreground text-base leading-7">
          {question.normalizedText}
        </Text>
      </Surface>

      {question.consensusResponse && (
        <View className="mt-4">
          <ConsensusCard text={question.consensusResponse} />
        </View>
      )}

      {answers.length > 0 && (
        <View className="mt-6">
          <Text className="text-foreground font-semibold text-lg mb-3">
            Respostas dos Diretores ({answers.length})
          </Text>
          <View className="gap-3">
            {answers.map((answer) => (
              <AnswerCard
                key={answer._id}
                directorName={answer.directorName}
                text={answer.text}
              />
            ))}
          </View>
        </View>
      )}

      {answers.length === 0 && !isDirector && (
        <View className="mt-6 items-center py-8">
          <Text className="text-muted text-sm text-center">
            Ainda não há respostas. Os diretores espirituais serão notificados.
          </Text>
        </View>
      )}

      {isDirector && (
        <DirectorAnswerForm
          questionId={id as Id<"questions">}
          answers={answers}
        />
      )}
    </Container>
  );
}

function DirectorAnswerForm({
  questionId,
  answers,
}: {
  questionId: Id<"questions">;
  answers: Array<{ directorId: string; _id: string }>;
}) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitAnswer = useMutation(api.answers.submit);
  const { user } = useUser();

  const alreadyAnswered = answers.some((a) => a.directorId === user?.id);

  if (alreadyAnswered) {
    return (
      <View className="mt-6 items-center py-4">
        <Chip variant="flat" color="success" size="sm">
          <Chip.Label>Você já respondeu esta pergunta</Chip.Label>
        </Chip>
      </View>
    );
  }

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert("Atenção", "Escreva sua orientação antes de enviar.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAnswer({ questionId, text: trimmed });
      setText("");
      Alert.alert("Enviado!", "Sua orientação foi registrada. Obrigado!");
    } catch {
      Alert.alert("Erro", "Não foi possível enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="mt-6">
      <Separator className="mb-4" />
      <Text className="text-foreground font-semibold text-lg mb-3">
        Sua Orientação
      </Text>

      <Surface variant="secondary" className="rounded-xl p-1">
        <TextInput
          className="text-foreground text-base p-4 min-h-[120px]"
          placeholder="Escreva sua orientação espiritual..."
          placeholderTextColor="#888"
          multiline
          textAlignVertical="top"
          value={text}
          onChangeText={setText}
          editable={!isSubmitting}
        />
      </Surface>

      <Button
        className="mt-3"
        size="lg"
        color="primary"
        isDisabled={!text.trim() || isSubmitting}
        onPress={handleSubmit}
      >
        {isSubmitting ? (
          <Spinner size="sm" color="white" />
        ) : (
          <Button.Label>Enviar Orientação</Button.Label>
        )}
      </Button>
    </View>
  );
}
