export type PaymentMethod =
  | "CARD"
  | "MULTICAIXA"
  | "REFERENCE"
  | "TRANSFER"
  | "WALLET"
  | "PAYPAL"
  | "STRIPE";

export type PaymentIntent = {
  id: string;
  reference: string;
  status: "PENDING" | "PAID" | "FAILED";
  amount: number;
  currency: string;
  method: PaymentMethod;
  clientSecret?: string;
  instructions?: string;
};

export interface PaymentGateway {
  id: string;
  name: string;
  available: boolean;
  charge(input: {
    amount: number;
    currency: string;
    method: PaymentMethod;
    metadata: Record<string, string>;
  }): Promise<PaymentIntent>;
}

function mockPaid(method: PaymentMethod, amount: number, currency: string): PaymentIntent {
  const reference = `CMX-${Date.now().toString(36).toUpperCase()}`;
  return {
    id: `pay_${reference}`,
    reference,
    status: "PAID",
    amount,
    currency,
    method,
    instructions:
      method === "REFERENCE"
        ? `Referência Multicaixa: 901 221 334 · Entidade 11333`
        : method === "MULTICAIXA"
          ? "Confirme o pagamento no Multicaixa Express."
          : undefined,
  };
}

export const mockGateway: PaymentGateway = {
  id: "mock",
  name: "CINEMAX Pay (demo)",
  available: true,
  async charge({ amount, currency, method }) {
    const delayed = method === "REFERENCE" || method === "MULTICAIXA" || method === "TRANSFER";
    const paid = mockPaid(method, amount, currency);
    return delayed ? { ...paid, status: "PENDING" } : paid;
  },
};

export function getPaymentGateway(): PaymentGateway {
  return mockGateway;
}

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: "CARD", label: "Cartão", hint: "Visa, Mastercard — dados nunca são armazenados" },
  { id: "MULTICAIXA", label: "Multicaixa Express", hint: "Pagamento instantâneo em Angola" },
  { id: "REFERENCE", label: "Referência de pagamento", hint: "Pague no ATM ou app do banco" },
  { id: "TRANSFER", label: "Transferência", hint: "IBAN CINEMAX (demo)" },
  { id: "WALLET", label: "Carteira digital", hint: "Apple Pay / Google Pay quando configurado" },
  { id: "PAYPAL", label: "PayPal", hint: process.env.PAYPAL_CLIENT_ID ? "Ligado" : "Modo demonstração" },
  { id: "STRIPE", label: "Stripe", hint: process.env.STRIPE_SECRET_KEY ? "Ligado" : "Modo demonstração" },
];
