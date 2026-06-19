"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  Square,
  CheckSquare,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Copy,
  Calendar,
  Eye,
} from "lucide-react";
import { submitVoteAction } from "../submitVoteAction";

function randomizeArray(array: string[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function DragTarget({
  area,
  action,
}: {
  area: "top" | "bottom";
  action: (event: React.DragEvent<HTMLDivElement>) => void;
}) {
  const [isTarget, setIsTarget] = useState(false);
  return (
    <div
      className="h-2 relative w-full cursor-pointer"
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={() => setIsTarget(true)}
      onDragLeave={() => setIsTarget(false)}
      onDrop={(event) => {
        event.stopPropagation();
        setIsTarget(false);
        action(event);
      }}
    >
      <div
        className={cn(
          "absolute left-0 w-full h-[2px] transition-colors pointer-events-none",
          area === "top" ? "top-0" : "bottom-0",
          isTarget ? "bg-black dark:bg-white" : "bg-transparent"
        )}
      />
    </div>
  );
}

function DraggableArea({
  area,
  action,
}: {
  area: "Top" | "Bottom";
  action: (event: React.DragEvent<HTMLDivElement>) => void;
}) {
  const [isTarget, setIsTarget] = useState(false);
  return (
    <div
      className={cn(
        "absolute left-0 w-full z-10 transition-all",
        area === "Top" ? "top-0 border-t-2 h-[50%]" : "bottom-0 border-b-2 h-[50%]",
        isTarget ? "border-primary bg-primary/5" : "border-transparent"
      )}
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={() => setIsTarget(true)}
      onDragLeave={() => setIsTarget(false)}
      onDrop={(event) => {
        event.stopPropagation();
        setIsTarget(false);
        action(event);
      }}
    />
  );
}

interface VoteDisplayProps {
  pollId: string;
  slug: string;
  question: string;
  description: string;
  createdAt: string;
  options: string[];
  randomize: boolean;
  totalVoters: number;
}

export default function VoteDisplay({
  pollId,
  slug,
  question,
  description,
  createdAt,
  options,
  randomize,
  totalVoters,
}: VoteDisplayProps) {
  const router = useRouter();

  // State
  const [orderedOptions, setOrderedOptions] = useState<string[]>([]);
  const [rank, setRank] = useState<{ up: string[]; down: string[] }>({ up: [], down: [] });
  const [submitted, setSubmitted] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [isDragging, setIsDragging] = useState("");
  const [outlineNeutral, setOutlineNeutral] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Randomize initial list client-side to prevent hydration mismatch
  useEffect(() => {
    if (randomize) {
      setOrderedOptions(randomizeArray(options));
    } else {
      setOrderedOptions(options);
    }
  }, [options, randomize]);

  const reset = () => {
    setRank({ up: [], down: [] });
    setError("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/polls/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await submitVoteAction(pollId, rank.up, rank.down);
      if (res.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
        // Refresh page so Next.js server side re-renders and displays Results
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const unranked = orderedOptions.filter(
    (option) => !rank.up.includes(option) && !rank.down.includes(option)
  );

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
          <div>
            <CardTitle className="text-2xl font-bold leading-tight">{question}</CardTitle>
            {description && (
              <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full shrink-0 w-fit">
            <Calendar className="w-3 h-3" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAdvanced(!advanced)}
              className={cn(advanced && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground")}
            >
              Advanced Mode
            </Button>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              (Rank choices at the bottom too)
            </span>
          </div>
          <Button size="icon" variant="ghost" onClick={reset} disabled={submitted || loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md font-medium">
            {error}
          </div>
        )}

        {/* 1. PREFERRED CHOICES (RANKED UP) */}
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const item = event.dataTransfer.getData("text/plain");
            if (!item) return;
            const newUp = rank.up.filter((x) => x !== item);
            const newDown = rank.down.filter((x) => x !== item);
            newUp.push(item);
            setRank({ up: newUp, down: newDown });
            setIsDragging("");
          }}
          className="p-3 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-500/20 rounded-xl space-y-2"
        >
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Preferred Choices (Ranked Top to Bottom)
            </span>
            <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              {rank.up.length} ranked
            </span>
          </div>

          <div className="space-y-1 min-h-[48px] flex flex-col justify-center">
            {rank.up.map((option, index) => (
              <div
                key={option}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", option);
                  setIsDragging("ranked");
                }}
                onDragEnd={() => setIsDragging("")}
                className="flex items-center gap-2 p-2 bg-card hover:bg-muted/30 border rounded-lg shadow-sm relative group cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-emerald-600 w-5 text-center">
                    #{index + 1}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    disabled={index === 0}
                    onClick={() => {
                      const newUp = [...rank.up];
                      newUp.splice(index, 1);
                      newUp.splice(index - 1, 0, option);
                      setRank({ ...rank, up: newUp });
                    }}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    disabled={index === rank.up.length - 1}
                    onClick={() => {
                      const newUp = [...rank.up];
                      newUp.splice(index, 1);
                      newUp.splice(index + 1, 0, option);
                      setRank({ ...rank, up: newUp });
                    }}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>

                <span className="text-sm font-medium flex-1 truncate select-none">{option}</span>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-65 hover:opacity-100"
                  onClick={() => {
                    const newUp = rank.up.filter((x) => x !== option);
                    setRank({ ...rank, up: newUp });
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>

                {isDragging ? (
                  <>
                    <DraggableArea
                      area="Top"
                      action={(event) => {
                        const item = event.dataTransfer.getData("text/plain");
                        const newUp = rank.up.filter((x) => x !== item);
                        const newDown = rank.down.filter((x) => x !== item);
                        newUp.splice(index, 0, item);
                        setRank({ up: newUp, down: newDown });
                        setIsDragging("");
                      }}
                    />
                    <DraggableArea
                      area="Bottom"
                      action={(event) => {
                        const item = event.dataTransfer.getData("text/plain");
                        const newUp = rank.up.filter((x) => x !== item);
                        const newDown = rank.down.filter((x) => x !== item);
                        newUp.splice(index + 1, 0, item);
                        setRank({ up: newUp, down: newDown });
                        setIsDragging("");
                      }}
                    />
                  </>
                ) : null}
              </div>
            ))}

            {rank.up.length === 0 && (
              <div className="text-center py-4 border border-dashed rounded-lg text-xs text-muted-foreground">
                Drag choices here or select them below to rank.
              </div>
            )}
          </div>

          <DragTarget
            area="bottom"
            action={(event) => {
              const item = event.dataTransfer.getData("text/plain");
              const newUp = rank.up.filter((x) => x !== item);
              const newDown = rank.down.filter((x) => x !== item);
              newUp.push(item);
              setRank({ up: newUp, down: newDown });
              setIsDragging("");
            }}
          />
        </div>

        {/* 2. UNRANKED CHOICES (NEUTRAL) */}
        <div className="p-3 bg-muted/20 border border-muted/50 rounded-xl space-y-2 relative">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unranked Choices (Neutral)
            </span>
          </div>

          <div className="space-y-1 min-h-[48px] flex flex-col justify-center">
            {unranked.map((option) => (
              <div
                key={option}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", option);
                  setIsDragging("unranked");
                }}
                onDragEnd={() => setIsDragging("")}
                className="flex items-center justify-between p-2.5 bg-card hover:bg-muted/10 border rounded-lg shadow-sm cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium select-none">{option}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {advanced ? (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                        onClick={() => setRank({ ...rank, up: [...rank.up, option] })}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                        onClick={() => setRank({ ...rank, down: [...rank.down, option] })}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setRank({ ...rank, up: [...rank.up, option] })}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {unranked.length === 0 && (
              <div className="text-center py-4 text-xs text-muted-foreground font-medium">
                All options have been ranked!
              </div>
            )}
          </div>

          {/* Neutral Area Drop Target when dragging ranked items back */}
          {isDragging === "ranked" && (
            <div
              onDragOver={(event) => event.preventDefault()}
              onDragEnter={() => setOutlineNeutral(true)}
              onDragLeave={() => setOutlineNeutral(false)}
              onDrop={(event) => {
                setOutlineNeutral(false);
                setIsDragging("");
                const item = event.dataTransfer.getData("text/plain");
                setRank({
                  up: rank.up.filter((x) => x !== item),
                  down: rank.down.filter((x) => x !== item),
                });
              }}
              className={cn(
                "absolute inset-0 rounded-xl transition-all flex items-center justify-center pointer-events-auto bg-background/80 border-2 border-dashed z-20",
                outlineNeutral ? "border-primary bg-primary/5" : "border-muted-foreground/30"
              )}
            >
              <span className="text-xs font-semibold">Drop here to unrank</span>
            </div>
          )}
        </div>

        {/* 3. LEAST PREFERRED CHOICES (RANKED DOWN) */}
        {(advanced || rank.down.length > 0) && (
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const item = event.dataTransfer.getData("text/plain");
              if (!item) return;
              const newUp = rank.up.filter((x) => x !== item);
              const newDown = rank.down.filter((x) => x !== item);
              newDown.push(item);
              setRank({ up: newUp, down: newDown });
              setIsDragging("");
            }}
            className="p-3 bg-rose-50/20 dark:bg-rose-950/5 border border-rose-500/20 rounded-xl space-y-2"
          >
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Least Preferred Choices (Ranked Bottom-Up)
              </span>
              <span className="text-xs text-rose-600/70 dark:text-rose-400/70">
                {rank.down.length} ranked
              </span>
            </div>

            <DragTarget
              area="top"
              action={(event) => {
                const item = event.dataTransfer.getData("text/plain");
                const newUp = rank.up.filter((x) => x !== item);
                const newDown = rank.down.filter((x) => x !== item);
                newDown.unshift(item);
                setRank({ up: newUp, down: newDown });
                setIsDragging("");
              }}
            />

            <div className="space-y-1 min-h-[48px] flex flex-col justify-center">
              {rank.down.map((option, index) => {
                const absoluteRank = orderedOptions.length - rank.down.length + index + 1;
                return (
                  <div
                    key={option}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", option);
                      setIsDragging("ranked");
                    }}
                    onDragEnd={() => setIsDragging("")}
                    className="flex items-center gap-2 p-2 bg-card hover:bg-muted/30 border rounded-lg shadow-sm relative group cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-bold text-rose-600 w-5 text-center">
                        #{absoluteRank}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => {
                          const newDown = [...rank.down];
                          newDown.splice(index, 1);
                          newDown.splice(index - 1, 0, option);
                          setRank({ ...rank, down: newDown });
                        }}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        disabled={index === rank.down.length - 1}
                        onClick={() => {
                          const newDown = [...rank.down];
                          newDown.splice(index, 1);
                          newDown.splice(index + 1, 0, option);
                          setRank({ ...rank, down: newDown });
                        }}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <span className="text-sm font-medium flex-1 truncate select-none">{option}</span>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-65 hover:opacity-100"
                      onClick={() => {
                        const newDown = rank.down.filter((x) => x !== option);
                        setRank({ ...rank, down: newDown });
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>

                    {isDragging ? (
                      <>
                        <DraggableArea
                          area="Top"
                          action={(event) => {
                            const item = event.dataTransfer.getData("text/plain");
                            const newUp = rank.up.filter((x) => x !== item);
                            const newDown = rank.down.filter((x) => x !== item);
                            newDown.splice(index, 0, item);
                            setRank({ up: newUp, down: newDown });
                            setIsDragging("");
                          }}
                        />
                        <DraggableArea
                          area="Bottom"
                          action={(event) => {
                            const item = event.dataTransfer.getData("text/plain");
                            const newUp = rank.up.filter((x) => x !== item);
                            const newDown = rank.down.filter((x) => x !== item);
                            newDown.splice(index + 1, 0, item);
                            setRank({ up: newUp, down: newDown });
                            setIsDragging("");
                          }}
                        />
                      </>
                    ) : null}
                  </div>
                );
              })}

              {rank.down.length === 0 && (
                <div className="text-center py-4 border border-dashed rounded-lg text-xs text-muted-foreground">
                  Drag choices here that you want ranked last.
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="default"
            onClick={handleVote}
            disabled={loading || submitted || (rank.up.length === 0 && rank.down.length === 0)}
            className="flex-1 sm:flex-initial"
          >
            {loading ? "Submitting..." : submitted ? "Vote Submitted" : "Submit Ballot"}
          </Button>
          <span className="text-xs text-muted-foreground font-medium border border-muted px-2.5 py-1.5 rounded-md bg-muted/20 shrink-0">
            {totalVoters} {totalVoters === 1 ? "ballot" : "ballots"} cast
          </span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => router.push(`/polls/${slug}?results`)}>
            <Eye className="w-4 h-4 mr-2" />
            See Results
          </Button>

          <Button size="sm" variant="outline" onClick={handleCopyLink} className="w-full sm:w-auto">
            <Copy className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy Share Link"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
