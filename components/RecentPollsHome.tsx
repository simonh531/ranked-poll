"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Trash2, ChevronRight, Calendar } from "lucide-react";
import { getPollHistory, clearPollHistory, HistoryItem } from "@/utils/pollHistory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RecentPollsHome() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getPollHistory());

    const handleUpdate = () => {
      setHistory(getPollHistory());
    };

    window.addEventListener("pollHistoryUpdated", handleUpdate);
    return () => {
      window.removeEventListener("pollHistoryUpdated", handleUpdate);
    };
  }, []);

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl lg:max-w-xs shrink-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Recent Polls
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearPollHistory}
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
            title="Clear all history"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Polls you have created or voted on recently.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-3 space-y-1.5">
        {history.slice(0, 5).map((item) => {
          const dateStr = new Date(item.visitedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <Link
              key={item.slug}
              href={`/polls/${item.slug}`}
              className="flex items-start justify-between p-2.5 rounded-xl border hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="flex flex-col text-left min-w-0 pr-2">
                <span className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                  {item.question}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {dateStr}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
