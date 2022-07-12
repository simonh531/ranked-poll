import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { deepmerge } from '@mui/utils';
import {
  AppBar, Box, Button, Container, CssBaseline,
  Toolbar, Typography, styled, Stack, Drawer,
  List, ListItem, ListItemButton, ListItemText,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { makeVar, useReactiveVar } from '@apollo/client';

export const themeColorVar = makeVar('#bbb');
export const historyVar = makeVar([]);

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
  },
};

const NavButton = styled(Button)<{component?: string}>(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  fontSize: '1em',
}));

const FooterButton = styled(Button)<{component: string}>({
  color: 'rgba(255,255,255,0.87)',
  textTransform: 'none',
  fontSize: '1em',
});

function Layout({ children }:{children: ReactNode}) {
  const color = useReactiveVar(themeColorVar);
  const theme = createTheme(deepmerge(defaultTheme, { palette: { primary: { main: color } } }));
  const [showDrawer, setShowDrawer] = useState(false);
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown'
        && ((event as React.KeyboardEvent).key === 'Tab'
          || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setShowDrawer(open);
  };

  const history = useReactiveVar(historyVar);
  useEffect(() => {
    const item = window.localStorage.getItem('history');
    if (item) {
      historyVar(JSON.parse(item));
    }
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Ranked Poll | Share Ranked Vote Polls</title>
      </Head>
      <CssBaseline />
      <Drawer anchor="left" open={showDrawer} onClose={toggleDrawer(false)} sx={{ maxWidth: '90%' }}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ padding: 2 }}>Poll History</Typography>
          <List>
            {history.map((item) => (
              <ListItem key={item.id} disablePadding>
                <Link href={`/poll/${item.id}`} passHref>
                  <ListItemButton component="a" onClick={toggleDrawer(false)}>
                    <ListItemText>
                      {item.title}
                    </ListItemText>
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </List>
        </Stack>
      </Drawer>
      <Box sx={{
        minHeight: '100vh',
        backgroundColor: 'primary.main',
        display: 'flex',
        flexDirection: 'column',
      }}
      >
        <AppBar sx={{ backgroundColor: 'background.paper' }} position="sticky">
          <Container disableGutters>
            <Toolbar disableGutters sx={{ fontSize: { xs: '1.25em', sm: '1.8em' } }}>
              <Link href="/" passHref>
                <NavButton
                  component="a"
                  sx={{ fontFamily: 'Righteous' }}
                >
                  Ranked Poll
                </NavButton>
              </Link>
              <NavButton onClick={toggleDrawer(true)}>
                History
              </NavButton>
              <Link href="/about" passHref>
                <NavButton component="a">
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
          <Container sx={{ fontSize: { xs: '0.9em', sm: '1em' } }} disableGutters>
            <Stack spacing={1} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-evenly' }}>
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
              <Typography sx={{ color: 'rgba(255,255,255,0.87)', fontSize: '1em' }}>
                &copy;
                {` ${new Date(Date.now()).getFullYear()} `}
                Ranked Poll
              </Typography>
            </Stack>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Layout;
