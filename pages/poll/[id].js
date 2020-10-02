import React, { useState, useEffect } from 'react';
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
  margin-bottom: 8px;
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
  display: flex;
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

const PairBox = styled.td`
  font-weight: ${(props) => (props.winner ? '600' : '400')};
`;

const POLL = gql`
  query poll($id: ID!) {
    poll(id: $id) {
      title
      description
      options
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

const Results = ({ options, data }) => {
  const pairs = {};
  data.pollResult.forEach((datum) => {
    const optionsCopy = [...options];
    // out here so that the first option doesn't come back in
    datum.vote.forEach((pair1, index) => {
      const pair1Index = options.indexOf(pair1);
      if (pair1Index !== -1) {
        // preference exists in options
        optionsCopy.splice(optionsCopy.indexOf(pair1), 1);
        const unrankedOptions = [...optionsCopy];

        const tally = (pair2, pair2Index) => {
          const pair1String = pair1.replaceAll('/', '\\/');
          const pair2String = pair2.replaceAll('/', '\\/');
          let key;
          if (pair1Index < pair2Index) {
            key = `${pair1String}/${pair2String}`;
          } else if (pair1Index > pair2Index) {
            key = `${pair2String}/${pair1String}`;
          }
          if (!pairs[key]) {
            pairs[key] = {
              [pair1]: datum.count,
              [pair2]: 0,
            };
          } else {
            pairs[key] = {
              ...pairs[key],
              [pair1]: pairs[key][pair1] + datum.count,
            };
          }
        };

        const lowerPlaces = datum.vote.filter((_, pair2Index) => pair2Index > index);
        lowerPlaces.forEach((pair2) => {
          const pair2Index = options.indexOf(pair2);
          if (pair2Index !== -1) {
            unrankedOptions.splice(unrankedOptions.indexOf(pair2), 1);
            tally(pair2, pair2Index);
          }
        });
        unrankedOptions.forEach((pair2) => {
          const pair2Index = options.indexOf(pair2);
          tally(pair2, pair2Index);
        });
      }
    });
  });
  const wins = {};
  Object.values(pairs).forEach((pair) => {
    const option = Object.keys(pair);
    if (pair[option[0]] > pair[option[1]]) {
      if (!wins[option[0]]) {
        wins[option[0]] = 1;
      } else {
        wins[option[0]] += 1;
      }
    } else if (pair[option[0]] < pair[option[1]]) {
      if (!wins[option[1]]) {
        wins[option[1]] = 1;
      } else {
        wins[option[1]] += 1;
      }
    }
  });
  const winner = Object.entries(wins).find(([_, winCount]) => winCount === options.length - 1);
  const dominatingSet = [];
  if (!winner) {
    let highestWins = 0;
    let tempSet = [];
    Object.entries(wins).forEach(([option, winCount]) => {
      if (winCount > highestWins) {
        highestWins = winCount;
        tempSet = [option];
      } else if (winCount === highestWins) {
        tempSet.push(option);
      }
    });
    dominatingSet.push(...tempSet);
  }
  return (
    <div>
      <Winner>
        <div>
          {winner ? `Condorcet Winner: ${winner[0]}` : 'No Condorcet Winner'}
        </div>
        <div>
          {dominatingSet.length ? `Dominating Set: ${dominatingSet.join(', ')}` : null}
        </div>
      </Winner>
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
              {data.pollResult.map((datum) => (
                <tr key={datum.vote}>
                  <TableNumber>{datum.count}</TableNumber>
                  <td>{datum.vote.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
        <Section title="Pairs" headerSize="1.2">
          {Object.entries(pairs).map(([key, pairData]) => {
            const pairWinner = Object.entries(pairData).reduce((currentWinner, challenger) => {
              if (currentWinner[1] === challenger[1]) {
                return [''];
              } if (currentWinner[1] > challenger[1]) {
                return currentWinner;
              }
              return challenger;
            });
            return (
              <PairTable key={key}>
                <tbody>
                  {Object.entries(pairData).map(([option, count]) => (
                    <tr key={option}>
                      <PairBox winner={option === pairWinner[0]}>{option}</PairBox>
                      <PairBox winner={option === pairWinner[0]}>{count}</PairBox>
                    </tr>
                  ))}
                </tbody>
              </PairTable>
            );
          })}
        </Section>
        <Section title="Wins" headerSize="1.2">
          {Object.entries(wins).map(([option, count]) => (
            <div key={option}>
              {`${option}: ${count}`}
            </div>
          ))}
        </Section>
      </Section>
    </div>
  );
};

const Poll = () => {
  const router = useRouter();
  const { id } = router.query;
  const { loading: pollLoading, data: pollData } = useQuery(POLL, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  });
  // console.log(pollData);
  const [vote, { data: voteData }] = useMutation(VOTE);
  // console.log(voteData);

  const [
    getPollResult,
    { loading: pollResultLoading, data: pollResultData },
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

  const { title, description, options } = pollData?.poll || {};
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
        {rank.length ? (
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
        {options ? (
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
        <CardBottom>
          {submitted ? <div>Vote Submitted</div> : (
            <button
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
            </button>
          )}
          <CardBottomRight>
            <input type="text" value={`rankedpoll.com/poll/${id}`} disabled />
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
        {pollResultData ? <Results options={options} data={pollResultData} /> : null}
      </Card>
    </Main>
  );
};

export default Poll;
