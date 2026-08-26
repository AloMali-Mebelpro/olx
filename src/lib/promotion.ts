// Promotion pricing is controlled by the site owner here — edit `priceCents`
// or `days` to change what sellers pay to get their listing to the top.
export type PromotionPlan = {
  id: string;
  days: number;
  priceCents: number;
  currency: string;
};

export const PROMOTION_PLANS: PromotionPlan[] = [
  { id: "day3", days: 3, priceCents: 300, currency: "usd" },
  { id: "day7", days: 7, priceCents: 600, currency: "usd" },
  { id: "day14", days: 14, priceCents: 1000, currency: "usd" },
];

export function getPromotionPlan(id: string): PromotionPlan | undefined {
  return PROMOTION_PLANS.find((p) => p.id === id);
}
