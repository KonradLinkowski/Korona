import Chart from 'chart.js';

const randomFactor = Math.floor(5 * Math.random());

export const hashStringToInt = string => {
  let hash = 0;
    for (let i = 0; i < string.length; i++) {
      const chr = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
};

export const getColor = name => {
  const template = (r, g, b, a) => `hsla(${r}, ${g}%, ${b}%, ${a})`;
  const hash = hashStringToInt(name);
  const color = [(((hash + randomFactor) ** 3) * 15) % 360, 100, 60];
  return [template(...color, 1), template(...color, 0.5)];
};

export const  createChart = selector => {
  const $canvas = document.querySelector(selector);
  const ctx = $canvas.getContext('2d');
  return  new Chart(ctx, {
    type: 'line',
    options: {
      maintainAspectRatio: false,
      title: {
        text: 'Confirmed cases by date',
        display: true
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'day'
          }
        }],
        yAxes: [{
          type: 'linear',
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
};
