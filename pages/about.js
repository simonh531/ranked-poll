/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import styled from 'styled-components';

import { themeColorVar } from '../components/layout';
import PollOption from '../components/pollOption';
import { fromPairsCalc } from '../rankedPairsCalc';

import { Card } from '../style/card';
import Colors from '../style/colors';

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  font-family: Righteous, cursive;
  font-size: 3em;
  text-align: center;
  color: black;
`;

const P = styled.p`
  font-family: Open Sans, sans-serif;
  line-height: 1.4;
  font-size: 1.2em;
  text-align: justify;
`;

const ReturnHome = styled.a`
  font-family: Open Sans, sans-serif;
  text-decoration: none;
  color: blue;
  cursor: pointer;
  
  :hover {
    text-decoration: underline;
  }
`;

const Contact = styled.div`
  font-family: Open Sans, sans-serif;
`;

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const TabObject = styled.a`
  font-family: Open Sans, sans-serif;
  padding: 4px 0.5ch 0;
  border: 1px solid ${(props) => (props.active ? 'black' : 'transparent')};
  border-bottom: 0;
  border-radius: 4px 4px 0 0 ;
  cursor: pointer;

  :hover {
    text-decoration: underline;
  }
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Intro = () => (
  <>
    <P>
      Hello and welcome to Ranked Poll! On this website you&apos;ll be able to create polls that offer ranked voting. The results are calculated using the ranked pairs method.
    </P>
    <P>
      Now you might be wondering how ranked voting differs from simpler voting methods (such as plurality, or First-Past-the-Post): Ranked voting tells you more about nuances that are often hidden when looking at the results, allowing you to make better conclusions about your data.
    </P>
    <P>
      For example, you might be curious about how much people like certain flavors of ice cream - so you put out a questionnaire: &quot;Which of these is your favorite flavor of ice cream: Chocolate, Vanilla, or Strawberry?&quot; Your average plurality-style poll might tell you that the favorite is strawberry followed by chocolate and vanilla. However, a vote that asks a respondent to answer in what order do they prefer each of these flavors can reveal a different story. It could show that the majority of respondents ranked vanilla second and is a good middle ground that everyone would be happy with.
    </P>
    <P>
      With an even larger set of data, ranked voting can help identify these trends that are invisible to other voting methods. So what are you waiting for? Give it a try!
    </P>
  </>
);

const A = styled.a`
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }
`;

const Method = () => (
  <>
    <P>
      First of all, Ranked Poll uses a
      {' '}
      <A href="https://en.wikipedia.org/wiki/Ranked_voting">ranked voting system</A>
      {' '}
      where you submit a ranked list of your preferences as opposed to a
      {' '}
      <A href="https://en.wikipedia.org/wiki/Plurality_voting">plurality system</A>
      {' '}
      where you only submit your favorite option. That said, the system here still allows you to submit only your favorite option, leaving 2nd place and below unranked. If everyone votes this way in a poll, it will function no differently than a plurality vote. The advantage of being able to submit preferences for everything below 1st place is that it’s additional data about how people feel about the poll options which leads to a more informed choice for picking a victor.
    </P>
    <P>
      There are many ways to calculate a victor with ranked voting and one of the more popular methods is instant-runoff voting and is in fact currently used in some elections around the world. However, we would rather use a
      {' '}
      <A href="https://en.wikipedia.org/wiki/Condorcet_method">Condorcet method</A>
      {' '}
      because it is more
      {' '}
      <A href="https://www.princeton.edu/~cuff/voting/theory.html">robust to candidates and voters</A>
      .
    </P>
    <P>
      The Condorcet method chooses a victor by finding the option that wins a head-to-head vote against every other option. These pair competitions can be found in the advanced section on the results page. However, sometimes there is no Condorcet winner in the poll as a result of there being a cycle of victors similar to how rock paper scissors works.
    </P>
    <P>
      There are
      {' '}
      <A href="https://en.wikipedia.org/wiki/Comparison_of_electoral_systems#Compliance_of_selected_single-winner_methods">many different Condorcet methods</A>
      {' '}
      but here we use the
      {' '}
      <A href="https://en.wikipedia.org/wiki/Ranked_pairs">ranked pairs</A>
      {' '}
      method to determine how to break these cycles. This method determines the victor by creating a victory graph and dropping the option with the smallest victory in the cycle. Compared to other Condorcet methods, it possesses the most desired criteria in an electoral system but is more complicated to calculate.
    </P>
  </>
);

