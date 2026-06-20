"use client";

import { useEffect } from "react";
import { useAppTheme } from "./ThemeProvider";
import { Check, Paintbrush, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_PRESETS, getSecondaryColor } from "@/utils/themes";

export default function ThemeSelector({ initialTheme }: { initialTheme?: string }) {
  const { theme, setTheme } = useAppTheme();

  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
    }
  }, [initialTheme, setTheme]);

  const isCustom = !Object.keys(THEME_PRESETS).some((name) => name === theme);

  // Defaults for custom picker baseline
  let customPrimary = "#4f46e5";
  let customSecondary = "#ec4899";

  if (isCustom && theme.startsWith("#")) {
    if (theme.includes("_")) {
      const parts = theme.split("_");
      customPrimary = parts[0];
      customSecondary = parts[1];
    } else {
      customPrimary = theme;
      customSecondary = getSecondaryColor(theme);
    }
  }

  const handleCustomPrimaryChange = (val: string) => {
    setTheme(`${val}_${customSecondary}`);
  };

  const handleCustomSecondaryChange = (val: string) => {
    setTheme(`${customPrimary}_${val}`);
  };

  const handleCustomActivate = () => {
    if (!isCustom) {
      // Toggle custom mode by seeding with default custom colors
      setTheme("#4f46e5_#ec4899");
    }
  };

  return (
    <div className="space-y-2 mt-4">
      <label className="text-sm font-medium leading-none text-foreground/90">
        Poll Theme Accent
      </label>
      
      {/* Hidden input to pass theme to the form submit action */}
      <input type="hidden" name="theme" value={theme} />

      <div className="flex flex-wrap items-center gap-3 mt-1.5">
        {Object.entries(THEME_PRESETS).map(([name, config]) => {
          const isActive = theme === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setTheme(name)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-[3.5px] transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm",
                isActive
                  ? "ring-2 ring-primary/40 ring-offset-1 scale-105"
                  : "hover:scale-[1.03]"
              )}
              style={{
                backgroundColor: config.primary,
                borderColor: config.secondary,
              }}
              title={`Preset ${name}`}
              aria-label={`Theme: ${name}`}
            >
              {isActive && <Check className="w-3 h-3 text-white drop-shadow-md" />}
            </button>
          );
        })}

        {/* Custom Color Mode Trigger Button */}
        <button
          type="button"
          onClick={handleCustomActivate}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm",
            isCustom
              ? "border-[3.5px] ring-2 ring-primary/40 ring-offset-1 scale-105"
              : "border-muted-foreground/20 hover:border-muted-foreground/50 bg-gradient-to-tr from-rose-500 via-emerald-500 to-indigo-600"
          )}
          style={
            isCustom
              ? {
                  backgroundColor: customPrimary,
                  borderColor: customSecondary,
                }
              : undefined
          }
          title="Custom Dual Theme"
        >
          {isCustom ? (
            <Check className="w-3 h-3 text-white drop-shadow-md" />
          ) : (
            <Paintbrush className="w-3.5 h-3.5 text-white drop-shadow-md" />
          )}
        </button>
      </div>

      {/* Custom Picker Panel */}
      {isCustom && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3 p-3 bg-white/30 dark:bg-slate-900/30 border border-indigo-100/50 dark:border-slate-800/50 rounded-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">Primary:</span>
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-input shadow-xs">
              <input
                type="color"
                value={customPrimary}
                onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
              />
            </div>
            <span className="text-xs font-mono text-foreground/80 uppercase">{customPrimary}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground">Secondary:</span>
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-input shadow-xs">
              <input
                type="color"
                value={customSecondary}
                onChange={(e) => handleCustomSecondaryChange(e.target.value)}
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
              />
            </div>
            <span className="text-xs font-mono text-foreground/80 uppercase">{customSecondary}</span>
          </div>

          <button
            type="button"
            onClick={() => setTheme("indigo")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors sm:ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Indigo</span>
          </button>
        </div>
      )}
    </div>
  );
}
