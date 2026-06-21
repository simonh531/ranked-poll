"use client";

export interface HistoryItem {
  slug: string;
  question: string;
  visitedAt: number;
  lastSeenVoteCount: number;
}

const STORAGE_KEY = "ranked-poll-history";

export function getPollHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    if (Array.isArray(items)) {
      return items.sort((a, b) => b.visitedAt - a.visitedAt);
    }
  } catch (e) {
    console.error("Failed to read poll history:", e);
  }
  return [];
}

export function addPollToHistory(slug: string, question: string, voteCount: number = 0) {
  if (typeof window === "undefined") return;
  try {
    const history = getPollHistory();
    const existing = history.find((item) => item.slug === slug);
    const lastCount = voteCount > 0 ? voteCount : (existing?.lastSeenVoteCount ?? 0);

    const filtered = history.filter((item) => item.slug !== slug);
    const updated = [
      { slug, question, visitedAt: Date.now(), lastSeenVoteCount: lastCount },
      ...filtered,
    ].slice(0, 10); // cap at 10 items
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch a custom event to notify other components on the page of the history change
    window.dispatchEvent(new Event("pollHistoryUpdated"));
  } catch (e) {
    console.error("Failed to save poll history:", e);
  }
}

export function updatePollLastSeenVoteCount(slug: string, voteCount: number) {
  if (typeof window === "undefined") return;
  try {
    const history = getPollHistory();
    let changed = false;
    const updated = history.map((item) => {
      if (item.slug === slug && item.lastSeenVoteCount !== voteCount) {
        changed = true;
        return { ...item, lastSeenVoteCount: voteCount };
      }
      return item;
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("pollHistoryUpdated"));
    }
  } catch (e) {
    console.error("Failed to update poll vote count:", e);
  }
}

export function clearPollHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("pollHistoryUpdated"));
  } catch (e) {
    console.error("Failed to clear poll history:", e);
  }
}
