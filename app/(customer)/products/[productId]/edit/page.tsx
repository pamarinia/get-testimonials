import { requiredCurrentUser } from "@/auth/current-user";
import { Layout, LayoutTitle } from "@/components/layout";
import { prisma } from "@/prisma";
import { PageParams } from "@/types/next";
import { notFound } from "next/navigation";
import { ProductForm } from "./ProductForm";

export default async function RoutePage(
  props: PageParams<{
    productId: string;
  }>
) {
  const user = await requiredCurrentUser();

  console.log("ok");
  const product = await prisma.product.findUnique({
    where: {
      id: props.params.productId,
      userId: user.id,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <Layout>
      <LayoutTitle>Create product</LayoutTitle>
      <ProductForm defaultValues={product} productId={product.id} />
    </Layout>
  );
}
