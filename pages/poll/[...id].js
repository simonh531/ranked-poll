import React, {
  useState, useEffect, Fragment, useRef, useMemo,
} from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  gql, useMutation, useLazyQuery,
} from '@apollo/client';
import styled from 'styled-components';

import PollOption from '../../components/pollOption';
import { themeColorVar } from '../../components/layout';
import { Card, Description, SubmitButton } from '../../style/card';
import Pool from '../../postgresPool';
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
                <td>
                  {datum.vote.join(' > ')}
                  {datum.lowVote.length ? ` >>> ${datum.lowVote.join(' > ')}` : ''}
                </td>
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
  margin-bottom: 4px;
`;

const Question = styled.h1`
  margin: 0;
  font-family: Merriweather, serif;
  padding: 4px 0;
  flex: 1;
`;

const Ranking = styled.div`
  border-bottom: 1px solid black;
`;

const LowRanking = styled.div`
  border-top: 1px solid black;
`;

const CardBottom = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 16px;
  align-items: center;
`;

const Spacer = styled.div`
  flex: 1;
`;

const TotalVotes = styled.div`
  margin-left: 1ch;
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
  padding: 0 6px;
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
  padding: 8px 4px;
  border-radius: 0 4px 4px 0;
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

const DateText = styled.div`
  font-size: 0.8em;
  opacity: 0.9;
  font-family: Open Sans, sans-serif;
  margin-bottom: 4px;
`;

const POLL = gql`
  query poll($id: ID!) {
    poll(id: $id) {
      id
      description
      count
      cookieCount
      ipCount
      protection
      createdAt
    }
  }
