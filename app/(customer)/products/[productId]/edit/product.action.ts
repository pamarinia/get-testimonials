"use server";

import { prisma } from "@/prisma";
import { ActionError, userAction } from "@/safe-action";
import { z } from "zod";
import { ProductSchema } from "./product.schema";
import { User } from "@prisma/client";
import { resend } from "@/resend";
import { EMAIL_FROM } from "@/config";

const verifiedSlugUniqueness = async (slug: string, productId?: string) => {
  const slugExists = await prisma.product.count({
    where: {
      slug: slug,
      id: productId
        ? {
            not: productId,
          }
        : undefined,
    },
  });

  if (slugExists) {
    throw new ActionError("Slug already exists");
  }
};

const verifyUserPlan = async (user: User) => {
  if (user.plan === "PREMIUM") {
    return;
  }

  const userProductsCount = await prisma.product.count({
    where: {
      userId: user.id,
    },
  });

  if (userProductsCount > 0) {
    throw new ActionError(
      "You need to upgrade to premium to create more products"
    );
  }
};

export const sendEmailIfUserCreatedFirstProduct = async (user: User) => {
  if (user.plan === "PREMIUM") return;

  const userProductsCount = await prisma.product.count({
    where: {
      userId: user.id,
    },
  });

  if (userProductsCount === 1) {
    return;
  }

  await resend.emails.send({
    to: user.email ?? "",
    from: EMAIL_FROM,
    subject: "Welcome to our platform",
    text: "You created your first product",
  });
};

export const createProductAction = userAction
  .schema(ProductSchema)
  .action(async ({ parsedInput: input, ctx: context }) => {
    // verify if slug already exists
    await verifiedSlugUniqueness(input.slug);
    await verifyUserPlan(context.user);

    const product = await prisma.product.create({
      data: {
        ...input,
        userId: context.user.id,
      },
    });

    return { product };
  });

export const updateProductAction = userAction
  .schema(
    z.object({
      id: z.string(),
      data: ProductSchema,
    })
  )
  .action(async ({ parsedInput: { id, data }, ctx: context }) => {
    console.log(id);
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: id,
        userId: context.user.id,
      },
    });

    // Step 2: Handle Non-Existent Product
    if (!existingProduct) {
      throw new Error("Product not found or access denied");
    }
    await verifiedSlugUniqueness(data.slug, id);

    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
        userId: context.user.id,
      },
      data: data,
    });

    return { product: updatedProduct };
  });
