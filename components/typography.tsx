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
        "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance font-merriweather",
      )}
    >
      {children}
    </h1>
  );
}

export function H2({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <h2
      className={cn(
        className,
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight text-balance font-merriweather",
      )}
    >
      {children}
    </h2>
  );
}

export function H3({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <h3
      className={cn(
        className,
        "scroll-m-20 text-2xl font-semibold tracking-tight text-balance font-merriweather",
      )}
    >
      {children}
    </h3>
  );
}
