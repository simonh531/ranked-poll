import React from "react";
import CalculationPlayground from "./CalculationPlayground";

export const metadata = {
  title: "Calculation Playground | Ranked Poll",
  description: "Simulate pairwise elections and inspect how the Ranked Pairs algorithm resolves Condorcet cycles.",
};

export default function CalculationPage() {
  return <CalculationPlayground />;
}
