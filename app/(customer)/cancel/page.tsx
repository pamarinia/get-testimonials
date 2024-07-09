import { Layout, LayoutTitle } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { PageParams } from "@/types/next";
import Link from "next/link";

export default async function RoutePage(props: PageParams<{}>) {
  return (
    <Layout>
      <LayoutTitle>Yeah ! You are now a premium user</LayoutTitle>
      <div className="flex gap-4">
        <Link
          className={buttonVariants({ size: "lg", variant: "secondary" })}
          href="/"
        >
          Back to home
        </Link>
        <Link
          className={buttonVariants({ size: "lg" })}
          href="mailto:contact@pamarinia.com"
        >
          Contact help
        </Link>
      </div>
    </Layout>
  );
}
