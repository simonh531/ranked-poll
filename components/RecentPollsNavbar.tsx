"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Trash2, ExternalLink, Flame } from "lucide-react";
import { getPollHistory, clearPollHistory, updatePollLastSeenVoteCount, HistoryItem } from "@/utils/pollHistory";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

export default function RecentPollsNavbar() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [latestCounts, setLatestCounts] = useState<Record<string, number>>({});

  // 1. Listen to local storage / history updates
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

  // 2. Fetch live vote counts from database for all items in history
  useEffect(() => {
    if (history.length > 0) {
      const fetchLatestCounts = async () => {
        const slugs = history.map((x) => x.slug);
        const supabase = createClient();

        const { data, error } = await supabase
          .from("votes")
          .select("user_id, polls!inner(slug)")
          .in("polls.slug", slugs);

        if (error || !data) {
          console.error("Error fetching vote counts:", error);
          return;
        }

        // Group by slug and count unique user_ids
        const counts: Record<string, Set<string>> = {};
        data.forEach((row: any) => {
          const slug = row.polls?.slug;
          const userId = row.user_id;
          if (!slug || !userId) return;
          if (!counts[slug]) {
            counts[slug] = new Set();
          }
          counts[slug].add(userId);
        });

        const newCounts: Record<string, number> = {};
        slugs.forEach((slug) => {
          newCounts[slug] = counts[slug]?.size ?? 0;
        });

        setLatestCounts(newCounts);
      };

      fetchLatestCounts();

      // Poll database every 30 seconds for live updates
      const interval = setInterval(fetchLatestCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [history]);

  // 3. Mark all changes as seen when user opens the popover
  useEffect(() => {
    if (open && history.length > 0) {
      history.forEach((item) => {
        const currentCount = latestCounts[item.slug];
        if (currentCount !== undefined && currentCount !== item.lastSeenVoteCount) {
          updatePollLastSeenVoteCount(item.slug, currentCount);
        }
      });
    }
  }, [open, history, latestCounts]);

  const handleClear = () => {
    clearPollHistory();
    setOpen(false);
  };

  // Determine if any poll has received new votes
  const hasNewUpdates = history.some((item) => {
    const liveCount = latestCounts[item.slug];
    return liveCount !== undefined && liveCount > item.lastSeenVoteCount;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="h-10 w-10 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 rounded-full transition-colors relative flex items-center justify-center cursor-pointer"
        title="Recent Polls"
      >
        <History className="h-5 w-5" />
        {hasNewUpdates && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3 shadow-xl border rounded-xl bg-popover text-popover-foreground z-[100]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b">
          <span className="text-sm font-bold flex items-center gap-1.5 text-foreground">
            <History className="w-4 h-4 text-primary" />
            Recent Polls
          </span>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground font-medium">
            No recently viewed polls yet.
          </div>
        ) : (
          <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
            {history.slice(0, 5).map((item) => {
              const liveCount = latestCounts[item.slug];
              const isUpdated = liveCount !== undefined && liveCount > item.lastSeenVoteCount;
              return (
                <Link
                  key={item.slug}
                  href={`/polls/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between p-2 rounded-lg text-sm hover:bg-muted transition-colors group text-muted-foreground hover:text-foreground font-medium"
                >
                  <span className="truncate pr-2 max-w-[190px] text-left flex items-center gap-1">
                    {isUpdated && <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0 animate-pulse" />}
                    <span className={isUpdated ? "font-bold text-foreground" : ""}>
                      {item.question}
                    </span>
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {isUpdated && (
                      <span className="text-[10px] bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-bold">
                        +{liveCount - item.lastSeenVoteCount}
                      </span>
                    )}
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
