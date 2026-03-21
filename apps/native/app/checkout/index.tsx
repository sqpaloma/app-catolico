import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Surface } from "heroui-native";
import React, { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { Container } from "@/components/container";

type BillingType = "PIX" | "CREDIT_CARD";

const PAYMENT_METHODS: {
  type: BillingType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { type: "PIX", label: "PIX", icon: "qr-code-outline" },
  { type: "CREDIT_CARD", label: "Cartão de Crédito", icon: "card-outline" },
];

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

export default function CheckoutScreen() {
  const { user: clerkUser } = useUser();
  const router = useRouter();

  const [name, setName] = useState(
    clerkUser?.fullName ?? clerkUser?.firstName ?? "",
  );
  const [email, setEmail] = useState(
    clerkUser?.primaryEmailAddress?.emailAddress ?? "",
  );
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<BillingType>("PIX");

  const validate = (): boolean => {
    if (!name.trim()) {
      Alert.alert("Campo obrigatório", "Informe seu nome.");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Campo obrigatório", "Informe seu e-mail.");
      return false;
    }
    const cpfDigits = onlyDigits(cpf);
    if (cpfDigits.length !== 11) {
      Alert.alert("CPF inválido", "Informe um CPF com 11 dígitos.");
      return false;
    }
    const phoneDigits = onlyDigits(phone);
    if (phoneDigits.length < 10) {
      Alert.alert("Telefone inválido", "Informe um telefone válido com DDD.");
      return false;
    }
    if (!cep.trim() || onlyDigits(cep).length !== 8) {
      Alert.alert("CEP inválido", "Informe um CEP com 8 dígitos.");
      return false;
    }
    if (!street.trim()) {
      Alert.alert("Campo obrigatório", "Informe a rua.");
      return false;
    }
    if (!addressNumber.trim()) {
      Alert.alert("Campo obrigatório", "Informe o número do endereço.");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validate()) return;

    const customerData = {
      name: name.trim(),
      email: email.trim(),
      cpf: onlyDigits(cpf),
      phone: onlyDigits(phone),
      cep: onlyDigits(cep),
      street: street.trim(),
      addressNumber: addressNumber.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim(),
    };

    const params = encodeURIComponent(JSON.stringify(customerData));

    if (selectedMethod === "PIX") {
      router.push(`/checkout/pix?data=${params}` as any);
    } else {
      router.push(`/checkout/card-details?data=${params}` as any);
    }
  };

  return (
    <Container className="px-4 pb-4">
      <Surface variant="secondary" className="rounded-xl p-4 mb-4 mt-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-warning/20 items-center justify-center">
              <Ionicons name="star" size={20} color="#f5a623" />
            </View>
            <View>
              <Text className="text-foreground text-base font-bold">
                Plano Premium
              </Text>
              <Text className="text-muted text-xs">Assinatura mensal</Text>
            </View>
          </View>
          <View className="items-end">
            <View className="flex-row items-baseline">
              <Text className="text-foreground text-sm">R$</Text>
              <Text className="text-foreground text-2xl font-bold mx-0.5">
                9,90
              </Text>
            </View>
            <Text className="text-muted text-xs">/mês</Text>
          </View>
        </View>
      </Surface>

      <Text className="text-foreground text-base font-semibold mb-3">
        Dados pessoais
      </Text>

      <View className="gap-3 mb-5">
        <View>
          <Text className="text-foreground text-sm font-medium mb-1">Nome</Text>
          <Surface variant="secondary" className="rounded-xl overflow-hidden">
            <TextInput
              className="text-foreground text-base p-3.5"
              placeholder="Seu nome completo"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </Surface>
        </View>

        <View>
          <Text className="text-foreground text-sm font-medium mb-1">
            E-mail
          </Text>
          <Surface variant="secondary" className="rounded-xl overflow-hidden">
            <TextInput
              className="text-foreground text-base p-3.5"
              placeholder="seu@email.com"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Surface>
        </View>

        <View>
          <Text className="text-foreground text-sm font-medium mb-1">CPF</Text>
          <Surface variant="secondary" className="rounded-xl overflow-hidden">
            <TextInput
              className="text-foreground text-base p-3.5"
              placeholder="000.000.000-00"
              placeholderTextColor="#888"
              value={cpf}
              onChangeText={(v) => setCpf(formatCpf(v))}
              keyboardType="number-pad"
              maxLength={14}
            />
          </Surface>
        </View>

        <View>
          <Text className="text-foreground text-sm font-medium mb-1">
            Telefone
          </Text>
          <Surface variant="secondary" className="rounded-xl overflow-hidden">
            <TextInput
              className="text-foreground text-base p-3.5"
              placeholder="(00) 00000-0000"
              placeholderTextColor="#888"
              value={phone}
              onChangeText={(v) => setPhone(formatPhone(v))}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </Surface>
        </View>
      </View>

      <Text className="text-foreground text-base font-semibold mb-3">
        Endereço
      </Text>

      <View className="gap-3 mb-5">
        <View>
          <Text className="text-foreground text-sm font-medium mb-1">CEP</Text>
          <Surface variant="secondary" className="rounded-xl overflow-hidden">
            <TextInput
              className="text-foreground text-base p-3.5"
              placeholder="00000-000"
              placeholderTextColor="#888"
              value={cep}
              onChangeText={(v) => setCep(formatCep(v))}
              keyboardType="number-pad"
              maxLength={9}
            />
          </Surface>
        </View>

        <View>
          <Text className="text-foreground text-sm font-medium mb-1">Rua</Text>
          <Surface variant="secondary" className="rounded-xl overflow-hidden">
            <TextInput
              className="text-foreground text-base p-3.5"
              placeholder="Nome da rua"
              placeholderTextColor="#888"
              value={street}
              onChangeText={setStreet}
              autoCapitalize="words"
            />
          </Surface>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-foreground text-sm font-medium mb-1">
              Número
            </Text>
            <Surface
              variant="secondary"
              className="rounded-xl overflow-hidden"
            >
              <TextInput
                className="text-foreground text-base p-3.5"
                placeholder="Nº"
                placeholderTextColor="#888"
                value={addressNumber}
                onChangeText={setAddressNumber}
                keyboardType="number-pad"
              />
            </Surface>
          </View>
          <View className="flex-2">
            <Text className="text-foreground text-sm font-medium mb-1">
              Bairro
            </Text>
            <Surface
              variant="secondary"
              className="rounded-xl overflow-hidden"
            >
              <TextInput
                className="text-foreground text-base p-3.5"
                placeholder="Bairro"
                placeholderTextColor="#888"
                value={neighborhood}
                onChangeText={setNeighborhood}
                autoCapitalize="words"
              />
            </Surface>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-2">
            <Text className="text-foreground text-sm font-medium mb-1">
              Cidade
            </Text>
            <Surface
              variant="secondary"
              className="rounded-xl overflow-hidden"
            >
              <TextInput
                className="text-foreground text-base p-3.5"
                placeholder="Cidade"
                placeholderTextColor="#888"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
            </Surface>
          </View>
          <View className="flex-1">
            <Text className="text-foreground text-sm font-medium mb-1">
              Estado
            </Text>
            <Surface
              variant="secondary"
              className="rounded-xl overflow-hidden"
            >
              <TextInput
                className="text-foreground text-base p-3.5"
                placeholder="UF"
                placeholderTextColor="#888"
                value={state}
                onChangeText={(v) => setState(v.toUpperCase().slice(0, 2))}
                autoCapitalize="characters"
                maxLength={2}
              />
            </Surface>
          </View>
        </View>
      </View>

      <Text className="text-foreground text-base font-semibold mb-3">
        Forma de pagamento
      </Text>

      <View className="gap-2 mb-5">
        {PAYMENT_METHODS.map((m) => (
          <Pressable key={m.type} onPress={() => setSelectedMethod(m.type)}>
            <Surface
              variant={selectedMethod === m.type ? "primary" : "secondary"}
              className="rounded-xl p-4 flex-row items-center gap-3"
            >
              <Ionicons
                name={m.icon}
                size={22}
                color={selectedMethod === m.type ? "#f5a623" : "#888"}
              />
              <Text
                className={
                  selectedMethod === m.type
                    ? "text-foreground font-semibold text-base flex-1"
                    : "text-muted text-base flex-1"
                }
              >
                {m.label}
              </Text>
              {selectedMethod === m.type && (
                <Ionicons name="checkmark-circle" size={22} color="#f5a623" />
              )}
            </Surface>
          </Pressable>
        ))}
      </View>

      <Button size="lg" color="warning" onPress={handleContinue}>
        <Button.Label>Continuar</Button.Label>
      </Button>

      <Text className="text-muted text-xs text-center mt-3">
        Pagamento processado com segurança pelo Asaas.
      </Text>
    </Container>
  );
}
