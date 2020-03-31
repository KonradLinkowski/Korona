import axios, { AxiosInstance } from 'axios';

interface IPData {
  status: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: string;
  lon: string;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
}

export class IPService {
  private request: AxiosInstance;

  constructor() {
    this.request = axios.create({
      baseURL: 'http://ip-api.com/'
    });
  }

  getUserIPData(): Promise<IPData> {
    return this.request.get('json').then(response => response.data);
  }
}
