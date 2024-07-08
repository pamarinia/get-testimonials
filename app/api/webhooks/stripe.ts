import { env } from "@/env";
import { stripe } from "@/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const StripeSignature = req.headers.get("stripe-signature");

  if (!StripeSignature) {
    return NextResponse.json(
      { error: "Stripe signature is missing" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      StripeSignature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }
};
