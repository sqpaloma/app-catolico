import { api } from "@app-catolico/backend/convex/_generated/api";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { Spinner } from "heroui-native";
import { Image, Platform, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/themed-text";
import { LoginRequiredScreen } from "@/components/login-required-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function AvailableQuestionsContent() {
  const availableQuestions = useQuery(api.questions.getAvailableQuestions);
  const myAnswers = useQuery(api.answers.getMyAnswers);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (availableQuestions === undefined || myAnswers === undefined) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f0eb" }}>
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: "#8B1A1A",
            paddingTop: insets.top + 8,
            paddingBottom: 12,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
            </View>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 1 }}>
              SAFE
            </Text>
          </View>
          <Text
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 12,
              fontStyle: "italic",
              flexShrink: 1,
              textAlign: "right",
              maxWidth: "55%",
            }}
          >
            Um espaço seguro para sua alma
          </Text>
        </View>

        {/* Hero section */}
        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
          style={{ paddingTop: 20, paddingBottom: 80, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Diretor Espiritual
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            Responda com amor e orientação
          </Text>
        </LinearGradient>

        {/* Minhas Perguntas + Respondidas por mim */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            marginTop: -56,
            gap: 12,
          }}
        >
          <Pressable
            onPress={() => router.push("/my-questions")}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: pressed ? "#f0e8e0" : "#fff",
              borderRadius: 16,
              paddingVertical: 20,
              alignItems: "center",
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                },
                android: { elevation: 4 },
              }),
            })}
          >
            <Ionicons name="help-circle-outline" size={28} color="#8B1A1A" style={{ marginBottom: 4 }} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#1a1a1a", textAlign: "center" }}>
              Minhas Perguntas
            </Text>
            <Text style={{ fontSize: 11, color: "#888", marginTop: 2, textAlign: "center" }}>
              Ver status e respostas
            </Text>
          </Pressable>

          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingVertical: 20,
              alignItems: "center",
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                },
                android: { elevation: 4 },
              }),
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#2E7D32" }}>
              {myAnswers.length}
            </Text>
            <Text style={{ fontSize: 13, color: "#666", marginTop: 4, textAlign: "center" }}>
              Respondidas por mim
            </Text>
          </View>
        </View>

        {/* Received questions section (from other users) */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#1a1a1a",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Perguntas Recebidas ({availableQuestions.length})
          </Text>

          {availableQuestions.length === 0 ? (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                paddingVertical: 40,
                paddingHorizontal: 24,
                alignItems: "center",
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                  },
                  android: { elevation: 3 },
                }),
              }}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={44}
                color="#bbb"
                style={{ marginBottom: 12 }}
              />
              <Text style={{ fontSize: 15, color: "#888", textAlign: "center" }}>
                Nenhuma mensagem recebida ainda.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {availableQuestions.map((question) => (
                <Pressable
                  key={question._id}
                  onPress={() => router.push(`/question/${question._id}`)}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? "#f0e8e0" : "#fff",
                    borderRadius: 16,
                    padding: 16,
                    ...Platform.select({
                      ios: {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                      },
                      android: { elevation: 3 },
                    }),
                  })}
                >
                  <Text
                    style={{ fontSize: 15, color: "#333", lineHeight: 22 }}
                    numberOfLines={3}
                  >
                    {question.normalizedText}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="chatbubbles-outline" size={14} color="#888" />
                      <Text style={{ fontSize: 12, color: "#888" }}>
                        {question.answerCount} {question.answerCount === 1 ? "resposta" : "respostas"}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: question.status === "pending" ? "#FFF3E0" : "#E3F2FD",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color: question.status === "pending" ? "#E65100" : "#1565C0",
                        }}
                      >
                        {question.status === "pending" ? "Aguardando" : "Em resposta"}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default function AvailableQuestionsScreen() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded || !isSignedIn) {
    return <LoginRequiredScreen />;
  }

  return <AvailableQuestionsContent />;
}
