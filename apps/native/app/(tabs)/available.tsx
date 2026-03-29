import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Cross } from "lucide-react-native";
import { useQuery } from "convex/react";
import { Spinner } from "heroui-native";
import { Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AvailableQuestionsScreen() {
  const questions = useQuery(api.questions.getAvailableQuestions);
  const myAnswers = useQuery(api.answers.getMyAnswers);
  const insets = useSafeAreaInsets();

  if (questions === undefined || myAnswers === undefined) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f5f0eb" }}>
        <Spinner size="lg" />
      </View>
    );
  }

  const pendingCount = questions.length;
  const answeredCount = myAnswers.length;

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
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
              <Cross size={20} color="#fff" strokeWidth={2.5} />
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
          colors={["#8B1A1A", "#A52422", "#c4948b", "#f5f0eb"]}
          locations={[0, 0.35, 0.75, 1]}
          style={{ paddingTop: 36, paddingBottom: 80, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Ionicons name="shield-outline" size={48} color="#fff" style={{ marginBottom: 12 }} />
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

        {/* Stats cards */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            marginTop: -56,
            gap: 12,
          }}
        >
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
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#B71C1C" }}>
              {pendingCount}
            </Text>
            <Text style={{ fontSize: 13, color: "#666", marginTop: 4, textAlign: "center" }}>
              Aguardando resposta
            </Text>
          </View>

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
              {answeredCount}
            </Text>
            <Text style={{ fontSize: 13, color: "#666", marginTop: 4, textAlign: "center" }}>
              Respondidas
            </Text>
          </View>
        </View>

        {/* Messages section */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
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
        </View>
      </ScrollView>
    </View>
  );
}
