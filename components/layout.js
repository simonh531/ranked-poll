import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import Header from './header';

const Nav = styled.nav`
  height: 40px;
  color: black;
  font-size: 1.6em;
`;

const A = styled.a`
  margin: 0 6px;
  color: black;
  height: 40px;
  line-height: 40px;
  text-decoration: none;
  cursor: pointer;
`;

export default function Layout(props) {
  const { children } = props;
  return (
    <>
      <Header />
      <Nav>
        <Link href="/" passHref><A>Ranked Poll</A></Link>
        <Link href="/about" passHref><A>About</A></Link>
      </Nav>
      <main>{children}</main>
    </>
  );
}
