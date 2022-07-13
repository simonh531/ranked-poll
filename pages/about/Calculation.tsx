/* eslint-disable max-len */
import React, { useState } from 'react';
import Head from 'next/head';
import {
  Typography, TextField, ToggleButton, ToggleButtonGroup, Tabs, Tab, useMediaQuery,
  TableContainer, Paper, Table, TableBody, TableRow, TableCell, Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { createClient } from 'contentful';
import { Document } from '@contentful/rich-text-types';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

import AboutLayout from '../../components/aboutLayout';
import options from '../../style/richTextStyles';
import { toColor } from '../../style/colorTools';
import { fromPairsCalc } from '../../utils/rankedPairsCalc';
import { getAboutPages } from '../../utils/contentfulUtils';
import { barOptions, donutOptions } from '../../style/chartOptions';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
);

function InputTable({
  value1Name, value2Name, value1, value2, setValue1, setValue2,
}:{
  value1Name: string
  value2Name: string
  value1: number
  value2: number
  setValue1: React.Dispatch<React.SetStateAction<number>>
  setValue2: React.Dispatch<React.SetStateAction<number>>
}) {
  return (
    <TableContainer component={Paper} sx={{ backgroundColor: '#ffffff' }}>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell>{value1Name}</TableCell>
            <TableCell>
              <TextField
                size="small"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                value={value1}
                onChange={
                  (event: React.ChangeEvent<HTMLInputElement>) => setValue1(parseInt(event.target.value, 10) || 0)
                }
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{value2Name}</TableCell>
            <TableCell>
              <TextField
                size="small"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                value={value2}
                onChange={
                  (event: React.ChangeEvent<HTMLInputElement>) => setValue2(parseInt(event.target.value, 10) || 0)
                }
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const optionIndexTable = {
  a: 0,
  b: 1,
  c: 2,
};

function Calculation({ pages, prePlaygroundText, postPlaygroundText }:{
  pages:string[]
  prePlaygroundText:Document
  postPlaygroundText:Document
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [chartType, setChartType] = useState('bar');
  const [aPairAB, setAPairAB] = useState(0);
  const [bPairAB, setBPairAB] = useState(0);
  const [bPairBC, setBPairBC] = useState(0);
  const [cPairBC, setCPairBC] = useState(0);
  const [cPairCA, setCPairCA] = useState(0);
  const [aPairCA, setAPairCA] = useState(0);

  const { rankings, ratioPercents } = fromPairsCalc({
    '["a","b"]': [aPairAB, bPairAB],
    '["b","c"]': [bPairBC, cPairBC],
    '["a","c"]': [aPairCA, cPairCA],
  }, ['a', 'b', 'c']);

  const data = [0, 0, 0];
  rankings.forEach((rank, index) => {
    rank.forEach((option) => {
      data[optionIndexTable[option]] = ratioPercents[index] * (
        Math.max(aPairAB, aPairCA) + Math.max(bPairAB, bPairBC) + Math.max(cPairBC, cPairCA));
    });
  });

  const r = (parseInt(theme.palette.primary.main.slice(1, 3), 16) + 1) / 256;
  const g = (parseInt(theme.palette.primary.main.slice(3, 5), 16) + 1) / 256;
  const b = (parseInt(theme.palette.primary.main.slice(5, 7), 16) + 1) / 256;
  const max = 1 / Math.max(r, g, b);
  const min = max * 0.3;
  const mid = (max + min) / 2;
  const colors = [toColor(r, g, b, max), toColor(r, g, b, mid), toColor(r, g, b, min)];

  return (
    <AboutLayout pages={pages}>
      <Head>
        <title>Calculation | Ranked Poll About</title>
        {/* <meta name="description" key="description" content={description} /> */}
        <meta property="og:url" content="rankedpoll.com/about/Calculation" key="ogurl" />
        <meta property="og:title" content="Calculation" key="ogtitle" />
        {/* <meta property="og:description" content={description} key="ogdesc" /> */}
        <link rel="canonical" href="https://rankedpoll.com/about/Calculation" key="canonical" />
      </Head>
      <Typography
        variant="h1"
        sx={{
          fontSize: '2.6em',
          textAlign: 'center',
        }}
      >
        Calculation
      </Typography>
      {documentToReactComponents(prePlaygroundText, options)}
      <Stack spacing={1}>
        <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
          <InputTable
            value1Name="A"
            value2Name="B"
            value1={aPairAB}
            value2={bPairAB}
            setValue1={setAPairAB}
            setValue2={setBPairAB}
          />
          <InputTable
            value1Name="B"
            value2Name="C"
            value1={bPairBC}
            value2={cPairBC}
            setValue1={setBPairBC}
            setValue2={setCPairBC}
          />
          <InputTable
            value1Name="C"
            value2Name="A"
            value1={cPairCA}
            value2={aPairCA}
            setValue1={setCPairCA}
            setValue2={setAPairCA}
          />
        </Stack>
        <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
          {isXs ? (
            <Tabs
              sx={{ display: { xs: 'block', sm: 'none' } }}
              value={chartType === 'bar' ? 0 : 1}
              onChange={(_, value) => setChartType(value === 0 ? 'bar' : 'donut')}
            >
              <Tab label="Bar Chart" sx={{ textTransform: 'none' }} />
              <Tab label="Donut Chart" sx={{ textTransform: 'none' }} />
            </Tabs>
          ) : (
            <ToggleButtonGroup
              orientation="vertical"
              value={chartType}
              exclusive
              onChange={(_, type) => setChartType(type)}
              size="small"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <ToggleButton value="bar">
                <span className="material-icons">bar_chart</span>
              </ToggleButton>
              <ToggleButton value="donut">
                <span className="material-icons">donut_large</span>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          <Paper sx={{ backgroundColor: '#ffffff', padding: 1, flex: 1 }}>
            {chartType === 'bar' ? (
              <Bar
                data={{
                  labels: ['a', 'b', 'c'],
                  datasets: [{
                    data,
                    backgroundColor: theme.palette.primary.dark,
                  }],
                }}
                options={barOptions}
              />
            ) : (
              <Doughnut
                data={{
                  labels: ['a', 'b', 'c'],
                  datasets: [{
                    data,
                    backgroundColor: colors,
                  }],
                }}
                options={donutOptions}
              />
            )}
          </Paper>
        </Stack>
      </Stack>
      {documentToReactComponents(postPlaygroundText, options)}
    </AboutLayout>
  );
}

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

  const [[pages], calculationText] = await Promise.all([
    getAboutPages(client),
    client.getEntry<{prePlaygroundText:Document, postPlaygroundText:Document}>('5kB9prnTP5VVQGJVXhV0cR', {
      content_type: 'calculationPage',
      select: 'fields.prePlaygroundText,fields.postPlaygroundText',
    }),
  ]);

  return {
    props: {
      pages,
      prePlaygroundText: calculationText.fields.prePlaygroundText,
      postPlaygroundText: calculationText.fields.postPlaygroundText,
    },
  };
};

export default Calculation;
