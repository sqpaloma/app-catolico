import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text, TextInput } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  "Angústia / Sofrimento",
  "Peso de um pecado",
  "Dúvida na fé",
  "Relacionamento / Família",
  "Luto / Perda",
  "Ansiedade / Medo",
  "Outro",
] as const;

type FeedbackModal = {
  visible: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  message: string;
};

const MODAL_HIDDEN: FeedbackModal = {
  visible: false,
  icon: "checkmark-circle",
  iconColor: "#2E7D32",
  title: "",
  message: "",
};

export default function ConfessarScreen() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string>("Outro");
  const [showPicker, setShowPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInfoAlert, setShowInfoAlert] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackModal>(MODAL_HIDDEN);
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  const submitQuestion = useMutation(api.questions.submit);

  useEffect(() => {
    if (showInfoAlert) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showInfoAlert]);

  const dismissAlert = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowInfoAlert(false));
  };

  const showFeedback = (info: Omit<FeedbackModal, "visible">) =>
    setFeedback({ ...info, visible: true });

  const closeFeedback = () => setFeedback(MODAL_HIDDEN);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      showFeedback({
        icon: "alert-circle",
        iconColor: "#E65100",
        title: "Atenção",
        message: "Escreva algo antes de enviar.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitQuestion({ text: trimmed, category });
      setText("");
      setCategory("Outro");
      showFeedback({
        icon: "checkmark-circle",
        iconColor: "#2E7D32",
        title: "Enviado!",
        message: "Sua mensagem foi enviada. Um diretor espiritual responderá em breve com orientação e oração.",
      });
    } catch {
      showFeedback({
        icon: "close-circle",
        iconColor: "#B71C1C",
        title: "Erro",
        message: "Não foi possível enviar. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* Header bar */}
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

        {/* Hero gradient with dove */}
        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
          style={{ paddingTop: 20, paddingBottom: 48, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 30,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Fale com Deus
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Tudo aqui é anônimo e sagrado
          </Text>
        </LinearGradient>

        {/* Main form card */}
        <View style={{ paddingHorizontal: 20, marginTop: -28 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
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
            {/* Category selector */}
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginBottom: 10 }}>
              O que você está sentindo?
            </Text>
            <Pressable
              onPress={() => setShowPicker(true)}
              style={{
                borderWidth: 1.5,
                borderColor: "#8B1A1A",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 15, color: "#1a1a1a", fontWeight: "500" }}>{category}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </Pressable>

            {/* Text input */}
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginBottom: 10 }}>
              Escreva o que está no seu coração
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                marginBottom: 8,
              }}
            >
              <TextInput
                style={{
                  fontSize: 15,
                  color: "#1a1a1a",
                  padding: 16,
                  minHeight: 160,
                  textAlignVertical: "top",
                }}
                placeholder="Pode escrever livremente... Este é um espaço seguro para você. Ninguém saberá quem você é."
                placeholderTextColor="#999"
                multiline
                value={text}
                onChangeText={setText}
                editable={!isSubmitting}
              />
            </View>
            <Text style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>
              {text.length} caracteres
            </Text>

            {/* Submit button */}
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting || !text.trim()}
              style={({ pressed }) => ({
                backgroundColor:
                  isSubmitting || !text.trim()
                    ? "rgba(139,26,26,0.5)"
                    : pressed
                      ? "#7B1616"
                      : "#8B1A1A",
                borderRadius: 14,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              })}
            >
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                {isSubmitting ? "Enviando..." : "Enviar para o Diretor Espiritual"}
              </Text>
            </Pressable>

            <Text
              style={{
                fontSize: 13,
                color: "#888",
                textAlign: "center",
                marginTop: 12,
                lineHeight: 19,
              }}
            >
              Um diretor espiritual responderá em breve com orientação e oração.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Feedback modal */}
      <Modal visible={feedback.visible} transparent animationType="fade" onRequestClose={closeFeedback}>
        <Pressable
          onPress={closeFeedback}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 320,
              paddingTop: 32,
              paddingBottom: 20,
              paddingHorizontal: 24,
              alignItems: "center",
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 24,
                },
                android: { elevation: 10 },
              }),
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: `${feedback.iconColor}18`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name={feedback.icon} size={30} color={feedback.iconColor} />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                color: "#1a1a1a",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {feedback.title}
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "#666",
                textAlign: "center",
                lineHeight: 22,
                marginBottom: 24,
              }}
            >
              {feedback.message}
            </Text>
            <Pressable
              onPress={closeFeedback}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#7B1616" : "#8B1A1A",
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 32,
                width: "100%",
                alignItems: "center",
              })}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                OK
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Info alert overlay */}
      <Modal visible={showInfoAlert} transparent animationType="none">
        <Pressable
          onPress={dismissAlert}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 28,
          }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 28,
              width: "100%",
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                },
                android: { elevation: 12 },
              }),
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#fef3f3",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="information-circle" size={32} color="#8B1A1A" />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#1a1a1a",
                  textAlign: "center",
                }}
              >
                Como funciona
              </Text>
            </View>

            <View style={{ gap: 18 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <Text style={{ fontSize: 22 }}>✍️</Text>
                <Text style={{ fontSize: 14, color: "#444", lineHeight: 21, flex: 1 }}>
                  Você escreve o que está sentindo — sem revelar seu nome
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <Text style={{ fontSize: 22 }}>🗣️</Text>
                <Text style={{ fontSize: 14, color: "#444", lineHeight: 21, flex: 1 }}>
                  Um diretor espiritual lê e responde com orientação católica
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <Text style={{ fontSize: 22 }}>💬</Text>
                <Text style={{ fontSize: 14, color: "#444", lineHeight: 21, flex: 1 }}>
                  Você recebe a resposta de forma anônima e segura
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 12,
                color: "#999",
                textAlign: "center",
                marginTop: 20,
              }}
            >
              Toque em qualquer lugar para fechar
            </Text>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Category picker modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <Pressable
          onPress={() => setShowPicker(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        >
          <Pressable
            onPress={() => { }}
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View
              style={{
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#ccc",
                  marginBottom: 8,
                }}
              />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a" }}>
                O que você está sentindo?
              </Text>
            </View>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  setShowPicker(false);
                }}
                style={({ pressed }) => ({
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  backgroundColor: pressed ? "#f5f0eb" : "#fff",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                })}
              >
                <Text style={{ fontSize: 15, color: "#1a1a1a" }}>{cat}</Text>
                {category === cat && <Ionicons name="checkmark" size={20} color="#8B1A1A" />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
