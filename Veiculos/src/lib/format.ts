export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export const formatKm = (value: number) =>
  `${value.toLocaleString("pt-BR")} km`;

export const formatYear = (year: number, modelYear: number) =>
  year === modelYear ? `${year}` : `${year}/${modelYear}`;

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Dias desde a publicação — usado no selo "Novo anúncio". */
export const daysSince = (iso: string) =>
  Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
