import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/features/landing/LandingHeader";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <LandingHeader />
      <p>Welcome Home !</p>
      <Button>Test</Button>
    </div>
  );
}
