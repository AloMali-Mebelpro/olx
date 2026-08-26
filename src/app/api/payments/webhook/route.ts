import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getPromotionPlan } from "@/lib/promotion";
import Stripe from "stripe";

// Trusting a webhook is the only safe way to mark a listing as paid/promoted
// — never do this from the client redirect alone, since that can be spoofed.
export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook не настроен" }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature ?? "",
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Неверная подпись webhook" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const listingId = session.metadata?.listingId;
    const planId = session.metadata?.planId;
    const plan = planId ? getPromotionPlan(planId) : undefined;

    if (listingId && plan) {
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "PAID" },
      });

      const promotedUntil = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000);
      await prisma.listing.update({
        where: { id: listingId },
        data: {
          isPromoted: true,
          promotedUntil,
          promotionAmount: plan.priceCents,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
