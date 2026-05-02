import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Platform, Pressable, View } from "react-native";
import { Text } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function LoginRequiredScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
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
              source={require("../assets/images/logo.png")}
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

      <LinearGradient
        colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
        locations={[0, 0.45, 0.85, 1]}
        style={{ paddingTop: 40, paddingBottom: 80, alignItems: "center", paddingHorizontal: 24 }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Ionicons name="lock-closed" size={32} color="#fff" />
        </View>
        <Text
          style={{
            color: "#fff",
            fontSize: 26,
            fontWeight: "800",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Área Restrita
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 15,
            textAlign: "center",
            lineHeight: 22,
            maxWidth: 300,
          }}
        >
          Faça login para ter acesso a esta página
        </Text>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, marginTop: -48 }}>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            alignItems: "center",
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
              },
              android: { elevation: 6 },
            }),
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#444",
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 24,
            }}
          >
            Entre na sua conta para continuar sua jornada espiritual
          </Text>

          <Pressable
            onPress={() => router.push("/(auth)/sign-in")}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#7B1616" : "#8B1A1A",
              borderRadius: 14,
              paddingVertical: 16,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            })}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
              Entrar
            </Text>
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16,
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 14, color: "#888" }}>Não tem conta?</Text>
            <Pressable onPress={() => router.push("/(auth)/onboarding-quiz")}>
              <Text style={{ fontSize: 14, color: "#8B1A1A", fontWeight: "700" }}>
                Criar conta
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
