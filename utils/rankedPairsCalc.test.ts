import { describe, expect, test } from "bun:test";
import rankedPairsCalc, {
  makePairs,
  rankPairs,
  makeNodes,
  makeRanks,
} from "./rankedPairsCalc";

describe("rankedPairsCalc Algorithm", () => {
  const options = ["TypeScript", "Rust", "Go"];

  test("makePairs: should tally pairwise votes correctly", () => {
    const ballots = [
      {
        vote: ["TypeScript", "Rust"],
        lowVote: ["Go"],
        count: 5,
      },
      {
        vote: ["Rust"],
        lowVote: ["TypeScript", "Go"],
        count: 3,
      },
    ];

    const pairs = makePairs(ballots, options);

    // TypeScript vs Rust:
    // Alphabetically: ["Rust", "TypeScript"]
    // Index 0 represents Rust, Index 1 represents TypeScript
    // Ballots 1 (5 count): TS beats Rust -> TS (Index 1) gets 5
    // Ballots 2 (3 count): Rust beats TS -> Rust (Index 0) gets 3
    const tsRustKey = JSON.stringify(["Rust", "TypeScript"].sort());
    expect(pairs[tsRustKey]).toEqual([3, 5]);

    // Rust vs Go:
    // Alphabetically: ["Go", "Rust"]
    // Index 0 represents Go, Index 1 represents Rust
    // Ballots 1 (5 count): Rust beats Go -> Rust (Index 1) gets 5
    // Ballots 2 (3 count): Rust beats Go -> Rust (Index 1) gets 3
    // Total = [0, 8]
    const rustGoKey = JSON.stringify(["Go", "Rust"].sort());
    expect(pairs[rustGoKey]).toEqual([0, 8]);
  });

  test("rankPairs: should sort pairs by strength of victory", () => {
    const pairs = {
      [JSON.stringify(["Rust", "TypeScript"].sort())]: [3, 5] as [number, number], // diff = 2
      [JSON.stringify(["Go", "Rust"].sort())]: [0, 8] as [number, number],         // diff = 8 (stronger)
    };

    const ranked = rankPairs(pairs);

    // Stronger victory should come first: Rust beats Go (diff = 8)
    expect(ranked[0].winner.name).toBe("Rust");
    expect(ranked[0].loser.name).toBe("Go");
    expect(ranked[1].winner.name).toBe("TypeScript");
    expect(ranked[1].loser.name).toBe("Rust");
  });

  test("makeNodes & makeRanks: should rank candidates and handle cycles", () => {
    // Classic Condorcet Cycle (A beats B, B beats C, C beats A)
    const optionsCycle = ["A", "B", "C"];
    const pairs = {
      [JSON.stringify(["A", "B"].sort())]: [10, 5] as [number, number], // A beats B (strength = 5/16)
      [JSON.stringify(["B", "C"].sort())]: [10, 4] as [number, number], // B beats C (strength = 6/15) - stronger victory!
      [JSON.stringify(["A", "C"].sort())]: [4, 10] as [number, number], // C beats A (strength = 6/15) - stronger victory!
    };

    const rankedPairs = rankPairs(pairs);
    const { nodes, history } = makeNodes(rankedPairs, optionsCycle);

    // The cycle lock should discard the weakest connection (A > B) to prevent a cycle
    // B > C and C > A are locked. A > B is discarded.
    expect(nodes["C"].above).toContain("B"); // B -> C
    expect(nodes["A"].above).toContain("C"); // C -> A
    expect(nodes["B"].above).not.toContain("A"); // A -> B is NOT locked in (skipped to prevent cycle!)

    const { rankings } = makeRanks(nodes, pairs, optionsCycle);
    expect(rankings[0]).toContain("B"); // B is the winner (source)
    expect(rankings[1]).toContain("C"); // C is second
    expect(rankings[2]).toContain("A"); // A is last
  });

  test("rankedPairsCalc integration: end-to-end calculations", () => {
    const ballots = [
      { vote: ["TypeScript", "Rust"], lowVote: ["Go"], count: 10 },
      { vote: ["Rust", "TypeScript"], lowVote: ["Go"], count: 5 },
    ];

    const result = rankedPairsCalc(ballots, options);

    expect(result.rankings[0]).toContain("TypeScript");
    expect(result.rankings[1]).toContain("Rust");
    expect(result.rankings[2]).toContain("Go");
  });
});
