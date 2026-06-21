"use client";

import { useEffect } from "react";
import { addPollToHistory } from "@/utils/pollHistory";

export default function PollHistoryTracker({
  slug,
  question,
  voteCount,
}: {
  slug: string;
  question: string;
  voteCount: number;
}) {
  useEffect(() => {
    addPollToHistory(slug, question, voteCount);
  }, [slug, question, voteCount]);

  return null;
}
