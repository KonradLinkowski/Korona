import { createChart, getColor } from './create_chart';
import { DataService, Country, CountryData } from './data_service';
import { MultiselectButtons } from './multiselect/multiselect';
import { IPService } from './ip_service';

class Main {
  $typeToggle: HTMLInputElement;
  $themeToggle: HTMLInputElement;
  $loadingOverlay: HTMLElement;
  casesChart: Chart;
  countries: Country[] = [];
  userCountry: string;

  constructor(private dataService: DataService, private ipService: IPService) {
    this.$loadingOverlay = document.querySelector('.loading-overlay');
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

    this.fetchData().then(this.init.bind(this));
  }

  showLoading(show: boolean) {
    this.$loadingOverlay.classList.toggle('disabled', !show);
  }

  changeTheme(isDark: boolean) {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  changeChartType(type: 'linear' | 'logarithmic') {
    this.casesChart.options.scales.yAxes[0].type = type;
    this.casesChart.update();
  }

  updateChart(chart: Chart, dataForCountries: { country: Country, data: CountryData[] }[]) {
    const existingLabels = chart.data.datasets.map(e => e.label);
    const dataToAdd = dataForCountries.filter(d => !existingLabels.find(l => l === d.country.Country));
    const labelsToDelete = existingLabels.filter(l => !dataForCountries.find(d => l === d.country.Country));
    Array.prototype.push.apply(chart.data.datasets, dataToAdd.map(countryData => {
      const data = Array.isArray(countryData.data) ? countryData.data.map(entry => ({
        x: new Date(entry.Date),
        y: entry.Cases
      })) : [];
      const [borderColor, backgroundColor] = getColor(countryData.country.Country);
      return {
        data,
        label: countryData.country.Country,
        backgroundColor,
        borderColor,
        borderWidth: 2,
        pointRadius: 5
      };
    }));
    labelsToDelete.forEach(label => {
      const index = chart.data.datasets.findIndex(d => d.label === label);
      chart.data.datasets.splice(index, 1);
    });
    chart.update();
  }

  async onCountriesChange(names: string[]) {
    const currentCountries = names.map(name => this.countries.find(c => c.Country === name));
    const dataForCountries = (await Promise.all(currentCountries
        .map(country => this.dataService.getTotalDataByCountry(country.Slug))
      )).map((data, i) => ({ country: currentCountries[i], data }));
    this.updateChart(this.casesChart, dataForCountries);
    this.showLoading(false);
  }

  async fetchData() {
    this.userCountry = await this.ipService.getUserCountry();
    this.countries = (await this.dataService.getCountries()).filter(e => e.Country.length);
  }

  init() {
    const multiButtonEl = document.querySelector('.js-multi-buttons') as HTMLElement;
    const multiButtonComponent = new MultiselectButtons(multiButtonEl, this.countries.map(c => c.Country));
    multiButtonComponent.addEventListener('change', this.onCountriesChange.bind(this));
    const index = this.countries.findIndex(c => c.Country === this.userCountry);
    if (index !== -1) {
      multiButtonComponent.selectOption(index);
    }
  }
}

const main = new Main(new DataService(), new IPService());
