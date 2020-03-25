import axios from 'axios';

export class DataService {
  constructor() {
    this.request = axios.create({
      baseURL: 'https://api.covid19api.com/'
    });
    this.cache = {
      dataForCountry: {}
    };
  }

  getCountries() {
    return this.request.get('countries').then(response => response.data);
  }

  getDataForCountry(contry) {
    if (this.cache.dataForCountry[contry]) {
      return Promise.resolve(this.cache.dataForCountry[contry]);
    }
    return this.request.get(`dayone/country/${contry}/status/confirmed`)
    .then(response => {
      this.cache.dataForCountry[contry] = response.data;
      return response.data;
    });
  }
}
