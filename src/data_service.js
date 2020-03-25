import axios from 'axios';

export class DataService {
  constructor() {
    this.request = axios.create({
      baseURL: 'https://api.covid19api.com/'
    });
    this.cache = {
      dataByCountry: {},
      totalDataByCountry: {}
    };
  }

  getCountries() {
    return this.request.get('countries').then(response => response.data);
  }

  getTotalDataByCountry(country) {
    if (this.cache.totalDataByCountry[country]) {
      return Promise.resolve(this.cache.totalDataByCountry[country]);
    }
    return this.request.get(`total/country/${country}/status/confirmed`)
    .then(response => {
      this.cache.totalDataByCountry[country] = response.data;
      return response.data;
    });
  }

  getDataByCountry(country) {
    if (this.cache.dataByCountry[country]) {
      return Promise.resolve(this.cache.dataByCountry[country]);
    }
    return this.request.get(`dayone/country/${country}/status/confirmed`)
    .then(response => {
      this.cache.dataByCountry[country] = response.data;
      return response.data;
    });
  }
}
