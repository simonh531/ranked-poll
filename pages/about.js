/* eslint-disable max-len */
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import styled from 'styled-components';

import { themeColorVar } from '../components/layout';

import { Card } from '../style/card';
import Colors from '../style/colors';

const Main = styled.main`
  flex: 1;
  background-color: rgb(${() => useReactiveVar(themeColorVar).join(',')});
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AboutCard = styled(Card)`
  font-family: Open Sans, sans-serif;
  line-height: 1.4;
  font-size: 1.2em;
`;

const ReturnHome = styled.a`
  text-decoration: none;
  color: blue;
  cursor: pointer;
  
  :hover {
    text-decoration: underline;
  }
`;

const About = () => {
  const themeColor = useReactiveVar(themeColorVar);

  useEffect(() => {
    if (
      themeColor[0] === 255
      && themeColor[1] === 255
      && themeColor[2] === 255
    ) {
      themeColorVar(Colors['Sky Blue']);
    }
  }, [themeColor]);

  return (
    <Main>
      <AboutCard>
        <p>
          Hello and welcome to Ranked Poll! On this website you&apos;ll be able to create polls that offer ranked choice voting. The results are calculated using the ranked pairs method.
        </p>
        <p>
          Now you might be wondering how ranked voting differs from simpler voting methods (such as plurality, or First-Past-the-Post): Ranked choice tells you more about nuances that are often hidden when looking at the results, allowing you to make better conclusions about your data.
        </p>
        <p>
          For example, you might be curious about how much people like certain flavors of ice cream - so you put out a questionnaire: &quot;Which of these is your favorite flavor of ice cream: Chocolate, Vanilla, Mint or Strawberry?&quot; Your average plurality-style poll might tell you that chocolate wins by a landslide compared to mint and strawberry, but vanilla follows closely behind. So you might conclude that chocolate and vanilla are just more popular than mint and strawberry. However, a vote that asks a respondent to answer in what order do they prefer each of these flavors can tell a different story even if the results are the same: It could be that the majority of respondents ranked chocolate first with ranked vanilla second, and a minority responded with mint first and strawberry second; showing that tastes in ice cream flavors largely fell into two camps based on which pair of flavors a person ranked for their top two.
        </p>
        <p>
          With an even larger pool of options, ranked choice can help identify these trends that are invisible to other voting methods. So what are you waiting for? Give it a try!
        </p>
        <Link href="/" passHref><ReturnHome>&lt; Return to Home</ReturnHome></Link>
      </AboutCard>
    </Main>
  );
};

export default About;
