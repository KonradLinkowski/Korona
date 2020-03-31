import { createChart, getColor } from './create_chart';
import { DataService } from './data_service';
import { MultiselectButtons } from './multiselect/multiselect';
import { IPService } from './ip_service';

class Main {
  $typeToggle: HTMLInputElement;
  $themeToggle: HTMLInputElement;
  casesChart: Chart;

  constructor(private dataService: DataService, private ipService: IPService) {
    this.$typeToggle = document.querySelector('#chart-type-select');
    this.$typeToggle.addEventListener('change', event => {
      this.changeChartType((event.target as HTMLInputElement).checked ? 'logarithmic' : 'linear');
    });

    this.casesChart = createChart('#cases-chart');

    this.$themeToggle = document.querySelector('#theme-toggle');
    this.$themeToggle.addEventListener('change', event => {
      this.changeTheme((event.target as HTMLInputElement).checked);
    });

    const isDarkTheme = (localStorage.getItem('theme') === 'dark') || false;
    this.$themeToggle.checked = isDarkTheme;
    this.changeTheme(isDarkTheme);

    this.start();
  }

  changeTheme(isDark: boolean) {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  changeChartType(type: 'linear' | 'logarithmic') {
    this.casesChart.options.scales.yAxes[0].type = type;
    this.casesChart.update();
  }

  async fetchDataAndUpdateChart(chart: Chart, countries: string[]) {
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
    const { country } = await this.ipService.getUserIPData();
    const countries = (await this.dataService.getCountries()).filter(e => e.Country.length);
    const multiButtonEl = document.querySelector('.js-multi-buttons') as HTMLElement;
    const multiButtonComponent = new MultiselectButtons(multiButtonEl, countries.map(c => c.Country));
    multiButtonComponent.addEventListener('change', countriesNames => {
      this.fetchDataAndUpdateChart(this.casesChart, countriesNames);
    });
    const index = countries.findIndex(c => c.Country === country);
    if (index !== -1) {
      multiButtonComponent.selectOption(index);
    }
  }
}

const main = new Main(new DataService(), new IPService());
