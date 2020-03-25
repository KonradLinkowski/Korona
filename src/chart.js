import Chart from 'chart.js';

export const  createChart = (selector, data, labels) => {
  const $canvas = document.querySelector(selector);
  const ctx = $canvas.getContext('2d');
  return  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2
      }]
    },
    options: {
      maintainAspectRatio: false,
      title: {
        text: 'Confirmed cases by date'
      },
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
};
