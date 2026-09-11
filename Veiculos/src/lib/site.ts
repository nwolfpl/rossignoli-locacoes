/**
 * Configuração da loja. Os contatos abaixo são PLACEHOLDERS do protótipo —
 * substitua pelos dados reais antes de publicar.
 */
export const SITE = {
  name: "Rossignoli Veículos",
  tagline: "Seminovos e usados selecionados em Varginha e região",
  whatsapp: "5535900000000",
  phoneLabel: "(35) 90000-0000",
  email: "contato@rossignoliveiculos.com.br",
  city: "Varginha - MG",
  hours: "Seg a sex, 8h às 18h • Sáb, 8h às 12h",
  url: "https://rossignoliveiculos.com.br",
} as const;

export const whatsappLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
