import { Chart } from 'chart.js';

// const randomFactor = Math.floor(5 * Math.random());
const randomFactor = 0

export const hashStringToInt = (str: string) => {
  let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
};

export const getColor = (name: string) => {
  const template = (r: number, g: number, b: number, a: number) => `hsla(${r}, ${g}%, ${b}%, ${a})`;
  const hash = hashStringToInt(name);
  const color = [(hash % 360) * 17 + randomFactor, 100, 60];
  return [template(color[0], color[1], color[2], 1), template(color[0], color[1], color[2], 0.5)];
};

export const  createChart = (selector: string) => {
  const $canvas = document.querySelector(selector) as HTMLCanvasElement;
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
