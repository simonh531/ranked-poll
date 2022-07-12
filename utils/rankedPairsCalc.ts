interface UniqueVote { // count represents number of people that voted this way
  vote: string[]
  lowVote: string[]
  count: number
}

export interface PairMapping {
  [key:string]: [number, number] // first number is first option in key, second is second
}

interface PairElement {
  name: string
  votes: number
}
export interface Pair {
  winner: PairElement
  loser: PairElement
}

export interface Nodes {
  [option: string]: {
    above: string[]
    below: string[]
  }
}

const isSourceAfterRemove = (aboveNodes:string[], prevRankings:string[]) => {
  let isSource = true;
  let i = 0;
  while (isSource && i < aboveNodes.length) {
    if (!prevRankings.includes(aboveNodes[i])) {
      isSource = false;
    }
    i += 1;
  }
  return isSource;
};

const getAllAbove = (name:string, nodes:Nodes, aboveArray:string[]) => {
  if (!aboveArray.includes(name)) {
    aboveArray.push(name);
  }
  nodes[name].above.forEach((nodeName) => getAllAbove(nodeName, nodes, aboveArray));
  return aboveArray;
};

const getAllBelow = (name:string, nodes:Nodes, belowArray:string[]) => {
  if (!belowArray.includes(name)) {
    belowArray.push(name);
  }
  nodes[name].below.forEach((nodeName) => getAllBelow(nodeName, nodes, belowArray));
  return belowArray;
};

const addNodeToTree = (winner:string, loser:string, nodes:Nodes) => {
  const allAbove = getAllAbove(winner, nodes, []);
  const allBelow = getAllBelow(loser, nodes, []);
  let noLoop = true;
  let i = 0;
  while (noLoop && i < allAbove.length) {
    // nodes above the winner being below the loser causes a cycle
    // winner goes above the loser so the link creates a loop
    if (allBelow.includes(allAbove[i])) {
      noLoop = false;
    }
    i += 1;
  }
  if (noLoop) {
    nodes[loser].above.push(winner);
    nodes[winner].below.push(loser);
    return true;
  }
  return false;
};

export const makePairs = (
  pollResult:UniqueVote[],
  options:string[],
) => {
  const pairs:PairMapping = {};

  options.forEach((option, index) => {
    for (let i = index + 1; i < options.length; i += 1) {
      pairs[JSON.stringify([option, options[i]].sort())] = [0, 0];
    }
  });

  function tally(higher:string, lower:string, count:number) {
    const alphabeticalOrder = [higher, lower].sort();
    const key = JSON.stringify(alphabeticalOrder);
    let higherIndex = 0;
    if (alphabeticalOrder[0] !== higher) {
      higherIndex = 1;
    }
    pairs[key][higherIndex] += count;
  }

  pollResult.forEach((uniqueVote) => {
    const { vote, lowVote, count } = uniqueVote;
    const unrankedOptions = options.filter(
      (option) => !vote.includes(option) && !lowVote.includes(option),
    );
    // all options exist in either vote, unrankedOptions, or lowVote

    vote.forEach((higher, index) => { // high votes beat lower high votes, unranked, and low votes
      if (options.includes(higher)) { // data validation
        for (let i = index + 1; i < vote.length; i += 1) {
          if (options.includes(vote[i])) { // data validation
            tally(higher, vote[i], count);
          }
        }

        unrankedOptions.forEach((lower) => {
          tally(higher, lower, count);
        });

        lowVote.forEach((lower) => {
          tally(higher, lower, count);
        });
      }
    });

    unrankedOptions.forEach((higher) => { // unranked beat low votes
      // by definition unranked options are from options so don't need validation
      lowVote.forEach((lower) => {
        if (options.includes(lower)) { // data validation
          tally(higher, lower, count);
        }
      });
    });

    lowVote.forEach((higher, index) => { // low votes beat lower low votes
      if (options.includes(higher)) { // data validation
        for (let i = index + 1; i < lowVote.length; i += 1) {
          if (options.includes(lowVote[i])) { // data validation
            tally(higher, lowVote[i], count);
          }
        }
      }
    });
  });
  return pairs;
};

const calcStrength = (vote1:number, vote2:number) => Math.abs(vote1 - vote2) / (vote1 + vote2 + 1);
const calcFallback = (vote1:number, vote2:number) => vote1 + vote2;

// rank based on strength of victory
// calculated by number of votes / (total votes + 1)
// reason for this is it respects proportion of votes while avoiding
// 1 - 0 being 100% and being unreasonably powerful. Skew disappears
// at higher vote counts. If proportion is same, whichever has most
// votes total wins
// Ties start at 0 and should trend towards 0.5 at limit infinity
// Wins start at 0.5 and should trend towards 1 at limit infinity
export const rankPairs = (pairs:PairMapping):Pair[] => Object.entries(pairs).sort(
  ([, pair1], [, pair2]) => {
    const proportion1 = calcStrength(pair1[0], pair1[1]);
    const proportion2 = calcStrength(pair2[0], pair2[1]);
    if (proportion1 !== proportion2) {
      return proportion2 - proportion1;
    }
    return calcFallback(pair2[0], pair2[1]) - calcFallback(pair1[0], pair1[1]);
  },
).map(([keys, votes]) => {
  const pairNames:[string, string] = JSON.parse(keys);
  const option1 = {
    name: pairNames[0],
    votes: votes[0],
  };
  const option2 = {
    name: pairNames[1],
    votes: votes[1],
  };
  if (votes[0] > votes[1]) {
    return {
      winner: option1,
      loser: option2,
    };
  } if (votes[1] > votes[0]) {
    return {
      winner: option2,
      loser: option1,
    };
  } return {
    winner: option1,
    loser: option2,
  };
});

