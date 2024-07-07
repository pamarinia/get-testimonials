"use server";

import { openai } from "@/openai";
import { prisma } from "@/prisma";
import { action, ActionError } from "@/safe-action";
import { Review } from "@prisma/client";
import { headers } from "next/headers";
import { z } from "zod";
import { ReviewSchema } from "./review.schema";

export const getReviewAction = action
  .schema(z.object({ productId: z.string(), id: z.string() }))
  .action(async ({ parsedInput: input }) => {
    const review = await prisma.review.findUnique({
      where: {
        id: input.id,
        productId: input.productId,
      },
    });

    if (!review) {
      throw new ActionError("Review not found");
    }
    return review;
  });

export const updateReviewAction = action
  .schema(ReviewSchema)
  .action(async ({ parsedInput: input }) => {
    const headerList = headers();
    const userIp =
      headerList.get("x-real-ip") || headerList.get("x-forwarded-for");
    if (!userIp) {
      throw new ActionError("User Ip not found");
    }

    let review: Review | null = null;

    if (input.id) {
      review = await prisma.review.findUnique({
        where: {
          id: input.id,
          ip: userIp,
          productId: input.productId,
        },
      });

      if (!review) {
        throw new ActionError("Review not found");
      }

      review = await prisma.review.update({
        where: {
          id: input.id,
        },
        data: {
          rating: input.rating ?? review.rating,
          text: input.text ?? review.text,
          audio: input.audio ?? review.audio,
          socialLink: input.socialLink ?? review.socialLink,
          name: input.name ?? review.name,
        },
      });
    } else {
      review = await prisma.review.create({
        data: {
          productId: input.productId,
          ip: userIp,
          rating: input.rating ?? 0,
          text: input.text,
          audio: input.audio,
          socialLink: input.socialLink,
          name: input.name,
        },
      });
    }

    return review;
  });

export const processAudioAction = action
  .schema(
    z.object({
      formData: z.instanceof(FormData),
      reviewId: z.string(),
      productId: z.string(),
    })
  )
  .action(async ({ parsedInput: input }) => {
    const headerList = headers();
    const userIp =
      headerList.get("x-real-ip") || headerList.get("x-forwarded-for");

    if (!userIp) {
      throw new ActionError("User Ip not found");
    }

    const review = await prisma.review.findUnique({
      where: {
        id: input.reviewId,
        ip: userIp,
        productId: input.productId,
      },
      include: {
        product: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (!review) {
      throw new ActionError("Review not found");
    }

    if (review.text) {
      throw new ActionError("Review already has text");
    }

    const audioFile = input.formData.get("audio");

    const result = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    if (!result.text) {
      throw new ActionError("Failed to transcribe audio");
    }

    const finalResult = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `Context: You are a transcriptionist transcribing an audio reviex for a product. The audio is about "${review.product.name}".
          Goal: You need to transcript and organize the audio review into a written review. The review should be clear and concise. It should be easy to understand and should be helpful for other customers.
          Criteria:
          1. The review should be well-strucutred and organized.
          2. The review should be easy to understand.
          3. The review should be helpful for other customers.
          4. The review should be concise and clear.
          5. The review must respect what the customer said in the audio review.`,
        },
        {
          role: "user",
          content: result.text,
        },
      ],
    });

    const resultText = finalResult.choices[0].message.content;

    await prisma.review.update({
      where: {
        id: input.reviewId,
      },
      data: {
        text: resultText,
      },
    });

    return review;
  });
