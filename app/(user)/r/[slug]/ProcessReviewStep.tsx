"use client";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Product, Review } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useLocalStorage } from "react-use";
import { toast } from "sonner";
import RatingSelector from "./RatingSelector";
import { ReviewType } from "./review.schema";
import { getReviewAction, updateReviewAction } from "./reviews.action";
import { ReviewTextSelector } from "./ReviewTextSelector";
import { SocialSelector } from "./SocialSelector";

const getCurrentStep = (data?: Review) => {
  if (!data) return 0;

  if (data.rating === undefined) {
    return 0;
  }

  if (!data.name || !data.socialLink) {
    return 1;
  }

  if (!data.text) {
    return 2;
  }

  return 3;
};

export const ProcessReviewsStep = ({ product }: { product: Product }) => {
  const [reviewId, setReviewId, removeReviewId] = useLocalStorage<
    null | string
  >(`review-id-${product.id}`, null);

  console.log("reviewIdstart", reviewId);

  const queryClient = useQueryClient();

  const reviewData = useQuery({
    queryKey: ["review", reviewId, "product", product.id],
    enabled: Boolean(reviewId),
    queryFn: async () => {
      const result = await getReviewAction({
        id: reviewId ?? "",
        productId: product.id,
      });

      if (result?.serverError || !result?.data) {
        toast.error(result?.serverError || "Failed to fetch review");
        return;
      }
      return result.data;
    },
  });

  const mutateReview = useMutation({
    mutationFn: async (data: Partial<ReviewType>) => {
      const result = await updateReviewAction({
        ...data,
        id: reviewId ?? "",
        productId: product.id,
      });

      if (result?.serverError || !result?.data) {
        toast.error(result?.serverError || "Failed to save review");
        return;
      }

      setReviewId(result.data.id);

      await queryClient.invalidateQueries({
        queryKey: ["review", result.data.id, "product", product.id],
      });
    },
  });

  const updateData = (partial: Partial<ReviewType>) => {
    mutateReview.mutate(partial);
  };

  const step = getCurrentStep(reviewData.data);

  return (
    <div
      className={cn("h-full", {
        "animate-pulse": mutateReview.isPending,
      })}
    >
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-0"
            exit={{ opacity: 0, x: -100 }}
            className="flex h-full flex-col items-center justify-center gap-4"
          >
            <h2 className="text-lg font-bold">
              {product.noteText ?? `How much did you like ${product.name} ?`}
            </h2>
            <RatingSelector
              onSelect={(review) => {
                updateData({ rating: review });
              }}
            />
          </motion.div>
        )}
        {step === 1 && (
          <motion.div
            key="step-1"
            exit={{ opacity: 0, x: -100 }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex h-full flex-col items-center justify-center gap-4"
          >
            <h2 className="text-lg font-bold">
              {product.informationText ?? `I need more informations about you`}
            </h2>
            <SocialSelector
              onSelect={(name, url) => {
                updateData({ name: name, socialLink: url });
              }}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            key="step-2"
            exit={{ opacity: 0, x: -100 }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex h-full flex-col items-center justify-center gap-4"
          >
            <h2 className="text-lg font-bold">
              {product.reviewText ??
                `Tell me what you liked and what you disliked`}
            </h2>
            <ReviewTextSelector
              onInputSend={(i) => {
                updateData({ text: i });
              }}
              productId={product.id}
            />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div
            key="step-3"
            exit={{ opacity: 0, x: -100 }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex h-full max-w-lg flex-col items-center justify-center gap-4"
          >
            <h2 className="text-lg font-bold">
              {product.thanksTest ??
                `Thanks for your review, you can edit it if you want`}
            </h2>
            <Card>
              <CardHeader>
                <CardDescription>
                  <p>Your review : {reviewData.data?.text}</p>
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
