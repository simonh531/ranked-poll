const getKey = (pair1, pair2) => [pair1.replaceAll('/', '\\/'), pair2.replaceAll('/', '\\/')].sort().join('/');

const isSourceAfterRemove = (array1, array2) => array1.reduce((value, name) => {
  if (value === false) {
    return false;
  }
  return array2.includes(name);
}, true);

const getAllAbove = (name, nodes, _) => {
  let set = _;
  if (!set) {
    set = new Set();
  }
  set.add(name);
  nodes[name].above.forEach((nodeName) => getAllAbove(nodeName, nodes, set));
  return [...set];
};

const getAllBelow = (name, nodes, _) => {
  let set = _;
  if (!set) {
    set = new Set();
  }
  set.add(name);
  nodes[name].below.forEach((nodeName) => getAllBelow(nodeName, nodes, set));
  return [...set];
};

const addNodeToTree = (winner, loser, nodes) => {
  if (!getAllAbove(winner, nodes).reduce((value, name) => {
    // nodes above the winner being below the loser causes a cycle
    // winner goes above the loser so the link creates a loop
    if (value === true) {
      return true;
    }
    return getAllBelow(loser, nodes).includes(name);
  }, false)) {
    nodes[loser].above.push(winner);
    nodes[winner].below.push(loser);
    return true;
  }
  return false;
};

export default function rankedPairsCalc(pollResult = [], options = []) {
  const pairs = {};
  pollResult.forEach((datum) => {
    const unrankedOptions = options.filter((option) => !datum.vote.includes(option));
    // option was not explicitly voted for
    datum.vote.forEach((higher, index) => {
      if (options.includes(higher)) {
        const tally = (lower) => {
          const key = getKey(higher, lower);
          if (!pairs[key]) {
            pairs[key] = {
              [higher]: datum.count,
              [lower]: 0,
            };
          } else {
            pairs[key] = {
              ...pairs[key],
              [higher]: pairs[key][higher] + datum.count,
            };
          }
        };

        datum.vote.slice(index + 1).forEach((lower) => {
          if (options.includes(lower)) {
            tally(lower);
          }
        });
        unrankedOptions.forEach((lower) => {
          tally(lower);
        });
      }
    });
  });

  const rankedPairs = Object.values(pairs).sort((pair1, pair2) => {
    const pair1Options = Object.keys(pair1).sort();
    const pair2Options = Object.keys(pair2).sort();
    let pair1Winner;
    let pair2Winner;
    let pair1Loser;
    let pair2Loser;
    if (pair1[pair1Options[0]] > pair1[pair1Options[1]]) {
      [pair1Winner, pair1Loser] = pair1Options;
    } else {
      [pair1Loser, pair1Winner] = pair1Options;
    }
    if (pair2[pair2Options[0]] > pair2[pair2Options[1]]) {
      [pair2Winner, pair2Loser] = pair2Options;
    } else {
      [pair2Loser, pair2Winner] = pair2Options;
    }

    if (pair1[pair1Winner] !== pair2[pair2Winner]) {
      return pair2[pair2Winner] - pair1[pair1Winner];
    }
    return pair1[pair1Loser] - pair2[pair2Loser];
  });

  let nodes = options ? options.reduce((object, option) => ({
    ...object,
    [option]: {
      above: [],
      below: [],
    },
  }), {}) : {};

  let tieResolver = {};

  rankedPairs.forEach((pair, index) => {
    const option = Object.keys(pair).sort();
    let winner;
    let loser;
    if (pair[option[0]] > pair[option[1]]) {
      [winner, loser] = option;
    } else if (pair[option[0]] < pair[option[1]]) {
      [loser, winner] = option;
    }
    if (winner && loser) {
      // doesn't run if there is a numeric tie
      let endTieResolver = false;
      if (index !== rankedPairs.length - 1) {
        let winner2;
        let loser2;
        const pair2 = rankedPairs[index + 1];
        const option2 = Object.keys(pair2).sort();
        if (pair2[option2[0]] > pair2[option2[1]]) {
          [winner2, loser2] = option2;
        } else if (pair2[option2[0]] < pair2[option2[1]]) {
          [loser2, winner2] = option2;
        }

        if (pair[winner] === pair2[winner2] && pair[loser] === pair2[loser2]) {
          // need to start tie resolver by deep copying from nodes
          if (!Object.keys(tieResolver).length) {
            // tie resolver not already initialized
            tieResolver = {};
            Object.entries(nodes).sort().forEach(([key, values]) => {
              tieResolver[key] = {
                above: [...values.above],
                below: [...values.below],
              };
            });
          }
        } else {
          endTieResolver = true;
        }
      } else {
        endTieResolver = true;
      }

      if (Object.keys(tieResolver).length) {
        // tieResolver initialized
        const check = addNodeToTree(winner, loser, tieResolver);
        if (!check) {
          tieResolver = {};
        } else if (endTieResolver) {
          // the check passed;
          nodes = { ...tieResolver };
        }
      } else {
        addNodeToTree(winner, loser, nodes);
      }
    }
  });

  // copy into a const so that eslint stops yelling at me
  const completedNodes = { ...nodes };

  const rankings = [[]];
  const ratios = [];
  let unranked = options ? options.filter((option) => {
    if (!nodes[option].above.length) {
      // nothing above it therefore is a source
      rankings[0].push(option);
      return false;
    }
    return true;
  }) : [];
  let lastUnrankedLength = 0;
  while (unranked.length && lastUnrankedLength !== unranked.length) {
    // length is the same indicating filter failed
    const prevRankings = [...rankings.flat()];
    rankings.push([]);
    lastUnrankedLength = unranked.length;
    unranked = unranked.filter((key) => {
      if (isSourceAfterRemove(completedNodes[key].above, prevRankings)) {
        // the nodes above are already in the rankings
        rankings[rankings.length - 1].push(key);
        return false;
      }
      // aboveChecks[key] = [...nodes[key].above];
      return true;
    });

    let winTotal = 0;
    let loseTotal = 0;
    rankings[rankings.length - 1].forEach((pair1) => {
      rankings[rankings.length - 2].forEach((pair2) => {
        const key = getKey(pair1, pair2);
        const optionKeys = Object.keys(pairs[key]).sort();
        if (pairs[key][optionKeys[0]] > pairs[key][optionKeys[1]]) {
          winTotal += pairs[key][optionKeys[0]];
          loseTotal += pairs[key][optionKeys[1]];
        } else {
          winTotal += pairs[key][optionKeys[1]];
          loseTotal += pairs[key][optionKeys[0]];
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
    (number) => ((number / ratioTotal) * 100),
  );

  return {
    rankings,
    rankedPairs,
    ratioPercents,
  };
}
