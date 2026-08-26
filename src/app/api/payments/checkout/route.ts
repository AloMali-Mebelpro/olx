import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getPromotionPlan } from "@/lib/promotion";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Приём платежей ещё не настроен (нет STRIPE_SECRET_KEY)" },
      { status: 503 }
    );
  }

  const { listingId, planId } = (await req.json()) ?? {};
  const plan = getPromotionPlan(planId);

  if (!listingId || !plan) {
    return NextResponse.json({ error: "Некорректные параметры" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Объявление не найдено" }, { status: 404 });
  }

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: plan.currency,
          unit_amount: plan.priceCents,
          product_data: {
            name: `Продвижение объявления в топ на ${plan.days} дн.: ${listing.title}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { listingId, planId },
    success_url: `${baseUrl}/listing/${listingId}/promote/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/listing/${listingId}/promote`,
  });

  await prisma.payment.create({
    data: {
      listingId,
      planId,
      amount: plan.priceCents,
      currency: plan.currency,
      stripeSessionId: session.id,
      status: "PENDING",
    },
  });

  return NextResponse.json({ url: session.url });
}
