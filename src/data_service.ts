import axios, { AxiosInstance } from 'axios';

interface ServiceCache {
  [key: string]: any;
}

export interface Country {
  Country: string;
  Slug: string;
  Provinces: string[];
}

export interface CountryData {
  Country: string;
  Cases: number;
  Date: string;
  Province: string;
  Lat: number;
  Lon: number;
  Status: string;
}

export class DataService {
  private request: AxiosInstance;
  private cache: ServiceCache = {
    dataByCountry: {},
    totalDataByCountry: {}
  };

  constructor() {
    this.request = axios.create({
      baseURL: 'https://api.covid19api.com/'
    });
  }

  getCountries(): Promise<Country[]> {
    return this.request.get('countries').then(response => response.data);
  }

  getTotalDataByCountry(country: string): Promise<CountryData[]> {
    if (this.cache.totalDataByCountry[country]) {
      return Promise.resolve(this.cache.totalDataByCountry[country]);
    }
    return this.request.get(`total/country/${country}/status/confirmed`)
    .then(response => {
      this.cache.totalDataByCountry[country] = response.data;
      return response.data;
    });
  }

  getDataByCountry(country: string): Promise<CountryData[]> {
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
