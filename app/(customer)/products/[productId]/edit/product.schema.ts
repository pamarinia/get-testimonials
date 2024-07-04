import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string(),
  slug: z
    .string()
    .regex(/^[a-zA-Z0-9_]*$/)
    .min(10)
    .max(20),
  noteText: z.string().optional(),
  informationText: z.string().optional(),
  reviewText: z.string().optional(),
  thanksTest: z.string().optional(),
  backgroundColor: z.string(),
});

export type ProductType = z.infer<typeof ProductSchema>;

export const GRADIENTS_CLASSES = [
  "bg-gradient-to-r from-rose-400 to-red-500",
  "bg-gradient-to-r from-amber-200 to-yellow-500",
  "bg-gradient-to-r from-blue-200 to-cyan-200",
  "bg-gradient-to-r from-violet-200 to-pink-200",
];
