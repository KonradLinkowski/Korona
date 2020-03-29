import { createChart, getColor } from './chart';
import { DataService } from './data_service';
import { MultiselectButtons } from './multiselect/multiselect';

class Main {
  constructor(dataService) {
    this.dataService = dataService;
    this.typeToggle = document.querySelector('#chart-type-select');
    this.typeToggle.addEventListener('change', event => {
      console.log(event.target);
      this.changeChartType(event.target.checked ? 'logarithmic' : 'linear');
    });
    this.chart = createChart('#chart');

    this.start();
  }

  changeChartType(type) {
    console.log(type);
    this.chart.options.scales.yAxes[0].type = type;
    this.chart.update();
  }

  async fetchDataAndUpdateChart(chart, countries) {
    const dataForCountries = (await Promise.all(countries.map(country => this.dataService.getTotalDataByCountry(country))))
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
  }

  async start() {
    const countries = await this.dataService.getCountries();
    const multiButtonEl = document.querySelector('.js-multi-buttons');
    const multiButtonComponent = new MultiselectButtons(multiButtonEl, countries.map(country => country.Country));
    multiButtonComponent.init();
    multiButtonComponent.addEventListener('change', countries => {
      this.fetchDataAndUpdateChart(this.chart, countries);
    });
  }
}

new Main(new DataService());
