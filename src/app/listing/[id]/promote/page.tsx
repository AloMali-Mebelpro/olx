"use client";

import { use, useState } from "react";
import { PROMOTION_PLANS } from "@/lib/promotion";

export default function PromoteListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [planId, setPlanId] = useState(PROMOTION_PLANS[1].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: id, planId }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.url) {
      setLoading(false);
      setError(data.error || "Не удалось начать оплату");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Поднять объявление в топ</h1>
      <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <p className="text-sm text-zinc-500">
          Выберите тариф. После оплаты картой объявление будет закреплено в
          топе выдачи и в поиске на выбранный срок.
        </p>

        <div className="flex flex-col gap-2">
          {PROMOTION_PLANS.map((plan) => (
            <label
              key={plan.id}
              className={`flex cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm ${
                planId === plan.id
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="plan"
                  checked={planId === plan.id}
                  onChange={() => setPlanId(plan.id)}
                />
                Топ на {plan.days} дн.
              </span>
              <span className="font-semibold">
                {(plan.priceCents / 100).toFixed(2)} {plan.currency.toUpperCase()}
              </span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="rounded-full bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Переходим к оплате..." : "Оплатить картой"}
        </button>
      </div>
    </div>
  );
}
