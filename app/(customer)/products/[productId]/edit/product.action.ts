"use server";

import { prisma } from "@/prisma";
import { ActionError, userAction } from "@/safe-action";
import { ProductSchema } from "./product.schema";

export const createProductAction = userAction
  .schema(ProductSchema)
  .action(async ({ parsedInput: input, ctx: context }) => {
    // verify if slug already exists
    const slugExists = await prisma.product.count({
      where: {
        slug: input.slug,
      },
    });

    if (slugExists) {
      throw new ActionError("Slug already exists");
    }
    console.log(input);
    const product = await prisma.product.create({
      data: {
        ...input,
        userId: context.user.id,
      },
    });

    return { product };
  });

export const editProductAction = async () => {};