function deepCopyNodes(nodes:Nodes) {
  const nodesCopy = {};
  Object.entries(nodes).sort().forEach(([key, values]) => {
    nodesCopy[key] = {
      above: [...values.above],
      below: [...values.below],
    };
  });
  return nodesCopy;
}

export const makeNodes = (rankedPairs:Pair[], options:string[]) => {
  const history:Nodes[] = [];
  let nodes:Nodes = {};
  options.forEach((option) => {
    nodes[option] = {
      above: [],
      below: [],
    };
  });

  let tieResolver:Nodes|null = null;
  let tieResolverFailed = false;

  rankedPairs.forEach((pair, index) => {
    if (pair.winner.votes !== pair.loser.votes) {
      // doesn't run if the match is a tie. It adds no information for building the tree
      let endTieResolver = true;
      if (index !== rankedPairs.length - 1
        && pair.winner.votes === rankedPairs[index + 1].winner.votes
        && pair.loser.votes === rankedPairs[index + 1].loser.votes
      ) {
        // this match and the next match are exactly identical so either both go into
        // the node tree or neither do. We do this by deep copying the nodes and seeing if
        // both go in. We reject the change if this causes a loop.
        if (!tieResolver) {
          tieResolver = deepCopyNodes(nodes);
        }
        endTieResolver = false;
      }

      if (tieResolver) {
        // currently processing identical matches so we need to resolve
        const check = addNodeToTree(pair.winner.name, pair.loser.name, tieResolver);
        if (!check) { // tie resolver failed so we note it for when it ends
          tieResolverFailed = true;
        }
        if (endTieResolver) {
          if (!tieResolverFailed) {
            // everything passed
            nodes = tieResolver;
          }
          // reset everything
          tieResolver = null;
          tieResolverFailed = false;
        }
      } else {
        addNodeToTree(pair.winner.name, pair.loser.name, nodes);
      }
    }
    if (tieResolver) {
      history.push(deepCopyNodes(tieResolver));
    } else {
      history.push(deepCopyNodes(nodes));
    }
  });
  return { nodes, history };
};

export const makeRanks = (nodes:Nodes, pairs:PairMapping, options:string[]) => {
  const rankings:string[][] = [[]];
  const ratios:number[] = [];
  let unranked = options.filter((option) => {
    if (!nodes[option].above.length) {
      // nothing above it therefore is a source
      rankings[0].push(option);
      return false;
    }
    return true;
  });
  let lastUnrankedLength = 0;
  while (unranked.length && lastUnrankedLength !== unranked.length) {
    // if length is the same, filter failed and time to stop
    const prevRankings = [...rankings.flat()];
    rankings.push([]);
    lastUnrankedLength = unranked.length;
    unranked = unranked.filter((key) => {
      if (isSourceAfterRemove(nodes[key].above, prevRankings)) {
        // the nodes above are already in the rankings so it's okay if they're there
        rankings[rankings.length - 1].push(key);
        return false;
      }
      return true;
    });

    let winTotal = 0;
    let loseTotal = 0;
    rankings[rankings.length - 1].forEach((pair1) => {
      rankings[rankings.length - 2].forEach((pair2) => {
        const key = JSON.stringify([pair1, pair2].sort());
        if (pairs[key][0] > pairs[key][1]) {
          winTotal += pairs[key][0];
          loseTotal += pairs[key][1];
        } else {
          winTotal += pairs[key][1];
          loseTotal += pairs[key][0];
        }
      });
    });

    ratios.push(loseTotal / winTotal);
  }
  const actualRatio = ratios.reduce(
    (array, value) => [...array, array[array.length - 1] * value],
    [1],
  );
  const ratioTotal = actualRatio.reduce(
    (total, value, index) => total + value * rankings[index].length,
    0,
  );
  const ratioPercents = actualRatio.map(
    (number) => number / ratioTotal,
  );
  return {
    rankings, ratioPercents,
  };
};

export function fromPairsCalc(pairs:PairMapping = {}, options:string[] = []) {
  const rankedPairs = rankPairs(pairs);
  const { nodes, history } = makeNodes(rankedPairs, options);
  const { rankings, ratioPercents } = makeRanks(nodes, pairs, options);

  return {
    pairs,
    rankedPairs,
    rankings,
    ratioPercents,
    history,
  };
}

export default function rankedPairsCalc(pollResult:UniqueVote[] = [], options:string[] = []) {
  const pairs = makePairs(pollResult, options);
  return fromPairsCalc(pairs, options);
}
