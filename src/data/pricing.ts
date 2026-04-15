export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  empresas: number;
  features: string[];
  popular?: boolean;
  mercadoPagoUrl: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "basico",
    name: "Básico",
    price: 4990,
    priceFormatted: "$4.990",
    empresas: 500,
    features: [
      "Descarga en .CSV",
      "Filtros por Región",
      "Soporte por Email",
    ],
    mercadoPagoUrl: "https://mpago.la/1ngFLgK",
  },
  {
    id: "starter",
    name: "Starter",
    price: 14990,
    priceFormatted: "$14.990",
    empresas: 1000,
    features: [
      "Descarga en .CSV",
      "Filtros Básicos",
      "Soporte por Email",
    ],
    mercadoPagoUrl: "https://mpago.la/1rpeu28",
  },
  {
    id: "business",
    name: "Business",
    price: 39990,
    priceFormatted: "$39.990",
    empresas: 3000,
    features: [
      "Todo de Starter",
      "Limpieza de Duplicados",
      "Extra Emails y Redes Sociales",
      "Soporte Prioritario",
    ],
    popular: true,
    mercadoPagoUrl: "https://mpago.la/2iqtw4s",
  },
  {
    id: "master",
    name: "Master",
    price: 64990,
    priceFormatted: "$64.990",
    empresas: 5000,
    features: [
      "Todo de Business",
      "Formato .CSV y Excel",
      "Actualización Recurrente",
      "Soporte VIP",
    ],
    mercadoPagoUrl: "https://mpago.la/19bCNhS",
  },
];
