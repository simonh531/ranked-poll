import React, { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/router';
import {
  gql, useMutation, useLazyQuery,
} from '@apollo/client';
import styled from 'styled-components';

import PollOption from '../../components/pollOption';

import { Card, Description, SubmitButton } from '../../style/card';

import calc from '../../rankedPairsCalc';

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
  flex-wrap: wrap;
  margin-top: 8px;
  align-items: center;
`;

const Spacer = styled.div`
  flex: 1;
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
`;

const CopyText = styled.div`
  border: 1px solid grey;
  padding: 4px;
  font-family: Open Sans, sans-serif;
`;

const SeeResultsButton = styled.div`
  margin-right: 4px;
  border: 0;
  font-family: Open Sans, sans-serif;
  cursor: pointer;

  :hover {
    text-decoration: underline;
  }
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

  const { rankings, rankedPairs, ratioPercents } = calc(pollResultData?.pollResult, options);

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
            {count + (count === 1 ? ' vote' : ' votes')}
          </TotalVotes>
          <Spacer />
          <SeeResultsButton
            type="button"
            onClick={getPollResult}
          >
            {pollResultData
              ? <span className="material-icons">sync</span>
              : 'See Results'}
          </SeeResultsButton>
          <CopyContainer>
            <CopyButton><span className="material-icons">content_copy</span></CopyButton>
            <CopyText>{`rnkd.pl/${id}`}</CopyText>
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
