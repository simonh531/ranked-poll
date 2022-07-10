import React, { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import {
  Container, Paper, Grid, Typography,
} from '@mui/material';
import { themeColorVar } from './layout';
import { mainColor } from '../style/colors';

function AboutLayout({ children, pages }:{ children: ReactNode, pages: string[] }) {
  const router = useRouter();
  const themeColor = useReactiveVar(themeColorVar);
  useEffect(() => {
    if (themeColor === '#bbb') {
      themeColorVar(mainColor);
    }
  }, []);

  return (
    <Container>
      <Grid container spacing={1}>
        <Grid item xs={2}>
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
        <Grid item xs={8}>
          <Paper sx={{ padding: 1, paddingTop: 2 }}>
            {children}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AboutLayout;
