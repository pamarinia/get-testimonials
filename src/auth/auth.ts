import { env } from "@/env";
import { stripe } from "@/stripe";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const prisma = new PrismaClient();

export const {
  handlers,
  auth: baseAuth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  theme: {
    logo: "/icon-title.png",
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  events: {
    createUser: async (message) => {
      const userId = message.user.id;
      const userEmail = message.user.email;

      if (!userEmail || !userId) {
        return;
      }

      const stripCustomer = await stripe.customers.create({
        name: message.user.name ?? "",
        email: userEmail,
      });

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          stripeCustomerId: stripCustomer.id,
        },
      });
    },
  },
});
