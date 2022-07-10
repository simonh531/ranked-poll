import React, { ReactNode } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { deepmerge } from '@mui/utils';
import {
  AppBar, Box, Button, Container, CssBaseline,
  Toolbar, Typography, styled,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { makeVar, useReactiveVar } from '@apollo/client';

export const themeColorVar = makeVar('#bbb');

const defaultTheme = {
  typography: {
    fontFamily: "'Open Sans', sans-serif",
    h1: {
      fontFamily: 'Merriweather, serif',
    },
    h4: {
      fontFamily: 'Merriweather, serif',
    },
  },
  palette: {
    info: {
      main: grey[50],
    },
    background: {
      paper: '#f4f4f4',
    },
    //   text: {
    //     primary: 'rgba(255,255,255,0.87)',
    //     secondary: 'rgba(255,255,255,0.6)',
    //   },
    // primary: {
    // main: 'rgb(255,255,255)',
    // },
  },
};

const NavButton = styled(Button)<{component: string}>(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
}));

const FooterButton = styled(Button)<{component: string}>({
  fontSize: '1.2em',
  color: 'rgba(255,255,255,0.87)',
  textTransform: 'none',
});

function Layout({ children }:{children: ReactNode}) {
  const color = useReactiveVar(themeColorVar);
  const theme = createTheme(deepmerge(defaultTheme, { palette: { primary: { main: color } } }));
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Ranked Poll | Share Ranked Vote Polls</title>
      </Head>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: 'primary.main',
        display: 'flex',
        flexDirection: 'column',
      }}
      >
        <AppBar sx={{ backgroundColor: 'background.paper' }} position="sticky">
          <Container>
            <Toolbar>
              <Link href="/" passHref>
                <NavButton
                  component="a"
                  sx={{
                    fontFamily: 'Righteous',
                    fontSize: '1.8em',
                  }}
                >
                  Ranked Poll
                </NavButton>
              </Link>
              <Link href="/history" passHref>
                <NavButton
                  component="a"
                  sx={{ fontSize: '1.4em' }}
                >
                  History
                </NavButton>
              </Link>
              <Link href="/about" passHref>
                <NavButton
                  component="a"
                  sx={{ fontSize: '1.4em' }}
                >
                  About
                </NavButton>
              </Link>
            </Toolbar>
          </Container>
        </AppBar>
        <Box sx={{
          flex: '1', display: 'flex', paddingTop: 2, paddingBottom: 2,
        }}
        >
          {children}
        </Box>
        <Box sx={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <Container sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flex: '1' }}>
              <Link href="/" passHref>
                <FooterButton component="a">
                  Home
                </FooterButton>
              </Link>
              <Link href="/about" passHref>
                <FooterButton component="a">
                  About
                </FooterButton>
              </Link>
            </Box>
            <Typography sx={{
              fontSize: '1.2em',
              color: 'rgba(255,255,255,0.87)',
            }}
            >
              &copy;
              {` ${new Date(Date.now()).getFullYear()} `}
              Ranked Poll
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Layout;
