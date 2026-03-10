import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { Button, Surface } from "heroui-native";

import { Container } from "@/components/container";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        Alert.alert("Erro", "Não foi possível completar o login.");
      }
    } catch {
      Alert.alert("Erro", "Email ou senha incorretos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="px-6 justify-center">
      <View className="items-center mb-8">
        <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
          <Ionicons name="heart" size={28} color="#888" />
        </View>
        <Text className="text-foreground text-2xl font-bold">
          Direção Espiritual
        </Text>
        <Text className="text-muted text-sm mt-1">
          Entre na sua conta para continuar
        </Text>
      </View>

      <Surface variant="secondary" className="rounded-xl p-1 mb-3">
        <TextInput
          className="text-foreground text-base p-4"
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailAddress}
          placeholder="Email"
          placeholderTextColor="#888"
          onChangeText={setEmailAddress}
          editable={!isLoading}
        />
      </Surface>

      <Surface variant="secondary" className="rounded-xl p-1 mb-4">
        <TextInput
          className="text-foreground text-base p-4"
          value={password}
          placeholder="Senha"
          placeholderTextColor="#888"
          secureTextEntry
          onChangeText={setPassword}
          editable={!isLoading}
        />
      </Surface>

      <Button
        size="lg"
        color="primary"
        isDisabled={!emailAddress || !password || isLoading}
        onPress={onSignInPress}
      >
        <Button.Label>{isLoading ? "Entrando..." : "Entrar"}</Button.Label>
      </Button>

      <View className="flex-row items-center justify-center mt-6 gap-1">
        <Text className="text-muted text-sm">Não tem conta?</Text>
        <Link href="/(auth)/sign-up">
          <Text className="text-primary text-sm font-semibold">Criar conta</Text>
        </Link>
      </View>
    </Container>
  );
}
