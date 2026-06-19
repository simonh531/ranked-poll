"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export default function GuestAccountBanner() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // 1. Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.is_anonymous) {
        setIsAnonymous(true);
      }
    });

    // 2. Listen for auth changes (e.g., if they log in/convert their account)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.is_anonymous) {
        setIsAnonymous(true);
      } else {
        setIsAnonymous(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!isAnonymous || isDismissed) {
    return null;
  }

  return (
    <div className="w-full bg-indigo-50/80 dark:bg-indigo-950/20 border-b border-indigo-100/80 dark:border-indigo-900/30 text-indigo-950 dark:text-indigo-300 py-2 px-6 backdrop-blur-sm animate-in fade-in slide-in-from-top duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            You are using a guest session.{" "}
            <Link
              href="/login"
              className="underline font-semibold hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors"
            >
              Secure your account
            </Link>{" "}
            to save your created polls and voting history permanently.
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
