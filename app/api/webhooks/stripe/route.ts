import { env } from "@/env";
import { prisma } from "@/prisma";
import { resend } from "@/resend";
import { stripe } from "@/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import PremiumEmail from "../../../../emails/PremiumEmail";
import { EMAIL_FROM } from "@/config";
import DowngradeEmail from "../../../../emails/DowngradeEmail";

export const POST = async (req: NextRequest) => {
  const body = await req.text();
  const StripeSignature = req.headers.get("stripe-signature");

  if (!StripeSignature) {
    return NextResponse.json(
      { error: "Stripe signature is missing" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      StripeSignature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid Stripe Signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerId = session.customer as string;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email ?? "",
        subject: "Welcome to Premium User",
        react: PremiumEmail(),
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "PREMIUM" },
      });
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;

      const customerId = invoice.customer as string;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "PREMIUM" },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId = subscription.customer as string;

      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      await resend.emails.send({
        from: EMAIL_FROM,
        to: user.email ?? "",
        subject: "You are now a FREE user",
        react: DowngradeEmail(),
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "FREE" },
      });
      break;
    }
    default: {
      console.log(`Unhandled event type: ${event.type}`);
    }
  }
};
