import axios, { AxiosInstance } from 'axios';

interface IPData {
  ip: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  country_name: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}

export class IPService {
  private request: AxiosInstance;
  private cache: IPData;

  constructor() {
    this.request = axios.create({
      baseURL: 'https://ipapi.co/'
    });

    this.cache = null;
  }

  getUserIPData(): Promise<IPData> {
    if (this.cache) {
      return Promise.resolve(this.cache);
    }
    return this.request.get('json').then(response => {
      this.cache = response.data;
      return response.data;
    });
  }

  getUserCountry(): Promise<string> {
    if (this.cache) {
      return Promise.resolve(this.cache.country_name);
    }
    return this.request.get('json').then(response => response.data.country_name);
  }
}
