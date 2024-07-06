import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const SocialSelector = ({
  onSelect,
}: {
  onSelect: (name: string, url: string) => void;
}) => {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  const onSubmit = () => {
    // verify that url is like :
    // 1. https://linkedin.com/in/username
    // 2. https://twitter.com/username
    // 3. https://x.com/username

    if (!url) {
      toast.error("Please enter a valid URL");
      return;
    }
    if (!name) {
      toast.error("Please enter a name");
      return;
    }
    // if url is not valid
    if (
      !/^(https?:\/\/)?(www\.)?(linkedin|twitter|x)\.com\/[a-zA-Z0-9]+$/i.test(
        url
      )
    ) {
      toast.error("Please enter a valid LinkedIn or Twitter URL");
      return;
    }
    onSelect(name, url);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background/50"
          placeholder="Name"
        />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-background/50"
          placeholder="https://linkedin.com/in/username"
        />
        <Button onClick={onSubmit}>
          <Check size={24} /> Submit
        </Button>
      </div>
      <p className=" text-sm font-light text-muted-foreground">
        Add a link to your LinkedIn or Twitter
      </p>
    </div>
  );
};
