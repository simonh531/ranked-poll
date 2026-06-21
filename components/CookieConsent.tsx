"use client";

import React, { useState, useEffect } from "react";
import { X, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem("cookie-consent-accepted");
    if (!consent) {
      // Delay showing the toast slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent-accepted", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] bg-card/85 backdrop-blur-md border border-indigo-200/50 dark:border-indigo-900/30 shadow-2xl rounded-2xl p-4 md:p-5 flex flex-col gap-3.5 animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2.5 items-center">
          <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm leading-tight text-foreground">
            Privacy & Cookies
          </h4>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        We use essential cookies and local storage to keep you securely logged in and remember your recent voting activity. No tracking or marketing cookies are used.
      </p>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Link href="/about/privacy">
          <Button
            size="sm"
            variant="outline"
            className="text-[11px] h-7 px-2.5 cursor-pointer"
            onClick={() => setIsVisible(false)}
          >
            Privacy Policy
          </Button>
        </Link>
        <Button
          size="sm"
          className="text-[11px] h-7 px-3.5 cursor-pointer"
          onClick={handleAccept}
        >
          Got it
        </Button>
      </div>
    </div>
  );
}
