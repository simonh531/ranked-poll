import React, { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  gql, useQuery, useMutation, useLazyQuery,
} from '@apollo/client';
import styled from 'styled-components';

import PollOption from '../../components/pollOption';

import { Card, Description } from '../../style/card';

const Main = styled.main`
  min-height: calc(100vh - 40px);
  background-color: ${(props) => props.backgroundColor};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Question = styled.h1`
  font-family: Merriweather, serif;
  border-bottom: 1px solid black;
  margin: 8px 0;
  width: 100%;
  padding: 4px;
`;

const Ranking = styled.div`
  border-bottom: 1px solid black;
`;

const CardBottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const CardBottomRight = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const Winner = styled.div`
  margin: 8px 0;
  font-size: 1.2em;
  font-family: Merriweather, serif;
`;

const Header = styled.h3`
  font-size: ${(props) => props.headerSize}em;
  font-family: Merriweather, serif;
  font-weight: 400;
  cursor: pointer;
`;

const HeaderControl = styled.span`
  font-size: 1.4em;
  vertical-align: bottom;
`;

const Children = styled.div`
  font-family: Open Sans, sans-serif;
`;

const PreferenceHeader = styled.th`
  text-align: left;
`;

const TableNumber = styled.td`
  text-align: right;
`;

const PairTable = styled.table`
  margin: 8px;
`;

const PairSpacing = styled.tr`
  height: 1em;
`;

const PairBox = styled.td`
  font-weight: ${(props) => (props.winner ? '600' : '400')};
`;

const TotalVotes = styled.div`
  font-family: Open Sans, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SubmitButton = styled.button`
  margin-right: 1ch;
  font-family: Open Sans, sans-serif;
`;

const VoteSubmitted = styled.div`
  margin-right: 1ch;
  font-family: Open Sans, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const POLL = gql`
  query poll($id: ID!) {
    poll(id: $id) {
      title
      description
      options
      count
    }
  }
`;

const POLL_RESULT = gql`
  query pollResult($id: ID!) {
    pollResult(id: $id) {
      vote
      count
    }
  }
`;

const VOTE = gql`
  mutation vote($input: VoteInput!) {
    vote(input: $input)
  }
