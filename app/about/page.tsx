import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, HelpCircle, Sliders } from "lucide-react";

export const metadata = {
  title: "About | Ranked Poll",
  description: "Learn how Ranked Poll and the Ranked Pairs voting method work.",
};

export default function AboutPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1 space-y-2">
          <div className="flex flex-col gap-1.5 p-2 bg-card border rounded-xl shadow-sm">
            <Link
              href="/about"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Intro</span>
            </Link>
            <Link
              href="/about/calculation"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
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
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-3xl font-extrabold tracking-tight">About Ranked Poll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground">
              <p>
                <strong>Ranked Poll</strong> is an easy-to-use platform for creating and sharing
                ranked-choice voting polls. Unlike traditional voting where you can only choose
                one option, Ranked Poll lets you rank your choices from best to worst.
              </p>

              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Why Ranked Choice Voting?</h3>
                <p className="mb-3">
                  Traditional voting (plurality voting) often suffers from the "spoiler effect," where
                  two similar options split the vote, allowing a less preferred third option to win.
                  Ranked-choice voting solves this by capturing voters' full preferences. If your first choice
                  cannot win, your vote goes to your next preferred option.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">The Ranked Pairs (Condorcet) Method</h3>
                <p className="mb-3">
                  Ranked Poll uses the <strong>Ranked Pairs</strong> algorithm (also known as the Tideman method).
                  Ranked Pairs is a Condorcet method, which means it satisfies the <em>Condorcet Criterion</em>:
                  if there is a choice that beats every other choice in a head-to-head matchup, that choice is guaranteed to win.
                </p>
                <h4 className="text-sm font-semibold text-foreground mt-4 mb-2">How Ranked Pairs Works:</h4>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                  <li>
                    <strong className="text-foreground">Tally Matchups:</strong> For every pair of options (e.g., A and B),
                    we count how many voters ranked A above B, and how many ranked B above A.
                  </li>
                  <li>
                    <strong className="text-foreground">Sort Matches:</strong> We list all matchups where one option beat another,
                    and sort them by the strength of victory (the margin of the win).
                  </li>
                  <li>
                    <strong className="text-foreground">Lock in Results:</strong> Going down the sorted list of matches,
                    we draw a directed arrow from the winner to the loser, locking in the relationship.
                    However, if locking in a relationship would create a cycle (e.g. A beats B, B beats C, and C beats A),
                    we skip that matchup.
                  </li>
                  <li>
                    <strong className="text-foreground">Declare Winner:</strong> The final resolved tree (directed acyclic graph)
                    reveals a clear source node representing the ultimate winner.
                  </li>
                </ol>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground">Want to see the math in action?</h4>
                  <p className="text-xs text-muted-foreground">Test cycles and resolve margins manually.</p>
                </div>
                <Link
                  href="/about/calculation"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-colors shrink-0"
                >
                  Go to Calculation Playground
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
