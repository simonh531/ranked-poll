"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { BookOpen, HelpCircle, Sliders, Shield } from "lucide-react";

export default function AboutSidebar() {
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    if (isActive) {
      return "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground transition-colors";
    }
    return "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground";
  };

  return (
    <div className="flex flex-col gap-1.5 p-2 bg-card border rounded-xl shadow-sm">
      <Link href="/about" className={getLinkClass("/about")}>
        <BookOpen className="w-4 h-4" />
        <span>Intro</span>
      </Link>
      <Link href="/about/calculation" className={getLinkClass("/about/calculation")}>
        <Sliders className="w-4 h-4" />
        <span>Calculation</span>
      </Link>
      <Link href="/about/privacy" className={getLinkClass("/about/privacy")}>
        <Shield className="w-4 h-4" />
        <span>Privacy</span>
      </Link>
      <Separator className="my-1" />
      <Link
        href="/"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      >
        <HelpCircle className="w-4 h-4" />
        <span>Create Poll</span>
      </Link>
    </div>
  );
}
