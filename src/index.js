import { createChart, getColor } from './chart';
import { DataService } from './data_service';
import { MultiselectButtons } from './multiselect/multiselect';

const fetchDataAndUpdateChart = async (chart, countries, dataService) => {
  const dataForCountries = (await Promise.all(countries.map(country => dataService.getDataForCountry(country))))
    .map((data, i) => ({ country: countries[i], data }));
  const existingLabels = chart.data.datasets.map(e => e.label);
  const notExistingYet = dataForCountries.filter(d => !existingLabels.includes(d.country));
  const notExistingAnymore = existingLabels.filter(l => !countries.includes(l));
  Array.prototype.push.apply(chart.data.datasets, notExistingYet.map(countryData => {
    const data = Array.isArray(countryData.data) ? countryData.data.map(entry => ({
      x: new Date(entry.Date),
      y: entry.Cases
    })) : [];
    const [borderColor, backgroundColor] = getColor(countryData.country);
    return {
      data,
      label: countryData.country,
      backgroundColor,
      borderColor,
      borderWidth: 2,
      pointRadius: 5
    };
  }));
  notExistingAnymore.forEach(c => {
    const index = chart.data.datasets.findIndex(d => d.label === c);
    chart.data.datasets.splice(index, 1);
  });
  chart.update();
};


const start = async () => {
  const dataService = new DataService();
  const chart = createChart('#chart');
  const countries = await dataService.getCountries();
  const multiButtonEl = document.querySelector('.js-multi-buttons');
  const multiButtonComponent = new MultiselectButtons(multiButtonEl, countries.map(country => country.Country));
  multiButtonComponent.init();
  multiButtonComponent.addEventListener('change', countries => {
    fetchDataAndUpdateChart(chart, countries, dataService);
  });
};

start();
