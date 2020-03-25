import axios from 'axios';

export class DataService {
  constructor() {
    this.request = axios.create({
      baseURL: 'https://api.covid19api.com/'
    });
  }

  getCountries() {
    return this.request.get('countries').then(response => response.data);
  }

  getDataForCountry(contry) {
    return this.request.get(`dayone/country/${contry}/status/confirmed`)
    .then(response => response.data);
  }
}
