import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PromoteSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { session_id } = await searchParams;

  const payment = session_id
    ? await prisma.payment.findUnique({ where: { stripeSessionId: session_id } })
    : null;

  return (
    <div className="mx-auto max-w-md rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="mb-2 text-2xl font-bold">Спасибо за оплату!</h1>
      {payment?.status === "PAID" ? (
        <p className="text-zinc-600 dark:text-zinc-300">
          Объявление уже поднято в топ.
        </p>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-300">
          Платёж получен, объявление поднимется в топ в течение минуты, как
          только подтвердится оплата.
        </p>
      )}
      <Link
        href={`/listing/${id}`}
        className="mt-4 inline-block rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Вернуться к объявлению
      </Link>
    </div>
  );
}