`;

const POLL_RESULT = gql`
  query pollResult($id: ID!, $protection: Protection!) {
    pollResult(id: $id, protection: $protection) {
      vote
      lowVote
      count
    }
    poll(id: $id) {
      id
      count
      cookieCount
      ipCount
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

const Poll = ({
  id, title, options, randomize, color, redirect,
}) => {
  const copy = useRef(null);
  const router = useRouter();
  const [rank, setRank] = useState([]);
  const [lowRank, setLowRank] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [sortResults, setSortResults] = useState(true);
  const [
    getPollData,
    { /* loading: pollLoading, */ data: pollData },
  ] = useLazyQuery(POLL, {
    variables: { id },
    fetchPolicy: 'cache-and-network',
  });

  const {
    description, count, cookieCount, ipCount, userCount, protection, createdAt,
  } = pollData?.poll || {};

  useEffect(() => {
    if (id) {
      getPollData();
    }
  }, [id]);

  let actualCount;

  if (protection === 'none') {
    actualCount = count;
  } else if (protection === 'cookie_id') {
    actualCount = cookieCount;
  } else if (protection === 'ip') {
    actualCount = ipCount;
  } else if (protection === 'user_id') {
    actualCount = userCount;
  }

  const [vote, { data: voteData }] = useMutation(VOTE, {
    update: (cache) => {
      cache.modify({
        id: cache.identify(pollData.poll),
        fields: {
          count: (countValue) => countValue + 1,
        },
      });
    },
    variables: {
      input: {
        user: null,
        pollId: id,
        vote: rank,
        lowVote: lowRank,
      },
    },
  });
  // console.log(voteData);

  const [
    getPollResult,
    { /* loading: pollResultLoading, */ data: pollResultData },
  ] = useLazyQuery(POLL_RESULT, {
    variables: { id, protection },
    fetchPolicy: 'cache-and-network',
  });
  // console.log(pollResultData);

  const toggleSortResults = () => {
    setSortResults(!sortResults);
  };

  useEffect(() => {
    if (voteData?.vote) {
      setSubmitted(true);
    }
  }, [voteData?.vote]);

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

  useEffect(() => {
    if (title) {
      router.replace(`/poll/${id}/${
        title.replace(/[^\w\d\s]/g, '').replace(/\s/g, '_')
      }`);
    }
  }, [title]);

  useEffect(() => {
    if (redirect) {
      router.replace('/');
    }
  }, [redirect]);

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

  const { rankings, rankedPairs, ratioPercents } = useMemo(
    () => calc(pollResultData?.pollResult, orderedOptions),
    [pollResultData?.pollResult, orderedOptions],
  );

  let submit = null;
  if (submitted) {
    submit = <VoteSubmitted>Vote Submitted</VoteSubmitted>;
  } else if (!pollResultData) {
    submit = (
      <SubmitButton
        type="button"
        disabled={!rank.length && !lowRank.length}
        onClick={vote}
      >
        Vote
      </SubmitButton>
    );
  }

  return (
    <Main>
      <Head>
        <title>
          {title && `${title} | `}
          Ranked Poll
        </title>
        <meta name="description" key="description" content={`${title} | ${options && options.join('| ')}`} />
        <meta property="og:url" content={`rankedpoll.com/${id}`} key="ogurl" />
        <meta property="og:title" content={title} key="ogtitle" />
        <meta property="og:description" content={options && options.join('| ')} key="ogdesc" />
        <link rel="canonical" href={`https://rankedpoll.com/${id}`} key="canonical" />
      </Head>
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
        <DateText>
          {createdAt && new Date(parseInt(createdAt, 10)).toLocaleString(undefined, {
            dateStyle: 'medium', timeStyle: 'short',
          })}
        </DateText>
        {description ? (
          <Description>
            {description}
          </Description>
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
        ) : (
          <>
            {rank.length ? (
              <Ranking>
                {rank.map((option, index) => {
                  const onCancel = () => {
                    const newRank = [...rank];
                    newRank.splice(rank.indexOf(option), 1);
                    setRank(newRank);
                  };
                  const upClick = index !== 0 ? () => {
                    const newRank = [...rank];
                    newRank.splice(rank.indexOf(option), 1);
                    newRank.splice(index - 1, 0, option);
                    setRank(newRank);
                  } : null;
                  const downClick = index !== rank.length - 1 ? () => {
                    const newRank = [...rank];
                    newRank.splice(rank.indexOf(option), 1);
                    newRank.splice(index + 1, 0, option);
                    setRank(newRank);
                  } : null;
                  return (
                    <PollOption
                      key={option}
                      name={option}
                      rank={index + 1}
                      onCancel={onCancel}
                      upClick={upClick}
                      downClick={downClick}
                      disabled={submitted}
                    />
                  );
                })}
              </Ranking>
            ) : null}
            {orderedOptions && (
            <div>
              {orderedOptions.filter(
                (option) => !rank.includes(option) && !lowRank.includes(option),
              ).map((option) => {
                const upClick = () => {
                  setRank([...rank, option]);
                };
                const downClick = () => {
                  setLowRank([option, ...lowRank]);
                };
                return (
                  <PollOption
                    key={option}
                    name={option}
                    upClick={upClick}
                    downClick={downClick}
                    disabled={submitted}
                  />
                );
              })}
            </div>
            )}

            {lowRank.length ? (
              <LowRanking>
                {lowRank.map((option, index) => {
                  const onCancel = () => {
                    const newRank = [...lowRank];
                    newRank.splice(lowRank.indexOf(option), 1);
                    setLowRank(newRank);
                  };
                  const upClick = index !== 0 ? () => {
                    const newRank = [...lowRank];
                    newRank.splice(lowRank.indexOf(option), 1);
                    newRank.splice(index - 1, 0, option);
                    setLowRank(newRank);
                  } : null;
                  const downClick = index !== lowRank.length - 1 ? () => {
                    const newRank = [...lowRank];
                    newRank.splice(lowRank.indexOf(option), 1);
                    newRank.splice(index + 1, 0, option);
                    setLowRank(newRank);
                  } : null;
                  return (
                    <PollOption
                      key={option}
                      name={option}
                      rank={orderedOptions.length - lowRank.length + index + 1}
                      lastOne={index === rank.length - 1}
                      onCancel={onCancel}
                      upClick={upClick}
                      downClick={downClick}
                      disabled={submitted}
                    />
                  );
                })}
              </LowRanking>
            ) : null}
          </>
        )}
        <CardBottom>
          {submit}
          <TotalVotes>
            {(actualCount || 0) + (actualCount === 1 ? ' vote' : ' votes')}
          </TotalVotes>
          <Spacer />
          {pollData && (
            <SeeResultsButton
              onClick={getPollResult}
            >
              {pollResultData
                ? <span className="material-icons">sync</span>
                : 'See Results'}
            </SeeResultsButton>
          )}
          <CopyContainer>
            <CopyButton onClick={copyDiv}><span className="material-icons">content_copy</span></CopyButton>
            <CopyText ref={copy}>{`rnkd.pl/${id || ''}`}</CopyText>
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

export const getStaticPaths = async () => ({
  paths: [],
  fallback: true,
});

export const getStaticProps = async ({ params }) => {
  const text = 'SELECT title, options, randomize, color FROM poll WHERE id = $1';
  const values = [params.id[0]];
  try {
    const res = await Pool.query(text, values);
    if (res.rows.length) {
      const {
        title, options, randomize, color,
      } = res.rows[0];

      return {
        props: {
          id: params.id[0], title, options, randomize, color,
        },
      };
    }

    return {
      props: {
        redirect: true,
      },
    };
  } catch (err) {
    return null;
  }
};

export default Poll;
