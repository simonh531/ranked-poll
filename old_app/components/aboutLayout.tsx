import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import {
  Container, Paper, Grid, Typography, SpeedDial, SpeedDialAction, Stack,
} from '@mui/material';
import { themeColorVar } from './layout';
import { mainColor } from '../style/colors';

function AboutLayout({ children, pages }:{ children: ReactNode, pages: string[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const router = useRouter();
  const themeColor = useReactiveVar(themeColorVar);
  useEffect(() => {
    if (themeColor === '#bbb') {
      themeColorVar(mainColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <Grid container spacing={1}>
        <Grid item sm={3} md={2} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Paper sx={{ padding: 1, display: 'flex', flexDirection: 'column' }}>
            {pages.map((title) => (
              <Link href={title === 'Intro' ? '/about' : `/about/${title}`} key={title} passHref>
                <Typography
                  component="a"
                  sx={{
                    textDecoration: 'none',
                    color: 'text.primary',
                    fontWeight: router.query.title === title
                      || (!router.pathname.split('/')[2] && title === 'Intro')
                      || router.pathname.split('/')[2] === title ? 'bold' : '',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {title}
                </Typography>
              </Link>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={9} md={8}>
          <Paper sx={{ padding: 1, paddingTop: 2 }}>
            {children}
            <Stack sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }} direction="row">
              <Link href="/" passHref>
                <Typography
                  component="a"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {'< '}
                  Home
                </Typography>
              </Link>
              <Typography>
                contact@rankedpoll.com
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <SpeedDial
        ariaLabel="Table of contents"
        sx={{
          position: 'fixed', right: 16, bottom: 16, display: { xs: 'flex', sm: 'none' },
        }}
        icon={<span className="material-icons">menu</span>}
        FabProps={{ sx: { right: '-28px' } }}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={close}
      >
        {[...pages].reverse().map((title) => (
          <SpeedDialAction
            key={title}
            icon={(
              <Link href={title === 'Intro' ? '/about' : `/about/${title}`} passHref>
                <Typography component="a" sx={{ textDecoration: 'none', color: 'black' }}>{title}</Typography>
              </Link>
            )}
            tooltipTitle=""
            FabProps={{
              sx: {
                width: 'auto',
                height: 'auto',
                padding: 1,
                borderRadius: 1,
                textTransform: 'none',
              },
            }}
            tooltipOpen={false}
            onClick={close}
          />
        ))}
      </SpeedDial>
    </Container>
  );
}

export default AboutLayout;
