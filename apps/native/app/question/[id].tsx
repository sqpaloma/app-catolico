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
  const questionId = id as Id<"questions">;

  const question = useQuery(api.questions.getById, { questionId });
  const answers = useQuery(api.answers.getByQuestion, { questionId });
  const history = useQuery(api.questions.getHistoryByAnonymousId, { questionId });

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
      <View className="py-4 flex-row items-center gap-2">
        <Chip variant="flat" color={config.color} size="sm">
          <Chip.Label>{config.label}</Chip.Label>
        </Chip>
        {question.isPremium && (
          <Chip variant="flat" color="warning" size="sm">
            <Chip.Label>Premium</Chip.Label>
          </Chip>
        )}
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

      {question.isPremium && history && history.length > 0 && (
        <View className="mt-6">
          <Text className="text-foreground font-semibold text-lg mb-1">
            Histórico do Usuário
          </Text>
          <Text className="text-muted text-xs mb-3">
            Perguntas anteriores deste usuário (anônimo) — visível por ser Premium.
          </Text>
          <View className="gap-2">
            {history.map((q) => (
              <Surface key={q._id} variant="secondary" className="p-3 rounded-lg">
                <Text className="text-foreground text-sm leading-6" numberOfLines={3}>
                  {q.normalizedText}
                </Text>
                <Chip
                  variant="flat"
                  color={statusConfig[q.status].color}
                  size="sm"
                  className="mt-2 self-start"
                >
                  <Chip.Label>{statusConfig[q.status].label}</Chip.Label>
                </Chip>
              </Surface>
            ))}
          </View>
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

      <DirectorAnswerForm
        questionId={questionId}
        answers={answers}
      />
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
