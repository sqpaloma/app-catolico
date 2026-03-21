"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

type CreateSubscriptionResult = {
  orderId: Id<"orders">;
  subscriptionId: string;
  asaasPaymentId: string | null;
  paymentLink: string | null;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
  pixQrCode: string | null;
  pixCopiaECola: string | null;
  boletoLinhaDigitavel: string | null;
  pixFetchFailed: boolean;
  boletoLineFailed: boolean;
};

type RefreshPaymentResult = {
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
  paymentLink: string | null;
  pixQrCode: string | null;
  pixCopiaECola: string | null;
  boletoLinhaDigitavel: string | null;
};

function getAsaasBaseUrl(): string {
  const raw = (process.env.ASAAS_ENVIRONMENT ?? "").trim().toLowerCase();
  if (raw === "sandbox") {
    return "https://sandbox.asaas.com/api/v3";
  }
  return "https://api.asaas.com/v3";
}

function truncateDetail(text: string, max = 800): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

function formatAsaasFailure(status: number, bodyText: string): string {
  if (status === 401) {
    return "Asaas recusou a autenticação (401). Confira ASAAS_API_KEY no Dashboard do Convex e se ASAAS_ENVIRONMENT=sandbox combina com uma chave de sandbox.";
  }
  try {
    const j = JSON.parse(bodyText) as { errors?: Array<{ description?: string }> };
    const desc = j.errors?.map((e) => e.description).filter(Boolean).join(" — ");
    if (desc) return `Asaas (${status}): ${truncateDetail(desc)}`;
  } catch {
    /* ignore */
  }
  return `Asaas (${status}): ${truncateDetail(bodyText)}`;
}

async function asaasFetch(path: string, options: RequestInit = {}) {
  const apiKey = process.env.ASAAS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "ASAAS_API_KEY não configurada. Defina em Convex → Settings → Environment Variables (não basta .env.local).",
    );
  }

  const base = getAsaasBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(formatAsaasFailure(res.status, body));
  }

  return res.json();
}

