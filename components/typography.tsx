import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function H1({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <h1
      className={cn(
        className,
        "scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance font-merriweather",
      )}
    >
      {children}
    </h1>
  );
}
