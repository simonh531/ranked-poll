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
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);

      // Clean up event listeners
      window.removeEventListener("scroll", loadScript);
      window.removeEventListener("touchstart", loadScript);
      window.removeEventListener("mousemove", loadScript);
      window.removeEventListener("mousedown", loadScript);
      window.removeEventListener("keydown", loadScript);
    };

    // Add passive event listeners to trigger load on any real user activity
    window.addEventListener("scroll", loadScript, { passive: true });
    window.addEventListener("touchstart", loadScript, { passive: true });
    window.addEventListener("mousemove", loadScript, { passive: true });
    window.addEventListener("mousedown", loadScript, { passive: true });
    window.addEventListener("keydown", loadScript, { passive: true });

    return () => {
      window.removeEventListener("scroll", loadScript);
      window.removeEventListener("touchstart", loadScript);
      window.removeEventListener("mousemove", loadScript);
      window.removeEventListener("mousedown", loadScript);
      window.removeEventListener("keydown", loadScript);
    };
  }, []);

  return null;
}