`;

const Section = ({ children, title, headerSize }) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);

  return (
    <>
      <Header headerSize={headerSize} onClick={toggleShow}>
        <HeaderControl className="material-icons">
          {show ? 'expand_less' : 'expand_more'}
        </HeaderControl>
        {title}
      </Header>
      {show ? (
        <Children>
          {children}
        </Children>
      ) : null}
    </>
  );
};

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

// class RankedNode {
//   constructor(name) {
//     this.name = name;
//     this.above = [];
//     this.below = [];

//     this.getAllAbove = (_) => {
//       let set = _;
//       if (!set) {
//         set = new Set();
//       }
//       set.add(this.name);
//       this.above.forEach((node) => node.getAllAbove(set));
//       return [...set];
//     };

//     this.getAllBelow = (_) => {
//       let set = _;
//       if (!set) {
//         set = new Set();
//       }
//       set.add(this.name);
//       this.below.forEach((node) => node.getAllBelow(set));
//       return [...set];
//     };
//   }
// }

const Results = ({ pairs, votes }) => (
  <div>
    <Section title="Advanced" headerSize="1.4">
      <Section title="Votes" headerSize="1.2">
        <table>
          <thead>
            <tr>
              <th>Count</th>
              <PreferenceHeader>Preferences</PreferenceHeader>
            </tr>
          </thead>
          <tbody>
            {votes.map((datum) => (
              <tr key={datum.vote}>
                <TableNumber>{datum.count}</TableNumber>
                <td>{datum.vote.join(' > ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Section title="Pair Results" headerSize="1.2">
        <PairTable>
          {pairs.map((pairData, index) => {
            const pairWinner = Object.entries(pairData).reduce((currentWinner, challenger) => {
              if (currentWinner[1] === challenger[1]) {
                return [''];
              } if (currentWinner[1] > challenger[1]) {
                return currentWinner;
              }
              return challenger;
            });
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={index}>
                <tbody>
                  {Object.entries(pairData).map(([option, count]) => (
                    <tr key={option}>
                      <PairBox winner={option === pairWinner[0]}>{count}</PairBox>
                      <PairBox winner={option === pairWinner[0]}>{option}</PairBox>
                    </tr>
                  ))}
                </tbody>
                <tbody>
                  <PairSpacing />
                </tbody>
              </Fragment>
            );
          })}
        </PairTable>
      </Section>
    </Section>
  </div>
);

const Poll = () => {
  const router = useRouter();
  const { id } = router.query;
  const { /* loading: pollLoading, */ data: pollData } = useQuery(POLL, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  });
  // console.log(pollData);
  const [vote, { data: voteData }] = useMutation(VOTE);
  // console.log(voteData);

  const [
    getPollResult,
    { /* loading: pollResultLoading, */ data: pollResultData },
  ] = useLazyQuery(POLL_RESULT, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  });
  // console.log(pollResultData);

  const [rank, setRank] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (voteData?.vote) {
      setSubmitted(true);
    }
  }, [voteData?.vote]);

  const {
    title, description, options, count,
  } = pollData?.poll || {};

  // begin calculation logic
  const pairs = {};
  pollResultData?.pollResult.forEach((datum) => {
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
    const pair1Options = Object.keys(pair1);
    const pair2Options = Object.keys(pair2);
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
    const option = Object.keys(pair);
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
        const option2 = Object.keys(pair2);
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
            Object.entries(nodes).forEach(([key, values]) => {
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
        const optionKeys = Object.keys(pairs[key]);
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

  // end calculation logic

  let submit = null;
  if (submitted) {
    submit = <VoteSubmitted>Vote Submitted</VoteSubmitted>;
  } else if (!pollResultData) {
    submit = (
      <SubmitButton
        type="button"
        disabled={!rank.length}
        onClick={() => vote({
          variables: {
            input: {
              user: null,
              pollId: id,
              vote: rank,
            },
          },
        })}
      >
        Submit
      </SubmitButton>
    );
  }

  return (
    <Main backgroundColor="skyblue">
      <Card>
        <Question>
          {title}
        </Question>
        {description ? (
          <Description>
            {description}
          </Description>
        ) : null}
        {rank.length && !pollResultData ? (
          <Ranking>
            {rank.map((option, index) => {
              const onCancel = () => {
                const newRank = [...rank];
                newRank.splice(rank.indexOf(option), 1);
                setRank(newRank);
              };
              const upClick = () => {
                const newRank = [...rank];
                newRank.splice(rank.indexOf(option), 1);
                newRank.splice(index - 1, 0, option);
                setRank(newRank);
              };
              const downClick = () => {
                const newRank = [...rank];
                newRank.splice(rank.indexOf(option), 1);
                newRank.splice(index + 1, 0, option);
                setRank(newRank);
              };
              return (
                <PollOption
                  key={option}
                  name={option}
                  rank={index + 1}
                  lastOne={index === rank.length - 1}
                  onCancel={onCancel}
                  upClick={upClick}
                  downClick={downClick}
                  disabled={submitted}
                />
              );
            })}
          </Ranking>
        ) : null}
        {options && !pollResultData ? (
          <div>
            {options.filter((option) => !rank.includes(option)).map((option) => {
              const boxClick = () => {
                setRank([...rank, option]);
              };
              return (
                <PollOption
                  key={option}
                  name={option}
                  boxClick={boxClick}
                  disabled={submitted}
                />
              );
            })}
          </div>
        ) : null}
        {pollResultData ? (
          <div>
            {options.map((option) => {
              const index = rankings.findIndex((array) => array.includes(option));
              return (
                <PollOption
                  key={option}
                  name={option}
                  rank={index + 1 || '0'}
                  percent={`${(ratioPercents[index] || 0).toFixed(2)}%`}
                  disabled
                />
              );
            })}
          </div>
        ) : null}
        <CardBottom>
          {submit}
          <TotalVotes>
            Total Votes:
            {' '}
            {count}
          </TotalVotes>
          <CardBottomRight>
            <input type="text" value={`rnkd.pl/${id}`} disabled />
            <button
              type="button"
              onClick={() => getPollResult({
                variables: { id },
              })}
            >
              {pollResultData
                ? <span className="material-icons">sync</span>
                : 'See Results'}
            </button>
          </CardBottomRight>
        </CardBottom>
        {pollResultData ? (
          <Results
            pairs={rankedPairs}
            votes={pollResultData.pollResult}
          />
        ) : null}
      </Card>
    </Main>
  );
};

export default Poll;
