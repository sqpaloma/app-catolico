import { api } from "@app-catolico/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Spinner, Surface } from "heroui-native";
import React from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { Container } from "@/components/container";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { label: "Pendente", color: "#f5a623", icon: "time-outline" },
  confirmed: { label: "Confirmado", color: "#4caf50", icon: "checkmark-circle-outline" },
  received: { label: "Recebido", color: "#4caf50", icon: "checkmark-done-outline" },
  overdue: { label: "Vencido", color: "#f44336", icon: "alert-circle-outline" },
  refunded: { label: "Reembolsado", color: "#9e9e9e", icon: "arrow-undo-outline" },
  cancelled: { label: "Cancelado", color: "#9e9e9e", icon: "close-circle-outline" },
};

const BILLING_LABELS: Record<string, string> = {
  PIX: "PIX",
  BOLETO: "Boleto",
  CREDIT_CARD: "Cartão",
  UNDEFINED: "—",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export default function InvoicesScreen() {
  const invoices = useQuery(api.invoices.getMyInvoices);

  if (invoices === undefined) {
    return (
      <Container className="px-4 pb-4">
        <View className="flex-1 items-center justify-center py-20">
          <Spinner size="lg" />
        </View>
      </Container>
    );
  }

  if (invoices.length === 0) {
    return (
      <Container className="px-4 pb-4">
        <View className="flex-1 items-center justify-center py-20">
          <Ionicons name="receipt-outline" size={48} color="#888" />
          <Text className="text-muted text-base mt-4">
            Nenhuma fatura encontrada
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container className="px-4 pb-4">
      <View className="py-6">
        <Text className="text-foreground text-xl font-bold">Minhas Faturas</Text>
        <Text className="text-muted text-sm mt-1">
          Histórico de pagamentos da assinatura
        </Text>
      </View>

      <View className="gap-3">
        {invoices.map((inv) => {
          const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.pending;
          const hasPaymentAction =
            inv.status === "pending" &&
            (inv.invoiceUrl || inv.bankSlipUrl);

          return (
            <Pressable
              key={inv._id}
              onPress={() => {
                const url = inv.invoiceUrl || inv.bankSlipUrl;
                if (url) Linking.openURL(url);
              }}
              disabled={!hasPaymentAction}
            >
              <Surface variant="secondary" className="rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name={cfg.icon} size={18} color={cfg.color} />
                    <Text style={{ color: cfg.color }} className="text-sm font-semibold">
                      {cfg.label}
                    </Text>
                  </View>
                  <Text className="text-foreground text-base font-bold">
                    {formatCurrency(inv.value)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-muted text-xs">
                    Vencimento: {formatDate(inv.dueDate)}
                  </Text>
                  <Text className="text-muted text-xs">
                    {BILLING_LABELS[inv.billingType] ?? inv.billingType}
                  </Text>
                </View>

                {inv.paymentDate && (
                  <Text className="text-muted text-xs mt-1">
                    Pago em: {formatDate(inv.paymentDate)}
                  </Text>
                )}

                {inv.boletoLinhaDigitavel ? (
                  <Text
                    className="text-foreground text-xs font-mono mt-2"
                    selectable
                    numberOfLines={2}
                  >
                    {inv.boletoLinhaDigitavel}
                  </Text>
                ) : null}

                {hasPaymentAction && (
                  <View className="flex-row items-center gap-1 mt-2">
                    <Ionicons name="open-outline" size={14} color="#f5a623" />
                    <Text className="text-warning text-xs font-semibold">
                      Abrir para pagar
                    </Text>
                  </View>
                )}
              </Surface>
            </Pressable>
          );
        })}
      </View>
    </Container>
  );
}
