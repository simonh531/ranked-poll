"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Copy,
  Calendar,
  Vote,
  Grid as GridIcon,
  GitCommit,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import rankedPairsCalc, { makeRanks } from "@/utils/rankedPairsCalc";

interface ResultsDisplayProps {
  pollId: string;
  slug: string;
  question: string;
  description: string;
  createdAt: string;
  options: string[];
  ballots: { vote: string[]; lowVote: string[]; count: number }[];
  totalVoters: number;
  userHasVoted: boolean;
}

export default function ResultsDisplay({
  pollId,
  slug,
  question,
  description,
  createdAt,
  options,
  ballots,
  totalVoters,
  userHasVoted,
}: ResultsDisplayProps) {
  const router = useRouter();

  // Component states
  const [copied, setCopied] = useState(false);
  const [detailSubTab, setDetailSubTab] = useState("grid");
  const [step, setStep] = useState(1);
  const [hoveredCell, setHoveredCell] = useState<{ o1: string; o2: string; v1: number; v2: number } | null>(null);

  // 1. Run Ranked Pairs calculations
  const {
    pairs,
    rankings,
    rankedPairs,
    ratioPercents,
    history,
  } = useMemo(() => {
    if (!ballots.length) {
      return {
        pairs: {},
        rankings: [options],
        rankedPairs: [],
        ratioPercents: [1],
        history: [],
      };
    }
    return rankedPairsCalc(ballots, options);
  }, [ballots, options]);

  // Reconstruct flattened labels and display scores
  const scoreResults = useMemo(() => {
    const results: { label: string; percent: number; score: number }[] = [];
    rankings.forEach((rankGroup, index) => {
      const groupPercent = ratioPercents[index] || 0;
      rankGroup.forEach((option) => {
        results.push({
          label: option,
          percent: groupPercent,
          score: groupPercent * totalVoters,
        });
      });
    });
    return results;
  }, [rankings, ratioPercents, totalVoters]);

  // Head-to-head margins between adjacent ranks
  const mainPairs = useMemo(() => {
    const mainPairList: { winner: string; loser: string; wVotes: number; lVotes: number }[] = [];
    const flatRanks = rankings.flat();
    for (let i = 0; i < flatRanks.length - 1; i++) {
      const o1 = flatRanks[i];
      const o2 = flatRanks[i + 1];
      const alpha = [o1, o2].sort();
      const match = pairs[JSON.stringify(alpha)] || [0, 0];
      const o1First = alpha[0] === o1;

      const votes1 = o1First ? match[0] : match[1];
      const votes2 = o1First ? match[1] : match[0];

      if (votes1 >= votes2) {
        mainPairList.push({ winner: o1, loser: o2, wVotes: votes1, lVotes: votes2 });
      } else {
        mainPairList.push({ winner: o2, loser: o1, wVotes: votes2, lVotes: votes1 });
      }
    }
    return mainPairList;
  }, [rankings, pairs]);

  // Step-by-step intermediate rankings
  const stepRankings = useMemo(() => {
    if (!history.length || step > history.length) return [];
    const stepNodes = history[step - 1];
    const { rankings: stepRanks } = makeRanks(stepNodes, pairs, options);
    return stepRanks;
  }, [history, step, pairs, options]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/polls/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Results Calculated</span>
            </div>
            <CardTitle className="text-2xl font-bold leading-tight">{question}</CardTitle>
            {description && (
              <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full shrink-0 w-fit">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          </TabsList>

          {/* ============ OVERVIEW TAB ============ */}
          <TabsContent value="overview" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Final Winner Standings
              </h3>

              {scoreResults.length > 0 ? (
                <div className="space-y-3">
                  {scoreResults.map((result, idx) => {
                    const isWinner = idx === 0;
                    return (
                      <div key={result.label} className="space-y-1">
                        <div className="flex justify-between items-baseline text-sm">
                          <span className={cn("font-medium", isWinner && "text-emerald-600 dark:text-emerald-400 font-bold")}>
                            {idx + 1}. {result.label} {isWinner && "🏆"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Score: {result.score.toFixed(1)} ({(result.percent * 100).toFixed(0)}%)
                          </span>
                        </div>
                        {/* Custom horizontal progress bar as a light chart */}
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isWinner ? "bg-emerald-500" : "bg-primary/70"
                            )}
                            style={{ width: `${Math.max(result.percent * 100, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground">No ballots submitted yet.</div>
              )}
            </div>

            {mainPairs.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Head-to-Head Adjacent Margins
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {mainPairs.map((pair, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs p-2.5 border rounded-lg bg-card"
                    >
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {pair.winner}
                      </span>
                      <span className="text-muted-foreground px-2">
                        beats {pair.loser} ({pair.wVotes} vs {pair.lVotes})
                      </span>
                      <span className="font-bold border px-1.5 py-0.5 rounded bg-muted">
                        +{pair.wVotes - pair.lVotes}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ============ DETAILED VIEW TAB ============ */}
          <TabsContent value="detailed" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-muted-foreground">Resolution Method</span>
              <div className="flex bg-muted p-1 rounded-lg border gap-1">
                <Button
                  size="sm"
                  variant={detailSubTab === "grid" ? "secondary" : "ghost"}
                  onClick={() => setDetailSubTab("grid")}
                  className="h-7 text-xs px-2.5"
                >
                  <GridIcon className="w-3 h-3 mr-1" /> Matchups Grid
                </Button>
                <Button
                  size="sm"
                  variant={detailSubTab === "sort" ? "secondary" : "ghost"}
                  onClick={() => setDetailSubTab("sort")}
                  className="h-7 text-xs px-2.5"
                >
                  <GitCommit className="w-3.5 h-3.5 mr-1" /> Resolution Steps
                </Button>
              </div>
            </div>

            {/* A. MATCHUPS GRID TABLE */}
            {detailSubTab === "grid" && (
              <div className="overflow-x-auto border rounded-lg bg-card">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="p-2.5 text-left border-r font-semibold text-muted-foreground">&mdash;</th>
                      {options.map((opt) => (
                        <th key={opt} className="p-2.5 text-center font-semibold min-w-[80px] truncate">
                          {opt}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {options.map((o1) => (
                      <tr key={o1} className="border-b last:border-b-0 hover:bg-muted/10">
                        <td className="p-2.5 font-semibold border-r bg-muted/20">{o1}</td>
                        {options.map((o2) => {
                          if (o1 === o2) {
                            return (
                              <td key={o2} className="p-2.5 text-center text-muted-foreground/30 bg-muted/5">
                                &mdash;
                              </td>
                            );
                          }

                          const alpha = [o1, o2].sort();
                          const o1First = alpha[0] === o1;
                          const match = pairs[JSON.stringify(alpha)] || [0, 0];
                          const v1 = o1First ? match[0] : match[1];
                          const v2 = o1First ? match[1] : match[0];
                          const margin = v1 - v2;

                          return (
                            <td
                              key={o2}
                              className={cn(
                                "p-2.5 text-center font-medium cursor-help transition-colors",
                                margin > 0
                                  ? "text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10"
                                  : margin < 0
                                  ? "text-rose-600 bg-rose-500/5 hover:bg-rose-500/10"
                                  : "text-muted-foreground hover:bg-muted/30"
                              )}
                              onMouseEnter={() => setHoveredCell({ o1, o2, v1, v2 })}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              {margin > 0 ? `+${margin}` : margin}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Hover Popover Tooltip for Grid matchups */}
                {hoveredCell && (
                  <div className="p-3 bg-popover text-popover-foreground border shadow-md rounded-lg mx-3 my-3 text-xs flex flex-col gap-1.5 animate-in fade-in duration-150">
                    <div className="font-semibold text-muted-foreground border-b pb-1">Matchup Breakdown:</div>
                    <div className="flex justify-between gap-6">
                      <span>{hoveredCell.o1}</span>
                      <span className="font-bold">{hoveredCell.v1} votes</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span>{hoveredCell.o2}</span>
                      <span className="font-bold">{hoveredCell.v2} votes</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* B. RESOLUTION STEPS */}
            {detailSubTab === "sort" && history.length > 0 && (
              <div className="space-y-4">
                {/* Step Slider/Pagination controls */}
                <div className="flex items-center justify-between border p-3 rounded-lg bg-card shadow-sm">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Step {step} of {history.length}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={step === 1}
                      onClick={() => setStep(step - 1)}
                    >
                      Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={step === history.length}
                      onClick={() => setStep(step + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                {/* Current Pair details and Cycle Lock Check */}
                {rankedPairs[step - 1] && (() => {
                  const pair = rankedPairs[step - 1];
                  const nodesAtStep = history[step - 1];
                  const isLocked = nodesAtStep[pair.loser.name]?.above.includes(pair.winner.name);
                  const strength = pair.winner.votes / (pair.winner.votes + pair.loser.votes + 1);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pair Card */}
                      <div className="border p-4 rounded-xl space-y-3 bg-card relative">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase text-muted-foreground">
                            Evaluating Matchup
                          </span>
                          {isLocked ? (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Locked In
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" /> Skipped (Cycle)
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center text-sm border-b pb-2">
                          <span className="font-bold text-emerald-600">{pair.winner.name}</span>
                          <span>{pair.winner.votes} votes</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{pair.loser.name}</span>
                          <span>{pair.loser.votes} votes</span>
                        </div>

                        <div className="text-[11px] text-muted-foreground pt-1.5 border-t">
                          Victory Strength: {strength.toFixed(3)}
                        </div>
                      </div>

                      {/* Intermediate Standings Card */}
                      <div className="border p-4 rounded-xl bg-card space-y-3">
                        <span className="text-xs font-bold uppercase text-muted-foreground block">
                          Intermediate Standings
                        </span>
                        <div className="space-y-2">
                          {stepRankings.map((rankGroup, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-center gap-2 p-2 border rounded-lg bg-muted/25"
                            >
                              <span className="text-xs font-bold text-muted-foreground">#{rIdx + 1}</span>
                              <div className="flex flex-wrap gap-1.5">
                                {rankGroup.map((item) => (
                                  <span
                                    key={item}
                                    className={cn(
                                      "text-xs px-2 py-1 rounded-md border font-medium",
                                      item === pair.winner.name
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold"
                                        : item === pair.loser.name
                                        ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400 font-bold"
                                        : "bg-card text-foreground"
                                    )}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          {!userHasVoted && (
            <Button
              size="default"
              variant="default"
              onClick={() => router.push(`/polls/${slug}`)}
              className="flex-1 sm:flex-initial"
            >
              <Vote className="w-4 h-4 mr-2" />
              Go Vote!
            </Button>
          )}
          <span className="text-xs text-muted-foreground font-medium border border-muted px-2.5 py-1.5 rounded-md bg-muted/20 shrink-0">
            {totalVoters} {totalVoters === 1 ? "ballot" : "ballots"} cast
          </span>
        </div>

        <div className="flex items-center justify-end gap-2">
          {userHasVoted && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/polls/${slug}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Change Vote
            </Button>
          )}

          <Button size="sm" variant="default" onClick={handleCopyLink} className="w-full sm:w-auto">
            <Copy className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy Share Link"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