/** GET que não lança (ex.: QR Pix ainda indisponível). */
async function asaasGetOptional(path: string): Promise<any | null> {
  const apiKey = process.env.ASAAS_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const base = getAsaasBaseUrl();
    const res = await fetch(`${base}${path}`, {
      headers: {
        "Content-Type": "application/json",
        access_token: apiKey,
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

function isValidCpfCnpj(digits: string): boolean {
  return digits.length === 11 || digits.length === 14;
}

async function ensureAsaasCustomer(params: {
  existingCustomerId: string | undefined;
  name: string;
  email: string;
  cpfCnpjDigits: string | undefined;
}): Promise<string> {
  const { existingCustomerId, name, email, cpfCnpjDigits } = params;

  if (existingCustomerId) {
    const body: Record<string, unknown> = {
      name,
      email,
      notificationDisabled: false,
    };
    if (cpfCnpjDigits) body.cpfCnpj = cpfCnpjDigits;

    await asaasFetch(`/customers/${existingCustomerId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return existingCustomerId;
  }

  const body: Record<string, unknown> = {
    name,
    email,
    notificationDisabled: false,
  };
  if (cpfCnpjDigits) body.cpfCnpj = cpfCnpjDigits;

  try {
    const customer = await asaasFetch("/customers", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return customer.id as string;
  } catch (createErr) {
    let listed: { data?: Array<{ id?: string }> };
    try {
      listed = await asaasFetch(
        `/customers?email=${encodeURIComponent(email)}`,
      );
    } catch {
      throw createErr;
    }
    const first = listed.data?.[0];
    if (first?.id) {
      const id = first.id as string;
      await asaasFetch(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          email,
          notificationDisabled: false,
          ...(cpfCnpjDigits ? { cpfCnpj: cpfCnpjDigits } : {}),
        }),
      });
      return id;
    }
    throw createErr;
  }
}

async function getFirstSubscriptionPayment(
  subscriptionId: string,
): Promise<any | null> {
  try {
    const payments = await asaasFetch(
      `/subscriptions/${subscriptionId}/payments`,
    );
    if (!payments.data || payments.data.length === 0) return null;
    return payments.data[0];
  } catch {
    return null;
  }
}

async function fetchPixInstructions(paymentId: string): Promise<{
  pixQrCode: string | null;
  pixCopiaECola: string | null;
}> {
  const data = await asaasGetOptional(`/payments/${paymentId}/pixQrCode`);
  if (!data) {
    return { pixQrCode: null, pixCopiaECola: null };
  }
  const encoded =
    (data.encodedImage as string) ?? (data.qrCodeBase64 as string) ?? null;
  const payload =
    (data.payload as string) ?? (data.copyPaste as string) ?? null;
  return { pixQrCode: encoded, pixCopiaECola: payload };
}

async function fetchBoletoInstructions(paymentId: string): Promise<{
  boletoLinhaDigitavel: string | null;
}> {
  const data = await asaasGetOptional(
    `/payments/${paymentId}/identificationField`,
  );
  if (!data) return { boletoLinhaDigitavel: null };
  const line =
    (data.identificationField as string) ??
    (data.barCode as string) ??
    null;
  return { boletoLinhaDigitavel: line };
}

const billingTypeArg = v.union(
  v.literal("PIX"),
  v.literal("BOLETO"),
  v.literal("CREDIT_CARD"),
);

export const createSubscription = action({
  args: {
    email: v.string(),
    name: v.string(),
    billingType: billingTypeArg,
    cpfCnpj: v.optional(v.string()),
  },
  handler: async (ctx, { email, name, billingType, cpfCnpj }): Promise<CreateSubscriptionResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const user = await ctx.runQuery(internal.users.getMeInternal, {
      clerkId: identity.subject,
    });

    if (!user) throw new Error("Usuário não encontrado");
    if (user.isPremium) throw new Error("Você já é premium");

    const cpfDigits = cpfCnpj ? onlyDigits(cpfCnpj) : undefined;
    if (billingType === "BOLETO") {
      if (!cpfDigits || !isValidCpfCnpj(cpfDigits)) {
        throw new Error(
          "Para boleto informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.",
        );
      }
    }

    let asaasCustomerId = user.asaasCustomerId;

    asaasCustomerId = await ensureAsaasCustomer({
      existingCustomerId: asaasCustomerId,
      name,
      email,
      cpfCnpjDigits: cpfDigits,
    });

    if (!user.asaasCustomerId) {
      await ctx.runMutation(internal.users.setAsaasCustomerId, {
        userId: user._id,
        asaasCustomerId,
      });
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const dueDateStr = nextDueDate.toISOString().split("T")[0];

    const subscription = await asaasFetch("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType,
        value: 9.9,
        nextDueDate: dueDateStr,
        cycle: "MONTHLY",
        description: "Assinatura Premium - App Católico",
      }),
    });

    await ctx.runMutation(internal.users.setAsaasCustomerId, {
      userId: user._id,
      asaasCustomerId,
      asaasSubscriptionId: subscription.id,
    });

    const paymentLink = subscription.paymentLink ?? null;

    const orderId = await ctx.runMutation(internal.orders.create, {
      userId: identity.subject,
      asaasCustomerId,
      asaasSubscriptionId: subscription.id,
      billingType,
      value: 9.9,
      paymentLink: paymentLink ?? undefined,
    });

    const firstPayment = await getFirstSubscriptionPayment(subscription.id);
    const paymentId = firstPayment?.id as string | undefined;

    let invoiceUrl = (firstPayment?.invoiceUrl as string) ?? null;
    let bankSlipUrl = (firstPayment?.bankSlipUrl as string) ?? null;
    let pixQrCode =
      (firstPayment?.pix?.encodedImage as string) ??
      (firstPayment?.pix?.qrCodeBase64 as string) ??
      null;
    let pixCopiaECola =
      (firstPayment?.pix?.payload as string) ??
      (firstPayment?.pix?.copyPaste as string) ??
      null;
    let boletoLinhaDigitavel: string | null = null;

    if (paymentId) {
      if (billingType === "PIX") {
        const pix = await fetchPixInstructions(paymentId);
        if (pix.pixQrCode) pixQrCode = pix.pixQrCode;
        if (pix.pixCopiaECola) pixCopiaECola = pix.pixCopiaECola;
      } else if (billingType === "BOLETO") {
        const boleto = await fetchBoletoInstructions(paymentId);
        boletoLinhaDigitavel = boleto.boletoLinhaDigitavel;
      }
    }

    return {
      orderId,
      subscriptionId: subscription.id as string,
      asaasPaymentId: paymentId ?? null,
      paymentLink,
      invoiceUrl,
      bankSlipUrl,
      pixQrCode,
      pixCopiaECola,
      boletoLinhaDigitavel,
      pixFetchFailed: Boolean(
        billingType === "PIX" &&
          paymentId &&
          !pixQrCode &&
          !pixCopiaECola,
      ),
      boletoLineFailed: Boolean(
        billingType === "BOLETO" && paymentId && !boletoLinhaDigitavel,
      ),
    };
  },
});

export const refreshPaymentInstructions = action({
  args: {
    asaasPaymentId: v.string(),
  },
  handler: async (ctx, { asaasPaymentId }): Promise<RefreshPaymentResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const payment = await asaasFetch(`/payments/${asaasPaymentId}`);
    const subscriptionId = payment.subscription as string | undefined;
    if (!subscriptionId) {
      throw new Error("Cobrança sem assinatura vinculada.");
    }

    const order = await ctx.runQuery(internal.orders.getBySubscriptionForUser, {
      asaasSubscriptionId: subscriptionId,
      userId: identity.subject,
    });
    if (!order) {
      throw new Error("Cobrança não encontrada para sua conta.");
    }

    const billingType = payment.billingType as string;
    let pixQrCode: string | null = null;
    let pixCopiaECola: string | null = null;
    let boletoLinhaDigitavel: string | null = null;

    if (billingType === "PIX") {
      const pix = await fetchPixInstructions(asaasPaymentId);
      pixQrCode = pix.pixQrCode;
      pixCopiaECola = pix.pixCopiaECola;
    } else if (billingType === "BOLETO") {
      const boleto = await fetchBoletoInstructions(asaasPaymentId);
      boletoLinhaDigitavel = boleto.boletoLinhaDigitavel;
    }

    return {
      invoiceUrl: (payment.invoiceUrl as string) ?? null,
      bankSlipUrl: (payment.bankSlipUrl as string) ?? null,
      paymentLink: order.paymentLink ?? null,
      pixQrCode,
      pixCopiaECola,
      boletoLinhaDigitavel,
    };
  },
});

type CreateCardPaymentResult = {
  orderId: Id<"orders">;
  subscriptionId: string;
  asaasPaymentId: string | null;
  status: string;
};

export const createCardPayment = action({
  args: {
    email: v.string(),
    name: v.string(),
    cpfCnpj: v.string(),
    phone: v.string(),
    postalCode: v.string(),
    addressNumber: v.string(),
    creditCard: v.object({
      holderName: v.string(),
      number: v.string(),
      expiryMonth: v.string(),
      expiryYear: v.string(),
      ccv: v.string(),
    }),
    installmentCount: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<CreateCardPaymentResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const user = await ctx.runQuery(internal.users.getMeInternal, {
      clerkId: identity.subject,
    });
    if (!user) throw new Error("Usuário não encontrado");
    if (user.isPremium) throw new Error("Você já é premium");

    const cpfDigits = onlyDigits(args.cpfCnpj);
    if (!isValidCpfCnpj(cpfDigits)) {
      throw new Error("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
    }

    let asaasCustomerId = user.asaasCustomerId;
    asaasCustomerId = await ensureAsaasCustomer({
      existingCustomerId: asaasCustomerId,
      name: args.name,
      email: args.email,
      cpfCnpjDigits: cpfDigits,
    });

    if (!user.asaasCustomerId) {
      await ctx.runMutation(internal.users.setAsaasCustomerId, {
        userId: user._id,
        asaasCustomerId,
      });
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const dueDateStr = nextDueDate.toISOString().split("T")[0];

    const subscriptionBody: Record<string, unknown> = {
      customer: asaasCustomerId,
      billingType: "CREDIT_CARD",
      value: 9.9,
      nextDueDate: dueDateStr,
      cycle: "MONTHLY",
      description: "Assinatura Premium - App Católico",
      creditCard: {
        holderName: args.creditCard.holderName,
        number: onlyDigits(args.creditCard.number),
        expiryMonth: args.creditCard.expiryMonth,
        expiryYear: args.creditCard.expiryYear,
        ccv: args.creditCard.ccv,
      },
      creditCardHolderInfo: {
        name: args.name,
        email: args.email,
        cpfCnpj: cpfDigits,
        postalCode: onlyDigits(args.postalCode),
        addressNumber: args.addressNumber,
        phone: onlyDigits(args.phone),
      },
    };

    if (args.installmentCount && args.installmentCount > 1) {
      subscriptionBody.installmentCount = args.installmentCount;
    }

    const subscription = await asaasFetch("/subscriptions", {
      method: "POST",
      body: JSON.stringify(subscriptionBody),
    });

    await ctx.runMutation(internal.users.setAsaasCustomerId, {
      userId: user._id,
      asaasCustomerId,
      asaasSubscriptionId: subscription.id,
    });

    const orderId = await ctx.runMutation(internal.orders.create, {
      userId: identity.subject,
      asaasCustomerId,
      asaasSubscriptionId: subscription.id,
      billingType: "CREDIT_CARD",
      value: 9.9,
      paymentLink: subscription.paymentLink ?? undefined,
    });

    const firstPayment = await getFirstSubscriptionPayment(subscription.id);
    const paymentId = (firstPayment?.id as string) ?? null;
    const paymentStatus = (firstPayment?.status as string) ?? "PENDING";

    return {
      orderId,
      subscriptionId: subscription.id as string,
      asaasPaymentId: paymentId,
      status: paymentStatus,
    };
  },
});

export const getSubscriptionPayments = action({
  args: {
    asaasSubscriptionId: v.string(),
  },
  handler: async (ctx, { asaasSubscriptionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const order = await ctx.runQuery(internal.orders.getBySubscriptionForUser, {
      asaasSubscriptionId,
      userId: identity.subject,
    });
    if (!order) throw new Error("Assinatura não encontrada.");

    const payments = await asaasFetch(
      `/subscriptions/${asaasSubscriptionId}/payments`,
    );

    return (
      payments.data?.map((p: any) => ({
        id: p.id,
        status: p.status,
        billingType: p.billingType,
        value: p.value,
        dueDate: p.dueDate,
        paymentDate: p.paymentDate,
        invoiceUrl: p.invoiceUrl,
        bankSlipUrl: p.bankSlipUrl,
      })) ?? []
    );
  },
});
