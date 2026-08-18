export type PaymentMethod =
  | "CARD"
  | "MULTICAIXA"
  | "REFERENCE"
  | "TRANSFER"
  | "WALLET"
  | "PAYPAL"
  | "STRIPE";

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: "CARD", label: "Cartão", hint: "Visa, Mastercard — dados nunca são armazenados" },
  { id: "MULTICAIXA", label: "Multicaixa Express", hint: "Pagamento instantâneo em Angola" },
  { id: "REFERENCE", label: "Referência de pagamento", hint: "Pague no ATM ou app do banco" },
  { id: "TRANSFER", label: "Transferência", hint: "IBAN CINEMAX (demo)" },
  { id: "WALLET", label: "Carteira digital", hint: "Apple Pay / Google Pay quando configurado" },
  { id: "PAYPAL", label: "PayPal", hint: "Modo demonstração até configurar credenciais" },
  { id: "STRIPE", label: "Stripe", hint: "Modo demonstração até configurar credenciais" },
];
