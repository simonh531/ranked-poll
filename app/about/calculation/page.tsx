import React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { BookOpen, HelpCircle, Sliders } from "lucide-react";
import CalculationPlayground from "./CalculationPlayground";

export const metadata = {
  title: "Calculation Playground | Ranked Poll",
  description: "Simulate pairwise elections and inspect how the Ranked Pairs algorithm resolves Condorcet cycles.",
};

export default function CalculationPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1 space-y-2">
          <div className="flex flex-col gap-1.5 p-2 bg-card border rounded-xl shadow-sm">
            <Link
              href="/about"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="w-4 h-4" />
              <span>Intro</span>
            </Link>
            <Link
              href="/about/calculation"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>Calculation</span>
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
        </aside>

        {/* Content Section */}
        <main className="md:col-span-3">
          <CalculationPlayground />
        </main>
      </div>
    </div>
  );
}
