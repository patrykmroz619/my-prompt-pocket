import type { ReactNode } from "react";

interface TopHeaderProps {
  children: ReactNode;
}

export function TopHeader(props: TopHeaderProps) {
  const { children } = props;

  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto flex items-center gap-4 p-4">{children}</div>
    </header>
  );
}
