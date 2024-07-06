"use server";

import { prisma } from "@/prisma";
import { ActionError, userAction } from "@/safe-action";
import { z } from "zod";
import { ProductSchema } from "./product.schema";

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

export const createProductAction = userAction
  .schema(ProductSchema)
  .action(async ({ parsedInput: input, ctx: context }) => {
    // verify if slug already exists
    await verifiedSlugUniqueness(input.slug);

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
