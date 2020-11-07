/* eslint-disable max-len */
import React, { useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { createClient } from 'contentful';

import AboutLayout from '../../components/aboutLayout';
import PollOption from '../../components/pollOption';
import { fromPairsCalc } from '../../rankedPairsCalc';

const Title = styled.h1`
  margin: 0;
  font-family: Merriweather, serif;
  font-size: 2em;
  color: black;
`;

const Tables = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
`;

const PairTable = styled.table`
  border: 1px solid black;
  font-family: Open Sans, sans-serif;
  margin-right: 10px;
`;

const PairInput = styled.input`
  width: 6ch;
`;

const P = styled.p`
  font-family: Open Sans, sans-serif;
  line-height: 1.4;
  font-size: 1.2em;
  text-align: justify;
`;

const Calculation = ({ pages }) => {
  const [aPairAB, setAPairAB] = useState(0);
  const [bPairAB, setBPairAB] = useState(0);
  const [bPairBC, setBPairBC] = useState(0);
  const [cPairBC, setCPairBC] = useState(0);
  const [cPairCA, setCPairCA] = useState(0);
  const [aPairCA, setAPairCA] = useState(0);

  const { rankings, ratioPercents } = fromPairsCalc({
    'a/b': {
      a: aPairAB,
      b: bPairAB,
    },
    'b/c': {
      b: bPairBC,
      c: cPairBC,
    },
    'a/c': {
      a: aPairCA,
      c: cPairCA,
    },
  }, ['a', 'b', 'c']);

  const aIndex = rankings.findIndex((array) => array.includes('a'));
  const bIndex = rankings.findIndex((array) => array.includes('b'));
  const cIndex = rankings.findIndex((array) => array.includes('c'));
  const description = 'The winner of each poll should be visible at a glance and bar graphs are one of the best ways to convey that data. Unfortunately, converting ranked voting data into graph data is unintuitive because votes don’t sum to the same number across the board when people may leave choices unranked and the option with a majority of first places may not be the victor.';
  return (
    <AboutLayout pages={pages}>
      <Head>
        <title>Calculation | Ranked Poll About</title>
        <meta name="description" key="description" content={description} />
        <meta property="og:url" content="rankedpoll.com/about/Calculation" key="ogurl" />
        <meta property="og:title" content="Calculation" key="ogtitle" />
        <meta property="og:description" content={description} key="ogdesc" />
        <link rel="canonical" href="https://rankedpoll.com/about/Calculation" key="canonical" />
      </Head>
      <Title>Calculation</Title>
      <P>
        {description}
      </P>
      <P>
        Fortunately, the ranked pairs method we use determines an exact ranking for all options and is one of the few ranked voting methods where removing an option leaves the ranking of all other options unchanged. What we can then do is calculate the ratio of votes from 1st to 2nd pace and 2nd to 3rd place and so on. These ratios are all summed up and calculated as a victory percentage, which is what is displayed on the results. It should be noted that if this same method were applied to a plurality vote, the percentages would be identical to the percentage of votes received.
      </P>

      <PollOption
        name="A"
        rank={aIndex + 1 || '0'}
        percent={`${(ratioPercents[aIndex] || 0).toFixed(2)}%`}
      />
      <PollOption
        name="B"
        rank={bIndex + 1 || '0'}
        percent={`${(ratioPercents[bIndex] || 0).toFixed(2)}%`}
      />
      <PollOption
        name="C"
        rank={cIndex + 1 || '0'}
        percent={`${(ratioPercents[cIndex] || 0).toFixed(2)}%`}
      />
      <Tables>
        <PairTable>
          <tbody>
            <tr>
              <td><PairInput type="number" min="0" value={aPairAB} onChange={(e) => setAPairAB(e.target.value)} /></td>
              <td>A</td>
            </tr>
            <tr>
              <td><PairInput type="number" min="0" value={bPairAB} onChange={(e) => setBPairAB(e.target.value)} /></td>
              <td>B</td>
            </tr>
          </tbody>
        </PairTable>
        <PairTable>
          <tbody>
            <tr>
              <td><PairInput type="number" min="0" value={bPairBC} onChange={(e) => setBPairBC(e.target.value)} /></td>
              <td>B</td>
            </tr>
            <tr>
              <td><PairInput type="number" min="0" value={cPairBC} onChange={(e) => setCPairBC(e.target.value)} /></td>
              <td>C</td>
            </tr>
          </tbody>
        </PairTable>
        <PairTable>
          <tbody>
            <tr>
              <td><PairInput type="number" min="0" value={cPairCA} onChange={(e) => setCPairCA(e.target.value)} /></td>
              <td>C</td>
            </tr>
            <tr>
              <td><PairInput type="number" min="0" value={aPairCA} onChange={(e) => setAPairCA(e.target.value)} /></td>
              <td>A</td>
            </tr>
          </tbody>
        </PairTable>
      </Tables>

      <P>
        The example above shows percentages based on the pair matchups. If we return to the example where all votes only have a 1st place ranking like in plurality votes, and there are 3 votes for A, 2 votes for B, and 1 vote for C, the matchup pairings would be 3-2 for AB, 2-1 for BC, and 1-3 for CA. Try putting that in. The method outlined above correctly calculates the percentage for a plurality vote. A has 3 of 6 votes so has 50%. B has 2 of 6 votes so has 33.33%. And C has 1/6 votes so has 16.66%. With ranked votes, the numbers for these pairings will not be as clean and the percentages will change to reflect that. Feel free to experiment!
      </P>
    </AboutLayout>
  );
};

export const getStaticProps = async () => {
  if (
    !process.env.CONTENTFUL_SPACE
    || !process.env.CONTENTFUL_ACCESS_TOKEN
    || !process.env.CONTENTFUL_HOST
  ) {
    return {
      props: {
        pages: ['Calculation'],
      },
    };
  }

  const client = createClient({
    space: process.env.CONTENTFUL_SPACE,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    host: process.env.CONTENTFUL_HOST,
  });

  const entries = await client.getEntries({
    content_type: 'page',
    select: 'fields.title,fields.priority',
  });

  const pages = entries.items.sort(
    (entry1, entry2) => entry1.fields.priority - entry2.fields.priority,
  ).map(({ fields }) => fields.title);

  return {
    props: {
      pages: [...pages, 'Calculation'],
    },
  };
};

export default Calculation;
