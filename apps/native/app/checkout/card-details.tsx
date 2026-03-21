import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Surface } from "heroui-native";
import React, { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { Container } from "@/components/container";

type InstallmentType = "DEBIT" | "CREDIT";

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function CardDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ data: string }>();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [holderName, setHolderName] = useState("");
  const [installmentType, setInstallmentType] =
    useState<InstallmentType>("DEBIT");

  const validate = (): boolean => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 16) {
      Alert.alert(
        "Cartão inválido",
        "Informe um número de cartão válido.",
      );
      return false;
    }
    const expiryDigits = expiry.replace(/\D/g, "");
    if (expiryDigits.length !== 4) {
      Alert.alert("Validade inválida", "Informe a validade no formato MM/AA.");
      return false;
    }
    const month = parseInt(expiryDigits.slice(0, 2), 10);
    if (month < 1 || month > 12) {
      Alert.alert("Mês inválido", "O mês deve estar entre 01 e 12.");
      return false;
    }
    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert("CVV inválido", "Informe o CVV do cartão (3 ou 4 dígitos).");
      return false;
    }
    if (!holderName.trim()) {
      Alert.alert("Campo obrigatório", "Informe o nome impresso no cartão.");
      return false;
    }
    return true;
  };

  const handlePay = () => {
    if (!validate()) return;

    const expiryDigits = expiry.replace(/\D/g, "");
    const expiryMonth = expiryDigits.slice(0, 2);
    const expiryYear = `20${expiryDigits.slice(2, 4)}`;

    const cardData = {
      holderName: holderName.trim(),
      number: cardNumber.replace(/\D/g, ""),
      expiryMonth,
      expiryYear,
      ccv: cvv,
    };

    const payload = {
      customerData: JSON.parse(decodeURIComponent(params.data ?? "{}")),
      creditCard: cardData,
      installmentType,
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));
    router.push(`/checkout/processing?data=${encoded}` as any);
  };

  return (
    <Container className="px-4 pb-4">
      <View className="items-center py-4">
        <View className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center mb-3">
          <Ionicons name="card" size={28} color="#006FEE" />
        </View>
        <Text className="text-foreground text-xl font-bold text-center">
          Dados do Cartão
        </Text>
      </View>

      <Surface variant="secondary" className="rounded-xl p-4 mb-4">
        <View className="gap-3">
          <View>
            <Text className="text-foreground text-sm font-medium mb-1">
              Número do cartão
            </Text>
            <Surface variant="primary" className="rounded-xl overflow-hidden">
              <TextInput
                className="text-foreground text-base p-3.5"
                placeholder="0000 0000 0000 0000"
                placeholderTextColor="#888"
                value={cardNumber}
                onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                keyboardType="number-pad"
                maxLength={19}
              />
            </Surface>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-foreground text-sm font-medium mb-1">
                Validade
              </Text>
              <Surface
                variant="primary"
                className="rounded-xl overflow-hidden"
              >
                <TextInput
                  className="text-foreground text-base p-3.5"
                  placeholder="MM/AA"
                  placeholderTextColor="#888"
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </Surface>
            </View>
            <View className="flex-1">
              <Text className="text-foreground text-sm font-medium mb-1">
                CVV
              </Text>
              <Surface
                variant="primary"
                className="rounded-xl overflow-hidden"
              >
                <TextInput
                  className="text-foreground text-base p-3.5"
                  placeholder="000"
                  placeholderTextColor="#888"
                  value={cvv}
                  onChangeText={(v) =>
                    setCvv(v.replace(/\D/g, "").slice(0, 4))
                  }
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </Surface>
            </View>
          </View>

          <View>
            <Text className="text-foreground text-sm font-medium mb-1">
              Nome no cartão
            </Text>
            <Surface variant="primary" className="rounded-xl overflow-hidden">
              <TextInput
                className="text-foreground text-base p-3.5"
                placeholder="Como impresso no cartão"
                placeholderTextColor="#888"
                value={holderName}
                onChangeText={setHolderName}
                autoCapitalize="characters"
              />
            </Surface>
          </View>
        </View>
      </Surface>

      <Text className="text-foreground text-base font-semibold mb-3">
        Tipo de pagamento
      </Text>

      <View className="gap-2 mb-5">
        <Pressable onPress={() => setInstallmentType("DEBIT")}>
          <Surface
            variant={installmentType === "DEBIT" ? "primary" : "secondary"}
            className="rounded-xl p-4 flex-row items-center gap-3"
          >
            <Ionicons
              name="wallet-outline"
              size={22}
              color={installmentType === "DEBIT" ? "#f5a623" : "#888"}
            />
            <View className="flex-1">
              <Text
                className={
                  installmentType === "DEBIT"
                    ? "text-foreground font-semibold text-base"
                    : "text-muted text-base"
                }
              >
                À vista
              </Text>
              <Text className="text-muted text-xs">Débito ou crédito à vista</Text>
            </View>
            {installmentType === "DEBIT" && (
              <Ionicons name="checkmark-circle" size={22} color="#f5a623" />
            )}
          </Surface>
        </Pressable>

        <Pressable onPress={() => setInstallmentType("CREDIT")}>
          <Surface
            variant={installmentType === "CREDIT" ? "primary" : "secondary"}
            className="rounded-xl p-4 flex-row items-center gap-3"
          >
            <Ionicons
              name="calendar-outline"
              size={22}
              color={installmentType === "CREDIT" ? "#f5a623" : "#888"}
            />
            <View className="flex-1">
              <Text
                className={
                  installmentType === "CREDIT"
                    ? "text-foreground font-semibold text-base"
                    : "text-muted text-base"
                }
              >
                Crédito
              </Text>
              <Text className="text-muted text-xs">Parcelamento no cartão</Text>
            </View>
            {installmentType === "CREDIT" && (
              <Ionicons name="checkmark-circle" size={22} color="#f5a623" />
            )}
          </Surface>
        </Pressable>
      </View>

      <Surface variant="secondary" className="rounded-xl p-4 mb-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-muted text-sm">Total</Text>
          <View className="flex-row items-baseline">
            <Text className="text-foreground text-sm">R$ </Text>
            <Text className="text-foreground text-xl font-bold">9,90</Text>
            <Text className="text-muted text-xs">/mês</Text>
          </View>
        </View>
      </Surface>

      <Button size="lg" color="warning" onPress={handlePay}>
        <Button.Label>Pagar R$ 9,90</Button.Label>
      </Button>

      <View className="flex-row items-center justify-center gap-1 mt-3">
        <Ionicons name="lock-closed" size={12} color="#888" />
        <Text className="text-muted text-xs">
          Pagamento seguro processado pelo Asaas
        </Text>
      </View>
    </Container>
  );
}
