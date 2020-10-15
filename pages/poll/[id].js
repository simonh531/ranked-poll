import React, {
  useState, useEffect, Fragment, useRef, useMemo,
} from 'react';
import { useRouter } from 'next/router';
import {
  gql, useMutation, useLazyQuery,
} from '@apollo/client';
import styled from 'styled-components';

import PollOption from '../../components/pollOption';
import { themeColorVar } from '../../components/layout';
import { Card, Description, SubmitButton } from '../../style/card';
import calc from '../../rankedPairsCalc';

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
            const order = Object.entries(pairData).sort(
              // eslint-disable-next-line no-unused-vars
              ([_, score1], [__, score2]) => score2 - score1,
            );
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Fragment key={index}>
                <tbody>
                  <tr>
                    <PairBox winner={order[0][1] > order[1][1]}>{order[0][1]}</PairBox>
                    <PairBox winner={order[0][1] > order[1][1]}>{order[0][0]}</PairBox>
                  </tr>
                  <tr>
                    <PairBox>{order[1][1]}</PairBox>
                    <PairBox>{order[1][0]}</PairBox>
                  </tr>
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

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  display: flex;
  border-bottom: 1px solid black;
  margin: 8px 0;
`;

const Question = styled.h1`
  margin: 0;
  font-family: Merriweather, serif;
  padding: 4px;
  flex: 1;
`;

const Ranking = styled.div`
  border-bottom: 1px solid black;
`;

const CardBottom = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  align-items: center;
`;

const Spacer = styled.div`
  flex: 1;
`;

const TotalVotes = styled.div`
  font-family: Open Sans, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VoteSubmitted = styled.div`
  margin-right: 1ch;
  font-family: Open Sans, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CopyContainer = styled.div`
  display: flex;
`;

const CopyButton = styled.button`
  padding: 0 4px;
  margin: 0;
  border: 1px solid grey;
  border-right: 0;
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #dddddd;
  cursor: pointer;

  :hover {
    box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
  }

  :active {
    filter: brightness(80%);
  }
`;

const CopyText = styled.div`
  border: 1px solid grey;
  padding: 4px;
  font-family: Open Sans, sans-serif;
`;

const SeeResultsButton = styled.button`
  margin-right: 4px;
  border: 0;
  font-family: Open Sans, sans-serif;
  background-color: transparent;
  cursor: pointer;

  :hover {
    text-decoration: underline;
  }
`;

const OrderButton = styled.button`
  border: 0;
  padding: 0;
  background-color: transparent;
  cursor: pointer;
`;

const OrderIcon = styled.span`
  font-size: 2em;
  border-radius: 4px;
  border: 1px solid ${(props) => (props.active ? 'black' : 'transparent')};
`;

const POLL = gql`
  query poll($id: ID!) {
    poll(id: $id) {
      id
      title
      description
      options
      color
      randomize
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
    poll(id: $id) {
      id
      count
    }
  }
`;

const VOTE = gql`
  mutation vote($input: VoteInput!) {
    vote(input: $input)
  }
`;

function randomizeArray(array) {
  if (!array.length) {
    return [];
  }
  const arrayCopy = [...array];
  let targetIndex = array.length - 1;
  let temp;
  let randomIndex;

  while (targetIndex) {
    randomIndex = Math.floor(Math.random() * (targetIndex + 1));

    temp = arrayCopy[randomIndex];
    arrayCopy[randomIndex] = arrayCopy[targetIndex];
    arrayCopy[targetIndex] = temp;

    targetIndex -= 1;
  }

  return arrayCopy;
}

const Poll = () => {
  const copy = useRef(null);
  const router = useRouter();
  const { id } = router.query;
  const [
    getPollData,
    { /* loading: pollLoading, */ data: pollData },
  ] = useLazyQuery(POLL, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (id) {
      getPollData();
    }
  }, [id]);
  // console.log(pollData);
  const [vote, { data: voteData }] = useMutation(VOTE, {
    update: (cache) => {
      cache.modify({
        id: cache.identify(pollData.poll),
        fields: {
          count: (countValue) => countValue + 1,
        },
      });
    },
  });
  // console.log(voteData);

  const [
    getPollResult,
    { /* loading: pollResultLoading, */ data: pollResultData },
  ] = useLazyQuery(POLL_RESULT, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
    update: (cache) => {
      cache.modify({
        id: cache.identify(pollData.poll),
        fields: {
          count: (countValue) => countValue + 1,
        },
      });
    },
  });
  // console.log(pollResultData);

  const [rank, setRank] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [sortResults, setSortResults] = useState(true);

  const toggleSortResults = () => {
    setSortResults(!sortResults);
  };

  useEffect(() => {
    if (voteData?.vote) {
      setSubmitted(true);
    }
  }, [voteData?.vote]);

  const {
    title, description, options, color, randomize, count,
  } = pollData?.poll || {};

  const orderedOptions = useMemo(() => {
    if (randomize) {
      return randomizeArray(options);
    }
    return options;
  }, [options, randomize]);

  useEffect(() => {
    if (color) {
      themeColorVar(color);
    }
  }, [color]);

  const copyDiv = () => {
    if (copy.current) {
      const range = document.createRange();
      range.selectNode(copy.current);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
    }
  };

  const { rankings, rankedPairs, ratioPercents } = calc(pollResultData?.pollResult, orderedOptions);

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
        Vote
      </SubmitButton>
    );
  }

  return (
    <Main>
      <Card>
        <Title>
          <Question>
            {title}
          </Question>
          {pollResultData && (
            <OrderButton onClick={toggleSortResults}>
              <OrderIcon className="material-icons" active={sortResults}>sort</OrderIcon>
            </OrderButton>
          )}
        </Title>
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
        {orderedOptions && !pollResultData ? (
          <div>
            {orderedOptions.filter((option) => !rank.includes(option)).map((option) => {
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
            {[...orderedOptions].sort((option1, option2) => {
              if (!sortResults) {
                return 0;
              }
              const percent1 = ratioPercents[
                rankings.findIndex((array) => array.includes(option1))
              ] || 0;
              const percent2 = ratioPercents[
                rankings.findIndex((array) => array.includes(option2))
              ] || 0;

              return percent2 - percent1;
            }).map((option) => {
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
            {(count || 0) + (count === 1 ? ' vote' : ' votes')}
          </TotalVotes>
          <Spacer />
          <SeeResultsButton
            onClick={getPollResult}
          >
            {pollResultData
              ? <span className="material-icons">sync</span>
              : 'See Results'}
          </SeeResultsButton>
          <CopyContainer>
            <CopyButton onClick={copyDiv}><span className="material-icons">content_copy</span></CopyButton>
            <CopyText ref={copy}>{`rnkd.pl/${id}`}</CopyText>
          </CopyContainer>
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
