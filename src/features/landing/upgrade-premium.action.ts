"use server";

import { env } from "@/env";
import { ActionError, userAction } from "@/safe-action";
import { stripe } from "@/stripe";
import { redirect } from "next/navigation";
import { z } from "zod";

export const upgradeToPremium = userAction
  .schema(z.string())
  .action(async ({ parsedInput: input, ctx: context }) => {
    const stripeCustomerId = context.user.stripeCustomerId;

    if (!stripeCustomerId) {
      throw new ActionError("User does not have a stripe customer id");
    }

    const stripeCheckout = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card", "link"],
      mode: "subscription",
      line_items: [
        {
          price:
            env.NODE_ENV === "development"
              ? "price_1PaQ6YRozhtvH9OBIgQSWDqZ"
              : "price_1JZ3ZzJ9bJ6Z2ZzJ",
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/upgrade/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/upgrade/cancel`,
    });

    if (!stripeCheckout.url) {
      throw new ActionError("Stripe checkout url is missing");
    }

    redirect(stripeCheckout.url);
  });
