import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoggedInDropdown } from "./LoggedInDropdown";
import { SignInButton } from "./SignInButton";
import { currentUser } from "@/auth/current-user";
import { Star } from "lucide-react";

export const LoggedInButton = async () => {
  const user = await currentUser();

  if (!user) {
    return <SignInButton />;
  }

  return (
    <LoggedInDropdown>
      <Button variant="outline" size="sm">
        {user.plan === "PREMIUM" ? <Star size={16} className="mr-2" /> : null}
        <Avatar className="size-6">
          <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          {user.image ? (
            <AvatarImage
              src={user.image}
              alt={`${user.name ?? "-"}'s profile picture`}
            />
          ) : null}
        </Avatar>
      </Button>
    </LoggedInDropdown>
  );
};
