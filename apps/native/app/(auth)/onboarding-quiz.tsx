import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  View,
} from "react-native";
import { Text } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Gender = "masculino" | "feminino";
type AgeGroup = "-18" | "18-25" | "25-35" | "35-45" | "45-55" | "55+";

interface QuizAnswers {
  gender: Gender | null;
  ageGroup: AgeGroup | null;
  hasDepression: boolean | null;
  goesToChurch: boolean | null;
}

const TOTAL_STEPS = 4;

export default function OnboardingQuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    gender: null,
    ageGroup: null,
    hasDepression: null,
    goesToChurch: null,
  });

  const cardShadow = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
  });

  const selectAndAdvance = (key: keyof QuizAnswers, value: QuizAnswers[typeof key]) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      router.push({
        pathname: "/(auth)/sign-up",
        params: {
          gender: updated.gender ?? "",
          ageGroup: updated.ageGroup ?? "",
          hasDepression: updated.hasDepression ? "true" : "false",
          goesToChurch: updated.goesToChurch ? "true" : "false",
        },
      });
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const renderOptionButton = (
    label: string,
    selected: boolean,
    onPress: () => void,
    icon?: keyof typeof Ionicons.glyphMap,
  ) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? "#8B1A1A" : pressed ? "#f0ebe5" : "#f5f0eb",
        borderRadius: 14,
        paddingVertical: 18,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 2,
        borderColor: selected ? "#8B1A1A" : "transparent",
      })}
    >
      {icon && (
        <Ionicons name={icon} size={22} color={selected ? "#fff" : "#8B1A1A"} />
      )}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: selected ? "#fff" : "#1a1a1a",
          flex: 1,
        }}
      >
        {label}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={22} color="#fff" />
      )}
    </Pressable>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return {
          title: "Qual seu sexo?",
          subtitle: "Selecione uma opção",
          content: (
            <View style={{ gap: 12 }}>
              {renderOptionButton("Masculino", answers.gender === "masculino", () => selectAndAdvance("gender", "masculino"), "male")}
              {renderOptionButton("Feminino", answers.gender === "feminino", () => selectAndAdvance("gender", "feminino"), "female")}
            </View>
          ),
        };

      case 1:
        return {
          title: "Qual sua faixa etária?",
          subtitle: "Selecione sua idade",
          content: (
            <View style={{ gap: 10 }}>
              {(
                [
                  { value: "-18" as const, label: "Menos de 18 anos" },
                  { value: "18-25" as const, label: "18 a 25 anos" },
                  { value: "25-35" as const, label: "25 a 35 anos" },
                  { value: "35-45" as const, label: "35 a 45 anos" },
                  { value: "45-55" as const, label: "45 a 55 anos" },
                  { value: "55+" as const, label: "55 anos ou mais" },
                ] as const
              ).map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => selectAndAdvance("ageGroup", item.value)}
                  style={({ pressed }) => ({
                    backgroundColor:
                      answers.ageGroup === item.value
                        ? "#8B1A1A"
                        : pressed
                          ? "#f0ebe5"
                          : "#f5f0eb",
                    borderRadius: 14,
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: answers.ageGroup === item.value ? "#8B1A1A" : "transparent",
                  })}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: answers.ageGroup === item.value ? "#fff" : "#1a1a1a",
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </Text>
                  {answers.ageGroup === item.value && (
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  )}
                </Pressable>
              ))}
            </View>
          ),
        };

      case 2:
        return {
          title: "Você tem depressão?",
          subtitle: "Essa informação é confidencial",
          content: (
            <View style={{ gap: 12 }}>
              {renderOptionButton("Sim", answers.hasDepression === true, () => selectAndAdvance("hasDepression", true))}
              {renderOptionButton("Não", answers.hasDepression === false, () => selectAndAdvance("hasDepression", false))}
            </View>
          ),
        };

      case 3:
        return {
          title: "Você frequenta a igreja?",
          subtitle: "Nos conte sobre seu hábito",
          content: (
            <View style={{ gap: 12 }}>
              {renderOptionButton("Sim", answers.goesToChurch === true, () => selectAndAdvance("goesToChurch", true))}
              {renderOptionButton("Não", answers.goesToChurch === false, () => selectAndAdvance("goesToChurch", false))}
            </View>
          ),
        };

      default:
        return { title: "", subtitle: "", content: null };
    }
  };

  const currentStep = renderStep();

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
        }}
      >
        <Pressable onPress={goBack} hitSlop={12} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", marginRight: 36 }}>
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
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 1, marginLeft: 10 }}>
            SAFE
          </Text>
        </View>
      </View>

      <LinearGradient
        colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
        locations={[0, 0.45, 0.85, 1]}
        style={{ paddingTop: 32, paddingBottom: 56, alignItems: "center", paddingHorizontal: 24 }}
      >
        <Text
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Passo {step + 1} de {TOTAL_STEPS}
        </Text>
        <Text
          style={{
            color: "#fff",
            fontSize: 26,
            fontWeight: "800",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {currentStep.title}
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {currentStep.subtitle}
        </Text>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, marginTop: -32 }}>
        <View style={{ marginBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginBottom: 20,
            }}
          >
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: i <= step ? "#8B1A1A" : "#d4c8bf",
                }}
              />
            ))}
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            ...cardShadow,
          }}
        >
          {currentStep.content}
        </View>
      </View>
    </View>
  );
}
