import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useReactiveVar } from '@apollo/client';
import { themeColorVar } from './layout';
import Colors from '../style/colors';
import { Card } from '../style/card';

const A = styled.a`
  font-family: Open Sans, sans-serif;
  text-decoration: none;
  color: blue;
  
  :hover {
    text-decoration: underline;
  }
`;

const Contact = styled.div`
  font-family: Open Sans, sans-serif;
`;

const Nav = styled(Card)`
  padding: 12px;
  place-self: start end;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CardNav = styled.div`
  display: none;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const NavA = styled.a`
  color: black;
  font-family: Open Sans, sans-serif;
  text-decoration: none;
  line-height: 1.4;
  ${(props) => (props.bold ? 'font-weight: 600;' : '')}
  
  :hover {
    text-decoration: underline;
  }
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default function AboutLayout({ children, pages }) {
  const themeColor = useReactiveVar(themeColorVar);
  useEffect(() => {
    if (
      themeColor[0] === 0
      && themeColor[1] === 110
      && themeColor[2] === 110
    ) {
      themeColorVar(Colors[Object.keys(Colors)[0]]);
    }
  }, [themeColor]);

  const router = useRouter();

  return (
    <>
      <Card area="center">
        <CardNav>
          {pages.map((title) => (
            <Link href={title === 'Intro' ? '/about' : `/about/${title}`} key={title} passHref>
              <NavA
                bold={
                  router.query.title === title
                  || (!router.pathname.split('/')[2] && title === 'Intro')
                  || router.pathname.split('/')[2] === title
                }
              >
                {title}
              </NavA>
            </Link>
          )).reduce((prev, curr) => [prev, ' | ', curr])}
        </CardNav>
        {children}
        <Bottom>
          <Link href="/" passHref><A>&lt; Return to Home</A></Link>
          <Contact>contact@rankedpoll.com</Contact>
        </Bottom>
      </Card>
      <Nav area="center-left">
        {pages.map((title) => (
          <Link href={title === 'Intro' ? '/about' : `/about/${title}`} key={title} passHref>
            <NavA
              bold={
                router.query.title === title
                || (!router.pathname.split('/')[2] && title === 'Intro')
                || router.pathname.split('/')[2] === title
              }
            >
              {title}
            </NavA>
          </Link>
        ))}
      </Nav>
    </>
  );
}
