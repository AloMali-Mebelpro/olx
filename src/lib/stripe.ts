import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

// Lazily constructed so the app can still boot (and every other feature keep
// working) when Stripe hasn't been configured yet. Routes that need it call
// getStripe() and surface a clear error if it's missing.
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env to enable payments."
    );
  }
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(secretKey);
}