const Tables = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const PairTable = styled.table`
  font-family: Open Sans, sans-serif;
  margin-right: 8px;
`;

const PairInput = styled.input`
  width: 6ch;
`;

const Calculation = () => {
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

  return (
    <>
      <P>
        The winner of each poll should be visible at a glance and bar graphs are one of the best ways to convey that data. Unfortunately, converting ranked voting data into graph data is unintuitive because votes don’t sum to the same number across the board when people may leave choices unranked and the option with a majority of first places may not be the victor.
      </P>
      <P>
        Fortunately, the ranked pairs method we use determines an exact ranking for all options and is one of the few ranked voting methods where removing an option leaves the ranking of all other options unchanged. What we can then do is calculate the ratio of votes from 1st to 2nd pace and 2nd to 3rd place and so on. These ratios are all summed up and calculated as a victory percentage, which is what is displayed on the results. It should be noted that if this same method were applied to a plurality vote, the percentages would be identical to the percentage of votes received.
      </P>

      <PollOption
        name="A"
        rank={aIndex + 1 || '0'}
        percent={`${(ratioPercents[aIndex] || 0).toFixed(2)}%`}
        disabled
      />
      <PollOption
        name="B"
        rank={bIndex + 1 || '0'}
        percent={`${(ratioPercents[bIndex] || 0).toFixed(2)}%`}
        disabled
      />
      <PollOption
        name="C"
        rank={cIndex + 1 || '0'}
        percent={`${(ratioPercents[cIndex] || 0).toFixed(2)}%`}
        disabled
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
    </>
  );
};

const Protection = () => (
  <>
    <P>
      To prevent people from voting twice on a poll, we have implemented a few methods:
    </P>
    <P>
      Browser cookie: a cookie is placed in the browser and will prevent subsequent vote entries from the same browser.
    </P>
    <P>
      IP address: the IP address of the vote is recorded. Computers on the same network will have the same IP and will not all be able to vote.
    </P>
    <P>
      None: vote as much as you want!
    </P>
    <P>
      Each vote from the same source will overwrite the previous vote from that source, so if you change your mind, you can vote again to change your vote.
    </P>
  </>
);

const Tab = ({ active, link, children }) => {
  const router = useRouter();

  return (
    <TabObject active={active} onClick={(e) => { e.preventDefault(); router.replace(`/about${link}`); }}>
      {children}
    </TabObject>
  );
};

const About = () => {
  const router = useRouter();
  const hash = router.asPath.toLowerCase().substr(7);
  const [active, setActive] = useState('');
  const [content, setContent] = useState(<Intro />);

  useEffect(() => {
    if (hash === 'method') {
      setActive('method');
      setContent(<Method />);
    } else if (hash === 'calculation') {
      setActive('calculation');
      setContent(<Calculation />);
    } else if (hash === 'protection') {
      setActive('protection');
      setContent(<Protection />);
    } else {
      setActive('');
      setActive(<Intro />);
    }
  }, [hash]);

  const themeColor = useReactiveVar(themeColorVar);

  useEffect(() => {
    if (
      themeColor[0] === 255
      && themeColor[1] === 255
      && themeColor[2] === 255
    ) {
      themeColorVar(Colors[Object.keys(Colors)[0]]);
    }
  }, [themeColor]);

  return (
    <Main>
      <Card>
        <Title>Ranked Poll</Title>
        <Tabs>
          <Tab active={!active} link="">Intro</Tab>
          <Tab active={active === 'method'} link="#method">Method</Tab>
          <Tab active={active === 'calculation'} link="#calculation">Calculation</Tab>
          <Tab active={active === 'protection'} link="#protection">Double Voting</Tab>
        </Tabs>
        {content}
        <Bottom>
          <Link href="/" passHref><ReturnHome>&lt; Return to Home</ReturnHome></Link>
          <Contact>contact@rankedpoll.com</Contact>
        </Bottom>
      </Card>
    </Main>
  );
};

export default About;
