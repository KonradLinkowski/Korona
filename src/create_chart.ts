import { Chart } from 'chart.js';

const template = (r: number, g: number, b: number, a: number) => `hsla(${r}, ${g}%, ${b}%, ${a})`;

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);

const shuffle = (array: any[]) => {
  const newArray = [...array]
  for (let i = 0; i < newArray.length - 2; i += 1) {
    const j = randomInt(i, newArray.length)
    const temp = newArray[i]
    newArray[i] = newArray[j]
    newArray[j] = temp
  }
  return newArray;
};

const allColors = shuffle(Array(360 / 30).fill(0).map((_, i) => {
  const hue = i * 30;
  return [template(hue, 100, 60, 1), template(hue, 100, 60, 0.5)];
}));

const availableColors = [...allColors];

const colorCache: {
  [key: string]: [string, string]
} = {};

export const getColor = (name: string) => {
  if (colorCache[name]) {
    return colorCache[name];
  }
  if (!availableColors.length) {
    const hue = Math.random() * 360;
    return [template(hue, 100, 60, 1), template(hue, 100, 60, 0.5)]
  }
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  const colors = availableColors[randomIndex];
  availableColors.splice(randomIndex, 1);
  colorCache[name] = colors;
  return colors;
};

export const createChart = (selector: string) => {
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
