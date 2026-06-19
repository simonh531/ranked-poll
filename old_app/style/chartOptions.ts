export const barOptions:Record<string, unknown> = {
  maintainAspectRatio: false,
  indexAxis: 'y',
  scales: {
    x: {
      title: {
        display: true,
        text: 'Relative Strength',
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

export const donutOptions:Record<string, unknown> = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'left',
    },
  },
};
