import type { ReactNode } from "react";

interface TopHeaderProps {
  children: ReactNode;
}

export function TopHeader(props: TopHeaderProps) {
  const { children } = props;

  return <header className="flex items-center gap-4 p-4 border-b">{children}</header>;
}
