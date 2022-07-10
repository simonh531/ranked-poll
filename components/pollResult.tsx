import React, {
  useState, useEffect, useMemo, ReactNode,
} from 'react';
import {
  gql, useLazyQuery,
} from '@apollo/client';
import {
  Box, Typography, Skeleton, Button, ToggleButton, ToggleButtonGroup, Tabs, Tab,
  TableContainer, Paper, Table, TableBody, TableRow, TableCell, Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
import calc from '../rankedPairsCalc';
import { toHex } from '../pages/poll/[...id]';
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
    getPollResult();
  }, [id, protection]);

  const {
    labels, data, mainPairs, pairMap, rankedPairList, treeSteps,
  } = useMemo(() => {
    if (pollResultData) {
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
  }, [pollResultData?.pollResult, options]);

  let tables:ReactNode = <Skeleton variant="rectangular" height="100%" />;
  if (tab === 1 && Object.keys(pairMap).length) {
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
      <Stack spacing={1}>
        {mainPairs.map((pair, index) => (
          <TableContainer
        // eslint-disable-next-line react/no-array-index-key
            key={index}
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
        ))}
      </Stack>
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
                  const mult = (max - range * (index / options.length)) * 256;
                  return `#${
                    toHex(Math.trunc(r * mult) - 1)}${
                    toHex(Math.trunc(g * mult) - 1)}${
                    toHex(Math.trunc(b * mult) - 1)}`;
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

  return (
    <>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gridTemplateRows: 'auto auto',
        gap: 1,
        marginTop: 1,
        marginBottom: 1,
      }}
      >
        <Tabs
          value={tab}
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ flex: '1' }}>
          {(actualCount || 0) + (actualCount === 1 ? ' vote' : ' votes')}
        </Typography>
        <Button
          onClick={() => navigator.clipboard.writeText(`rnkd.pl/${id}?results`)}
          variant="contained"
          startIcon={<span className="material-icons">content_copy</span>}
          sx={{ textTransform: 'none' }}
        >
          {`rnkd.pl/${id}?results`}
        </Button>
      </Box>
    </>
  );
}

export default PollResult;
