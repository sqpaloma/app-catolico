import { env } from "@app-catolico/env/native";
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { TERMS_OF_USE_PT } from "@/constants/legal/terms-pt";
import { Text, TextInput } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const allChecksPassed = Object.values(passwordChecks).every(Boolean);

  const openPrivacyPolicy = useCallback(() => {
    void WebBrowser.openBrowserAsync(env.EXPO_PUBLIC_PRIVACY_POLICY_URL);
  }, []);

  const onSSOPress = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      if (!isLoaded) return;
      if (!acceptedLegal) {
        setErrorMessage(
          "Aceite os Termos de Uso e a Política de Privacidade para continuar.",
        );
        return;
      }
      setOauthLoading(strategy === "oauth_google" ? "google" : "apple");

      try {
        const { createdSessionId, setActive: ssoSetActive } =
          await startSSOFlow({
            strategy,
            redirectUrl: Linking.createURL("/(auth)/sign-up"),
          });

        if (createdSessionId && ssoSetActive) {
          await ssoSetActive({ session: createdSessionId });
          router.replace("/");
        }
      } catch (err: any) {
        const msg =
          err?.errors?.[0]?.longMessage ??
          err?.message ??
          "Não foi possível continuar. Tente novamente.";
        setErrorMessage(msg);
      } finally {
        setOauthLoading(null);
      }
    },
    [isLoaded, startSSOFlow, router, acceptedLegal],
  );

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setErrorMessage("");

    if (!acceptedLegal) {
      setErrorMessage(
        "Aceite os Termos de Uso e a Política de Privacidade para continuar.",
      );
      return;
    }

    if (!allChecksPassed) {
      setErrorMessage("A senha não atende todos os requisitos abaixo.");
      return;
    }

    setIsLoading(true);

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkErr = err as {
        errors?: Array<{ longMessage?: string; message?: string }>;
        longMessage?: string;
        message?: string;
      };
      const message =
        clerkErr?.errors?.[0]?.longMessage ??
        clerkErr?.errors?.[0]?.message ??
        clerkErr?.longMessage ??
        clerkErr?.message ??
        "Não foi possível criar a conta. Verifique os dados.";
      console.error("Clerk sign-up error:", err);
      setErrorMessage(String(message));
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        Alert.alert("Erro", "Não foi possível verificar. Tente novamente.");
      }
    } catch {
      Alert.alert("Erro", "Código inválido. Verifique e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const cardShadow = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
  });

  if (pendingVerification) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: "#8B1A1A",
              paddingTop: insets.top + 8,
              paddingBottom: 12,
              paddingHorizontal: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
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
          </View>

          <LinearGradient
            colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
            locations={[0, 0.45, 0.85, 1]}
            style={{ paddingTop: 32, paddingBottom: 56, alignItems: "center", paddingHorizontal: 24 }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="mail" size={28} color="#fff" />
            </View>
            <Text
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: "800",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Verificar Email
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Enviamos um código para {emailAddress}
            </Text>
          </LinearGradient>

          <View style={{ paddingHorizontal: 20, marginTop: -32 }}>
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 24,
                ...cardShadow,
              }}
            >
              <TextInput
                style={{
                  backgroundColor: "#f5f0eb",
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 18,
                  color: "#1a1a1a",
                  textAlign: "center",
                  letterSpacing: 8,
                  marginBottom: 16,
                }}
                value={code}
                placeholder="000000"
                placeholderTextColor="#aaa"
                keyboardType="number-pad"
                onChangeText={setCode}
                editable={!isLoading}
              />

              <Pressable
                onPress={onVerifyPress}
                disabled={!code || isLoading}
                style={({ pressed }) => ({
                  backgroundColor: !code || isLoading
                    ? "#c4948b"
                    : pressed
                      ? "#7B1616"
                      : "#8B1A1A",
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                })}
              >
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  {isLoading ? "Verificando..." : "Verificar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0eb" }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: "#8B1A1A",
            paddingTop: insets.top + 8,
            paddingBottom: 12,
            paddingHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
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
        </View>

        <LinearGradient
          colors={["#8B1A1A", "#A52422", "#b5726a", "#f5f0eb"]}
          locations={[0, 0.45, 0.85, 1]}
          style={{ paddingTop: 40, paddingBottom: 56, alignItems: "center", paddingHorizontal: 24 }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 44, height: 44, marginBottom: 8 }}
            resizeMode="contain"
          />
          <Text
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Criar Conta
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 14,
              textAlign: "center",
              lineHeight: 20,
              maxWidth: 280,
            }}
          >
            Comece sua jornada de direção espiritual no SAFE
          </Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: -32 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
              ...cardShadow,
            }}
          >
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8, marginLeft: 4 }}>
                Email
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#f5f0eb",
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: "#1a1a1a",
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                value={emailAddress}
                placeholder="seu@email.com"
                placeholderTextColor="#aaa"
                onChangeText={(text) => {
                  setEmailAddress(text);
                  if (errorMessage) setErrorMessage("");
                }}
                editable={!isLoading}
              />
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8, marginLeft: 4 }}>
                Senha
              </Text>
              <View
                style={{
                  backgroundColor: "#f5f0eb",
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    padding: 16,
                    fontSize: 16,
                    color: "#1a1a1a",
                  }}
                  value={password}
                  placeholder="Crie uma senha"
                  placeholderTextColor="#aaa"
                  secureTextEntry={!showPassword}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={8}
                  style={{ paddingRight: 14, paddingLeft: 4 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#999"
                  />
                </Pressable>
              </View>
            </View>

            {password.length > 0 ? (
              <View style={{ marginBottom: 12, gap: 4 }}>
                {([
                  { key: "length" as const, label: "Mínimo de 8 caracteres" },
                  { key: "uppercase" as const, label: "Uma letra maiúscula" },
                  { key: "lowercase" as const, label: "Uma letra minúscula" },
                  { key: "number" as const, label: "Um número" },
                ]).map((item) => (
                  <View key={item.key} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons
                      name={passwordChecks[item.key] ? "checkmark-circle" : "close-circle"}
                      size={16}
                      color={passwordChecks[item.key] ? "#16A34A" : "#DC2626"}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: passwordChecks[item.key] ? "#16A34A" : "#DC2626",
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ height: 12 }} />
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <Pressable
                onPress={() => {
                  setAcceptedLegal((v) => !v);
                  if (errorMessage) setErrorMessage("");
                }}
                hitSlop={8}
                style={{ paddingTop: 2 }}
              >
                <Ionicons
                  name={acceptedLegal ? "checkbox" : "square-outline"}
                  size={22}
                  color={acceptedLegal ? "#8B1A1A" : "#999"}
                />
              </Pressable>
              <Text style={{ flex: 1, fontSize: 13, color: "#444", lineHeight: 20 }}>
                Li e aceito os{" "}
                <Text
                  onPress={() => setShowTermsModal(true)}
                  style={{ color: "#8B1A1A", fontWeight: "700" }}
                >
                  Termos de Uso
                </Text>{" "}
                e a{" "}
                <Text
                  onPress={openPrivacyPolicy}
                  style={{ color: "#8B1A1A", fontWeight: "700" }}
                >
                  Política de Privacidade
                </Text>
                .
              </Text>
            </View>

            {errorMessage ? (
              <View
                style={{
                  backgroundColor: "#FEF2F2",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="alert-circle" size={18} color="#B91C1C" />
                <Text style={{ flex: 1, fontSize: 13, color: "#B91C1C", lineHeight: 18 }}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={onSignUpPress}
              disabled={
                !emailAddress ||
                !password ||
                !acceptedLegal ||
                isLoading ||
                !!oauthLoading
              }
              style={({ pressed }) => ({
                backgroundColor:
                  !emailAddress || !password || !acceptedLegal || isLoading
                  ? "#c4948b"
                  : pressed
                    ? "#7B1616"
                    : "#8B1A1A",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              })}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                {isLoading ? "Criando..." : "Criar Conta"}
              </Text>
              {!isLoading && (
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
              )}
            </Pressable>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 20,
                marginBottom: 4,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: "#e0d8d0" }} />
              <Text style={{ marginHorizontal: 12, fontSize: 13, color: "#999" }}>
                ou continue com
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#e0d8d0" }} />
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
              <Pressable
                onPress={() => onSSOPress("oauth_google")}
                disabled={isLoading || !!oauthLoading || !acceptedLegal}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: pressed ? "#f0ebe5" : "#f5f0eb",
                  borderRadius: 12,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: "#e0d8d0",
                  opacity: oauthLoading === "apple" || !acceptedLegal ? 0.5 : 1,
                })}
              >
                {oauthLoading === "google" ? (
                  <ActivityIndicator size="small" color="#8B1A1A" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color="#4285F4" />
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#333" }}>
                      Google
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={() => onSSOPress("oauth_apple")}
                disabled={isLoading || !!oauthLoading || !acceptedLegal}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: pressed ? "#2a2a2a" : "#1a1a1a",
                  borderRadius: 12,
                  paddingVertical: 14,
                  opacity: oauthLoading === "google" || !acceptedLegal ? 0.5 : 1,
                })}
              >
                {oauthLoading === "apple" ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="logo-apple" size={20} color="#fff" />
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                      Apple
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 24,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 14, color: "#888" }}>Já tem conta?</Text>
          <Link href="/(auth)/sign-in">
            <Text style={{ fontSize: 14, color: "#8B1A1A", fontWeight: "700" }}>Entrar</Text>
          </Link>
        </View>
      </ScrollView>

      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setShowTermsModal(false)}
          />
          <View
            style={{
              maxHeight: "88%",
              backgroundColor: "#fff",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#1a1a1a" }}>
              Termos de Uso
            </Text>
            <ScrollView
              style={{ marginTop: 12, marginBottom: 16 }}
              showsVerticalScrollIndicator
            >
              <Text style={{ fontSize: 14, lineHeight: 22, color: "#333" }}>
                {TERMS_OF_USE_PT}
              </Text>
            </ScrollView>
            <Pressable
              onPress={() => setShowTermsModal(false)}
              style={{
                backgroundColor: "#8B1A1A",
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                Fechar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
