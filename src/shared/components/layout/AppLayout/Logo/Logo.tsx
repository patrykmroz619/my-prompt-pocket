import { BoxIcon } from "lucide-react";

export function Logo() {
  return (
    <a href="/" className="flex items-center gap-2 font-medium">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <BoxIcon />
      </div>
      My Prompt Pocket
    </a>
  );
}

export default Logo;
