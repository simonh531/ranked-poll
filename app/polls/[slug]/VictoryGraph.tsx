"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  ReactFlow,
  Handle,
  Position,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PairElement {
  name: string;
  votes: number;
}

interface Pair {
  winner: PairElement;
  loser: PairElement;
}

interface NodesData {
  [option: string]: {
    above: string[];
    below: string[];
  };
}

interface VictoryGraphProps {
  options: string[];
  rankedPairs: Pair[];
  history: NodesData[];
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}


// Custom option node that displays candidates as rounded circles with glowing accent rings
const OptionNode = ({
  data,
}: {
  data: { label: string; isWinner: boolean; isLoser: boolean };
}) => {
  return (
    <div
      className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center text-center text-[10px] p-2 font-bold border transition-all duration-300 bg-white dark:bg-slate-900 shadow-md text-foreground select-none relative",
        data.isWinner &&
          "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-emerald-500/25 ring-4 ring-emerald-500/20 scale-105",
        data.isLoser &&
          "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 shadow-rose-500/25 ring-4 ring-rose-500/20 scale-105"
      )}
    >
      {/* Target handle on top */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-1.5 h-1.5 bg-muted-foreground/30 border-0"
        style={{ top: 0 }}
      />
      {/* Source handle on bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-1.5 h-1.5 bg-muted-foreground/30 border-0"
        style={{ bottom: 0 }}
      />
      <span className="truncate max-w-full">{data.label}</span>
    </div>
  );
};

const nodeTypes = {
  optionNode: OptionNode,
};

export default function VictoryGraph({
  options,
  rankedPairs,
  history,
  step,
  setStep,
}: VictoryGraphProps) {
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Avoid hydration mismatch by waiting for client-side mounting
  useEffect(() => {
    setMounted(true);
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setStep((prevStep) => {
          if (prevStep >= history.length) {
            setIsPlaying(false);
            return prevStep;
          }
          return prevStep + 1;
        });
      }, 1500);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, history.length, setStep]);

  // Construct circular nodes layout
  const nodes = useMemo(() => {
    const totalOptions = options.length;
    const currentPair = rankedPairs[step - 1];

    return options.map((opt, idx) => {
      // Position options in a circle
      const angle = (2 * Math.PI * idx) / totalOptions - Math.PI / 2;
      const radius = 100;
      const x = 160 + radius * Math.cos(angle);
      const y = 110 + radius * Math.sin(angle);

      const isWinner = currentPair?.winner.name === opt;
      const isLoser = currentPair?.loser.name === opt;

      return {
        id: opt,
        type: "optionNode",
        position: { x, y },
        data: {
          label: opt,
          isWinner,
          isLoser,
        },
      } as Node;
    });
  }, [options, rankedPairs, step]);

  // Construct edges showing locked and skipped pathways
  const edges = useMemo(() => {
    const edgeList: Edge[] = [];

    for (let i = 0; i < step; i++) {
      const pair = rankedPairs[i];
      if (!pair) continue;

      const w = pair.winner.name;
      const l = pair.loser.name;
      const isCurrent = i === step - 1;
      const margin = pair.winner.votes - pair.loser.votes;

      const nodesAtStep = history[i];
      const isLocked = nodesAtStep[l]?.above.includes(w);

      if (isLocked) {
        // Locked victory path
        edgeList.push({
          id: `${w}->${l}`,
          source: w,
          target: l,
          animated: isCurrent,
          label: `+${margin}`,
          style: {
            stroke: isCurrent ? "var(--primary)" : "#10b981", // green or active theme primary
            strokeWidth: isCurrent ? 3.5 : 2,
          },
          labelStyle: {
            fill: isCurrent ? "var(--primary)" : "#10b981",
            fontWeight: 800,
            fontSize: 10,
          },
        });
      } else if (isCurrent) {
        // Cycle detected at current step
        edgeList.push({
          id: `${w}->${l}-skipped`,
          source: w,
          target: l,
          label: "Cycle!",
          style: {
            stroke: "#f43f5e", // red
            strokeWidth: 2,
            strokeDasharray: "4 4",
          },
          labelStyle: {
            fill: "#f43f5e",
            fontWeight: 800,
            fontSize: 10,
          },
        });
      }
    }

    return edgeList;
  }, [rankedPairs, history, step]);

  if (!mounted) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 border border-indigo-100/50 dark:border-slate-800/50 rounded-xl">
        <span className="text-xs text-muted-foreground animate-pulse">Loading Victory Graph...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* React Flow Viewport Container */}
      <div className="h-[280px] w-full border border-indigo-100/50 dark:border-slate-800/50 rounded-xl bg-slate-50/40 dark:bg-slate-950/10 backdrop-blur-xs relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          zoomOnScroll={false}
          panOnDrag={false}
          preventScrolling={true}
          nodesDraggable={false}
          nodesConnectable={false}
        />
        
        {/* Floating graph status indicator */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 border text-[10px] font-bold text-muted-foreground">
          MARGINE GRAPH VIEW
        </div>
      </div>

      {/* Autoplay & Custom Player Controller */}
      <div className="flex items-center justify-between border border-indigo-100/50 dark:border-slate-800/50 p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/30">
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause" : "Auto Play"}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 cursor-pointer"
            disabled={step === 1}
            onClick={() => {
              setIsPlaying(false);
              setStep(step - 1);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 cursor-pointer"
            disabled={step === history.length}
            onClick={() => {
              setIsPlaying(false);
              setStep(step + 1);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 cursor-pointer"
            disabled={step === 1}
            onClick={() => {
              setIsPlaying(false);
              setStep(1);
            }}
            title="Reset to Step 1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="text-xs font-bold text-muted-foreground uppercase mr-1">
          Step {step} of {history.length}
        </div>
      </div>
    </div>
  );
}
