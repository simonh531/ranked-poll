"use client";

import { useEffect } from "react";

export default function AdSense() {
  useEffect(() => {
    let loaded = false;

    const loadScript = () => {
      if (loaded) return;
      loaded = true;

      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6476019148864560";
      script.crossOrigin = "anonymous";
      script.async = true;
      document.head.appendChild(script);

      removeListeners();
    };

    const events = ["mousedown", "touchstart", "scroll", "mousemove", "keydown"];
    const addListeners = () => {
      events.forEach((event) => {
        window.addEventListener(event, loadScript, { passive: true });
      });
    };

    const removeListeners = () => {
      events.forEach((event) => {
        window.removeEventListener(event, loadScript);
      });
    };

    // Safety timeout: load after 4 seconds if no interaction
    const timeoutId = setTimeout(loadScript, 4000);

    addListeners();

    return () => {
      clearTimeout(timeoutId);
      removeListeners();
    };
  }, []);

  return null;
}
