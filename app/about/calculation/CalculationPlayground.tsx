"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { fromPairsCalc, makeRanks } from "@/utils/rankedPairsCalc";
import { cn } from "@/lib/utils";

function InputCard({
  title,
  label1,
  label2,
  val1,
  val2,
  setVal1,
  setVal2,
}: {
  title: string;
  label1: string;
  label2: string;
  val1: number;
  val2: number;
  setVal1: (v: number) => void;
  setVal2: (v: number) => void;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 bg-muted/40">
        <CardTitle className="text-sm font-bold text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label className="w-12 font-bold">{label1}</Label>
          <Input
            type="number"
            value={val1}
            min={0}
            onChange={(e) => setVal1(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-20 text-right h-8"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label className="w-12 font-bold">{label2}</Label>
          <Input
            type="number"
            value={val2}
            min={0}
            onChange={(e) => setVal2(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-20 text-right h-8"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CalculationPlayground() {
  // Matchup states (Default sets up a cyclic preference: A > B, B > C, C > A)
  const [aPairAB, setAPairAB] = useState(10);
  const [bPairAB, setBPairAB] = useState(5);

  const [bPairBC, setBPairBC] = useState(8);
  const [cPairBC, setCPairBC] = useState(4);

  const [cPairCA, setCPairCA] = useState(7);
  const [aPairCA, setAPairCA] = useState(3);

  // Active step for stepping through resolution
  const [step, setStep] = useState(1);

  // Run calculation
  const pairsData = useMemo(() => {
    const pairs = {
      '["a","b"]': [aPairAB, bPairAB] as [number, number],
      '["b","c"]': [bPairBC, cPairBC] as [number, number],
      '["a","c"]': [aPairCA, cPairCA] as [number, number],
    };
    return fromPairsCalc(pairs, ["a", "b", "c"]);
  }, [aPairAB, bPairAB, bPairBC, cPairBC, cPairCA, aPairCA]);

  const { rankings, ratioPercents, rankedPairs, history, pairs } = pairsData;

  const totalVoters = Math.max(aPairAB, aPairCA) + Math.max(bPairAB, bPairBC) + Math.max(cPairBC, cPairCA) || 1;

  // Flattened standings
  const scoreResults = useMemo(() => {
    const results: { label: string; percent: number; score: number }[] = [];
    rankings.forEach((rankGroup, index) => {
      const groupPercent = ratioPercents[index] || 0;
      rankGroup.forEach((option) => {
        results.push({
          label: option.toUpperCase(),
          percent: groupPercent,
          score: groupPercent * totalVoters,
        });
      });
    });
    return results;
  }, [rankings, ratioPercents, totalVoters]);

  // Intermediate rankings at selected step
  const stepRankings = useMemo(() => {
    if (!history.length || step > history.length) return [];
    const stepNodes = history[step - 1];
    const { rankings: stepRanks } = makeRanks(stepNodes, pairs, ["a", "b", "c"]);
    return stepRanks;
  }, [history, step, pairs]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-3xl font-extrabold tracking-tight">Calculation Playground</CardTitle>
        <CardDescription>
          Simulate pairwise elections between three candidates (A, B, C) and inspect how the Ranked Pairs algorithm resolves cycles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pairwise Inputs */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Matchup Inputs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputCard
              title="A vs B"
              label1="A wins"
              label2="B wins"
              val1={aPairAB}
              val2={bPairAB}
              setVal1={setAPairAB}
              setVal2={setBPairAB}
            />
            <InputCard
              title="B vs C"
              label1="B wins"
              label2="C wins"
              val1={bPairBC}
              val2={cPairBC}
              setVal1={setBPairBC}
              setVal2={setCPairBC}
            />
            <InputCard
              title="C vs A"
              label1="C wins"
              label2="A wins"
              val1={cPairCA}
              val2={aPairCA}
              setVal1={setCPairCA}
              setVal2={setAPairCA}
            />
          </div>
        </div>

        <Separator />

        {/* Simulation Results Standings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Simulation Standings
            </h3>
            <div className="space-y-3">
              {scoreResults.map((res, idx) => {
                const isWinner = idx === 0;
                return (
                  <div key={res.label} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className={cn("font-medium", isWinner && "text-emerald-600 dark:text-emerald-400 font-bold")}>
                        Candidate {res.label} {isWinner && "🏆"}
                      </span>
                      <span className="text-muted-foreground">
                        Score: {res.score.toFixed(1)} ({(res.percent * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isWinner ? "bg-emerald-500" : "bg-primary/70"
                        )}
                        style={{ width: `${Math.max(res.percent * 100, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Head to head table */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Margin Matrix
            </h3>
            <div className="border rounded-lg overflow-hidden bg-card text-xs">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 font-semibold">
                    <th className="p-2 border-r text-muted-foreground">&mdash;</th>
                    <th className="p-2">A</th>
                    <th className="p-2">B</th>
                    <th className="p-2">C</th>
                  </tr>
                </thead>
                <tbody>
                  {["a", "b", "c"].map((o1) => (
                    <tr key={o1} className="border-b last:border-b-0">
                      <td className="p-2 font-bold border-r bg-muted/20 text-muted-foreground">
                        {o1.toUpperCase()}
                      </td>
                      {["a", "b", "c"].map((o2) => {
                        if (o1 === o2) return <td key={o2} className="p-2 bg-muted/5">&mdash;</td>;
                        const alpha = [o1, o2].sort();
                        const o1First = alpha[0] === o1;
                        const key = JSON.stringify(alpha);
                        const match = pairs[key] || [0, 0];
                        const v1 = o1First ? match[0] : match[1];
                        const v2 = o1First ? match[1] : match[0];
                        const diff = v1 - v2;
                        return (
                          <td
                            key={o2}
                            className={cn(
                              "p-2 font-semibold",
                              diff > 0 ? "text-emerald-600 bg-emerald-500/5" : "text-rose-600 bg-rose-500/5"
                            )}
                          >
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Step by step cycle resolution */}
        {rankedPairs.length > 0 && (
          <div className="space-y-4 pt-2">
            <Separator />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Cycle Breaking Steps
              </h3>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                >
                  Prev
                </Button>
                <span className="text-xs font-semibold px-2.5 py-1 border rounded bg-muted">
                  Step {step} / {rankedPairs.length}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={step === rankedPairs.length}
                  onClick={() => setStep(step + 1)}
                >
                  Next
                </Button>
              </div>
            </div>

            {rankedPairs[step - 1] && (() => {
              const pair = rankedPairs[step - 1];
              const nodesAtStep = history[step - 1];
              const isLocked = nodesAtStep[pair.loser.name]?.above.includes(pair.winner.name);
              const strength = pair.winner.votes / (pair.winner.votes + pair.loser.votes + 1);

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border p-4 rounded-xl space-y-3 bg-muted/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        Evaluating Match
                      </span>
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Locked In
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Skipped (Cycle)
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold flex justify-between">
                      <span className="text-emerald-600 font-bold">{pair.winner.name.toUpperCase()}</span>
                      <span>beats {pair.loser.name.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Margin: {pair.winner.votes} vs {pair.loser.votes} (victory strength {strength.toFixed(3)})
                    </div>
                  </div>

                  <div className="border p-4 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase block">
                      Standings at Step {step}
                    </span>
                    <div className="space-y-1 text-xs">
                      {stepRankings.map((group, gIdx) => (
                        <div key={gIdx} className="flex items-center gap-2 p-1.5 border rounded bg-card">
                          <span className="font-bold text-muted-foreground">#{gIdx + 1}</span>
                          <div className="flex gap-1">
                            {group.map((item) => (
                              <span
                                key={item}
                                className={cn(
                                  "px-1.5 py-0.5 border rounded uppercase font-medium",
                                  item === pair.winner.name
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 font-bold"
                                    : item === pair.loser.name
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-700 font-bold"
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
      </CardContent>
    </Card>
  );
}
