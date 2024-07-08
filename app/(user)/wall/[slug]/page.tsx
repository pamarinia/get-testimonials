/* eslint-disable @next/next/no-img-element */
import { Layout } from "@/components/layout";
import { prisma } from "@/prisma";
import { PageParams } from "@/types/next";
import { notFound } from "next/navigation";
import { ReviewItem } from "./ReviewCard";

export const maxDuration = 300;

export default async function RoutePage(props: PageParams<{ slug: string }>) {
  const product = await prisma.product.findFirst({
    where: {
      slug: props.params.slug,
    },
    include: {
      reviews: {
        where: {
          text: {
            not: null,
          },
          name: {
            not: null,
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // calcule la moyenne des review du produit
  const review = product.reviews.reduce(
    (acc, review) => acc + review.rating,
    0
  );

  return (
    <Layout className="my-12 flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 ">
        {product.image ? (
          <img className="size-12" src={product.image} alt={product.name} />
        ) : null}
        <h1 className="text-4xl font-bold">{product.name}</h1>
      </div>
      <div>
        <h2 className="text-4xl font-extrabold">
          {product.reviews.length} reviews with an average of{" "}
          {review / product.reviews.length} / 5
        </h2>
      </div>
      <div className="w-full columns-1 md:columns-2 lg:columns-3 ">
        {product.reviews.map((review) => (
          <ReviewItem
            className="mb-4 break-inside-avoid-column"
            key={review.id}
            review={review}
          />
        ))}
      </div>
    </Layout>
  );
}
