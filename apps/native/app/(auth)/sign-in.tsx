import { useSignIn, useSSO } from "@clerk/clerk-expo";
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
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Text, TextInput } from "@/components/ui/themed-text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

type ClerkErrorLike = {
  errors?: Array<{ longMessage?: string; message?: string }>;
  longMessage?: string;
  message?: string;
};

const normalizeVerificationCode = (value: string) => value.replace(/\D/g, "").slice(0, 6);

const getClerkErrorMessage = (err: unknown, fallback: string) => {
  const clerkErr = err as ClerkErrorLike;
  return String(
    clerkErr?.errors?.[0]?.longMessage ??
      clerkErr?.errors?.[0]?.message ??
      clerkErr?.longMessage ??
      clerkErr?.message ??
      fallback,
  );
};

const getIncompleteSignInMessage = (status: string | null | undefined) => {
  if (status === "needs_second_factor") {
    return "Código confirmado, mas o login ainda precisa de uma segunda verificação.";
  }

  if (status === "needs_client_trust") {
    return "Código confirmado, mas este dispositivo ainda precisa ser confiável.";
  }

  return `Login incompleto (status: ${status ?? "desconhecido"}).`;
};

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
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
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSSOPress = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      if (!isLoaded) return;
      setOauthLoading(strategy === "oauth_google" ? "google" : "apple");

      try {
        const { createdSessionId, setActive: ssoSetActive, signIn: ssoSignIn, signUp: ssoSignUp } =
          await startSSOFlow({
            strategy,
            redirectUrl: Linking.createURL("/(auth)/sign-in"),
          });

        if (createdSessionId && ssoSetActive) {
          await ssoSetActive({ session: createdSessionId });
          router.replace("/");
          return;
        }

        if (ssoSignUp?.verifications?.externalAccount?.status === "transferable" && ssoSignIn) {
          const response = await ssoSignIn.create({ transfer: true });
          if (response.status === "complete" && ssoSetActive) {
            await ssoSetActive({ session: response.createdSessionId });
            router.replace("/");
            return;
          }
        }

        if (ssoSignIn?.firstFactorVerification?.status === "transferable" && ssoSignUp) {
          const response = await ssoSignUp.create({ transfer: true });
          if (response.status === "complete" && ssoSetActive) {
            await ssoSetActive({ session: response.createdSessionId });
            router.replace("/");
            return;
          }
        }

        if (
          ssoSignUp?.verifications?.externalAccount?.status === "unverified" &&
          ssoSignUp?.status === "missing_requirements"
        ) {
          setErrorMessage(
            "Não foi possível verificar sua conta externa. Tente novamente ou use email/senha.",
          );
        }
      } catch (err: unknown) {
        setErrorMessage(getClerkErrorMessage(err, "Não foi possível continuar. Tente novamente."));
      } finally {
        setOauthLoading(null);
      }
    },
    [isLoaded, startSSOFlow, router],
  );

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setErrorMessage("");
    setIsLoading(true);

    try {
      let signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "needs_first_factor") {
        signInAttempt = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });
      }

      const status = signInAttempt.status as string | null;

      if (status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else if (status === "needs_second_factor" || status === "needs_client_trust") {
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setPendingVerification(true);
      } else {
        setErrorMessage(`Login incompleto (status: ${status}).`);
      }
    } catch (err: unknown) {
      setErrorMessage(getClerkErrorMessage(err, "Email ou senha incorretos."));
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    const verificationCode = normalizeVerificationCode(code);

    if (verificationCode.length !== 6) {
      Alert.alert("Erro", "Digite o código de 6 dígitos enviado por email.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: verificationCode,
      });

      if (result.status === "complete") {
        if (!result.createdSessionId) {
          console.warn("Clerk sign-in completed without session", result);
          Alert.alert("Erro", "Verificação concluída, mas não foi possível iniciar a sessão.");
          return;
        }

        await setActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        console.warn("Incomplete Clerk sign-in verification", result);
        Alert.alert("Erro", getIncompleteSignInMessage(result.status));
      }
    } catch (err: unknown) {
      Alert.alert("Erro", getClerkErrorMessage(err, "Código inválido. Verifique e tente novamente."));
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
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
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
              Verificar Dispositivo
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
                onChangeText={(text) => setCode(normalizeVerificationCode(text))}
                editable={!isLoading}
              />

              <Pressable
                onPress={onVerifyPress}
                disabled={code.length !== 6 || isLoading}
                style={({ pressed }) => ({
                  backgroundColor: code.length !== 6 || isLoading
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
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
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
            Bem-vindo de volta
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
            Entre na sua conta para continuar sua jornada espiritual
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

            <View style={{ marginBottom: 12 }}>
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
                  placeholder="Sua senha"
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
              onPress={onSignInPress}
              disabled={!emailAddress || !password || isLoading || !!oauthLoading}
              style={({ pressed }) => ({
                backgroundColor: !emailAddress || !password || isLoading
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
                {isLoading ? "Entrando..." : "Entrar"}
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
                disabled={isLoading || !!oauthLoading}
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
                  opacity: oauthLoading === "apple" ? 0.5 : 1,
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
                disabled={isLoading || !!oauthLoading}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: pressed ? "#2a2a2a" : "#1a1a1a",
                  borderRadius: 12,
                  paddingVertical: 14,
                  opacity: oauthLoading === "google" ? 0.5 : 1,
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
          <Text style={{ fontSize: 14, color: "#888" }}>Não tem conta?</Text>
          <Link href="/(auth)/onboarding-quiz">
            <Text style={{ fontSize: 14, color: "#8B1A1A", fontWeight: "700" }}>Criar conta</Text>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}
