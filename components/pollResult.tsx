import React, {
  useState, useEffect, useMemo, ReactNode,
} from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { useTheme } from '@mui/material/styles';
import {
  Box, Typography, Skeleton, Button, ToggleButton, ToggleButtonGroup, Tabs, Tab,
  TableContainer, Paper, Table, TableBody, TableRow, TableCell, Grid,
  useMediaQuery,
} from '@mui/material';
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
import DetailedPollResult from './detailedPollResult';
import calc from '../utils/rankedPairsCalc';
import { toColor } from '../style/colorTools';
import { barOptions, donutOptions } from '../style/chartOptions';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
);

const POLL_RESULT = gql`
  query pollResult($id: ID!, $protection: Protection!) {
    pollResult(id: $id, protection: $protection) {
      vote
      lowVote
      count
    }
    poll(id: $id) {
      id
      count
      cookieCount
      ipCount
    }
  }
`;

function PollResult({
  id, options, protection, actualCount,
}:{
  id: string,
  options: string[],
  protection: string,
  actualCount: number,
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const [
    getPollResult,
    { /* loading: pollResultLoading, */ data: pollResultData },
  ] = useLazyQuery(POLL_RESULT, {
    variables: { id, protection },
    fetchPolicy: 'cache-and-network',
  });
  const [tab, setTab] = useState(0);
  const [chartType, setChartType] = useState('bar');
  const [detailStep, setDetailStep] = useState('grid');

  useEffect(() => {
    if (isXs) { // was big
      if (tab === 1 && detailStep === 'sort') { // was on "detailed" and "sort"
        setTab(2);
      }
    } else if (tab === 2) { // was small and on "detailed" and "sort"
      setTab(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isXs]);

  useEffect(() => {
    getPollResult();
  }, [getPollResult]);

  const {
    labels, data, mainPairs, pairMap, rankedPairList, treeSteps,
  } = useMemo(() => {
    if (pollResultData?.pollResult) {
      const {
        pairs, rankings, rankedPairs, ratioPercents, history,
      } = calc(pollResultData?.pollResult, options);
      const labelList = [];
      const dataList = [];
      rankings.forEach((rank, index) => {
        rank.forEach((option) => {
          labelList.push(option);
          dataList.push(ratioPercents[index] * actualCount);
        });
      });

      const mainPairList:[[string, number], [string, number]][] = [];
      const flatRankings = rankings.flat();
      for (let i = 0; i < flatRankings.length - 1; i += 1) {
        const alphabeticalOrder = [flatRankings[i], flatRankings[i + 1]].sort();
        const pair = pairs[JSON.stringify(alphabeticalOrder)];
        const winnerFirst = alphabeticalOrder[0] === flatRankings[i];
        if (winnerFirst) {
          mainPairList.push([[flatRankings[i], pair[0]], [flatRankings[i + 1], pair[1]]]);
        } else {
          mainPairList.push([[flatRankings[i], pair[1]], [flatRankings[i + 1], pair[0]]]);
        }
      }
      return {
        labels: labelList,
        data: dataList,
        mainPairs: mainPairList,
        pairMap: pairs,
        rankedPairList: rankedPairs,
        treeSteps: history,
      };
    }
    return {
      labels: [], data: [], mainPairs: [], pairMap: {}, rankedPairList: [], treeSteps: [],
    };
  }, [pollResultData, options, actualCount]);

  let tables:ReactNode = <Skeleton variant="rectangular" height="100%" />;
  if ((tab === 1 || tab === 2) && Object.keys(pairMap).length) {
    tables = (
      <DetailedPollResult
        pairs={pairMap}
        options={options}
        detailStep={detailStep}
        rankedPairs={rankedPairList}
        history={treeSteps}
      />
    );
  } else if (tab === 0 && mainPairs.length) {
    tables = (
      <Grid
        container
        spacing={1}
        direction={isXs ? 'row' : 'column'}
        sx={{ justifyContent: 'space-between' }}
      >
        {mainPairs.map((pair, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Grid item key={index}>
            <TableContainer
              component={Paper}
              sx={{ backgroundColor: '#ffffff' }}
            >
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {pair[0][0]}
                    </TableCell>
                    <TableCell>
                      {pair[0][1]}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      {pair[1][0]}
                    </TableCell>
                    <TableCell>
                      {pair[1][1]}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        ))}
      </Grid>
    );
  }

  let chart = <Skeleton variant="rectangular" height={120} />;
  const r = (parseInt(theme.palette.primary.main.slice(1, 3), 16) + 1) / 256;
  const g = (parseInt(theme.palette.primary.main.slice(3, 5), 16) + 1) / 256;
  const b = (parseInt(theme.palette.primary.main.slice(5, 7), 16) + 1) / 256;
  const max = 1 / Math.max(r, g, b);
  const min = max * 0.1;
  const range = max - min;

  if (labels.length && data.length) {
    switch (chartType) {
      case 'bar':
        chart = (
          <Bar
            data={{
              labels,
              datasets: [{
                data,
                backgroundColor: theme.palette.primary.dark,
              }],
            }}
            options={barOptions}
            height={isXs ? options.length * 20 : null}
          />
        );
        break;
      case 'donut':
        chart = (
          <Doughnut
            data={{
              labels,
              datasets: [{
                data,
                backgroundColor: options.map((_, index) => {
                  const mult = max - range * (index / options.length);
                  return toColor(r, g, b, mult);
                }),
              }],
            }}
            options={donutOptions}
          />
        );
        break;
      default:
        break;
    }
  }

  let resultView;
  if (isXs) {
    resultView = (
      <>
        <Tabs
          variant="fullWidth"
          value={tab}
          onChange={(_, newValue) => {
            setTab(newValue);
            if (newValue === 1) {
              setDetailStep('grid');
            } else if (newValue === 2) {
              setDetailStep('sort');
            }
          }}
          sx={{ marginTop: 1, marginBottom: 1 }}
        >
          <Tab label="Overview" sx={{ textTransform: 'none' }} />
          <Tab label="Grid" sx={{ textTransform: 'none' }} />
          <Tab label="Detailed" sx={{ textTransform: 'none' }} />
        </Tabs>
        {tab === 0 ? (
          <>
            <Tabs
              variant="fullWidth"
              value={chartType === 'bar' ? 0 : 1}
              onChange={(_, newValue) => setChartType(newValue === 0 ? 'bar' : 'donut')}
              sx={{ marginTop: 1, marginBottom: 1 }}
            >
              <Tab label="Bar" sx={{ textTransform: 'none' }} />
              <Tab label="Donut" sx={{ textTransform: 'none' }} />
            </Tabs>
            <Box>
              {chart}
            </Box>
          </>
        ) : null}
        {tables}
      </>
    );
  } else {
    resultView = (
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridTemplateRows: 'auto auto',
        gap: 1,
        marginTop: 1,
      }}
      >
        <Tabs
          value={tab < 2 ? tab : 1}
          onChange={(_, newValue) => setTab(newValue)}
          sx={{ gridColumn: '1', gridRow: '1' }}
        >
          <Tab label="Overview" sx={{ textTransform: 'none' }} />
          <Tab label="Detailed" sx={{ textTransform: 'none' }} />
        </Tabs>
        <Box sx={{ gridColumn: tab === 0 ? '1' : '1 / 3', gridRow: '2' }}>
          {tables}
        </Box>
        { tab === 0 ? (
          <>
            <Box sx={{ gridColumn: '2', gridRow: '1' }}>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(_, type) => setChartType(type)}
                size="small"
              >
                <ToggleButton value="bar">
                  <span className="material-icons">bar_chart</span>
                </ToggleButton>
                <ToggleButton value="donut">
                  <span className="material-icons">donut_large</span>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ gridColumn: '2', gridRow: '2' }}>
              {chart}
            </Box>
          </>
        ) : (
          <Box sx={{ gridColumn: '2', gridRow: '1' }}>
            <ToggleButtonGroup
              value={detailStep}
              exclusive
              onChange={(_, step) => setDetailStep(step)}
              size="small"
            >
              <ToggleButton value="grid">
                <span className="material-icons">grid_on</span>
              </ToggleButton>
              <ToggleButton value="sort">
                <span className="material-icons">sort</span>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <>
      {resultView}
      <Grid container spacing={1} sx={{ justifyContent: 'space-evenly', marginTop: 1 }}>
        <Grid item sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{
            fontSize: {
              xs: '0.925em',
              sm: '1em',
            },
          }}
          >
            {(actualCount || 0) + (actualCount === 1 ? ' vote' : ' votes')}
          </Typography>
        </Grid>
        <Grid item sx={{ flex: '1', display: { xs: 'none', sm: 'block' } }} />
        <Grid item>
          <Button
            size={isXs ? 'small' : 'medium'}
            onClick={() => navigator.clipboard.writeText(`rnkd.pl/${id}`)}
            variant="contained"
            startIcon={<span className="material-icons">content_copy</span>}
            sx={{ textTransform: 'none' }}
          >
            {`rnkd.pl/${id}`}
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

export default PollResult;
