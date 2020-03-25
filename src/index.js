import { createChart } from './chart';
import { DataService } from './data_service';

const dataService = new DataService();

dataService.getDataForCountry('poland').then(data => {
  console.log(data);
  createChart(
    '#chart',
    data.map(entry => entry.Cases),
    data.map(entry => {
      const date = new Date(entry.Date);
      const formatter = new Intl.DateTimeFormat('en-GB', { month: 'short', day: '2-digit' }) ;
      const output = formatter.format(date);
      return output;
    })
  );
});
