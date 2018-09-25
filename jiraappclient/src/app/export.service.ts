import { Injectable } from '@angular/core';
import { Angular5Csv } from '../../node_modules/angular5-csv/Angular5-csv';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private options = { 
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true, 
    showTitle: true,
    title: 'SummaryReport',
    useBom: true,
    noDownload: false,
    headers:["Key",
              "Summary",
              "Status",
              "Assignee",
              "Created",
              "Resolved",
              "Age",
              "Active Subbugs",
              "Total Subbugs",
              "ReOpen Count",
              "PreDev Analysis Timeline",
              "Dev Lag",
              "Dev Analysis Timeline",
              "Dev Timeline",
              "QA Lag",
              "QA Timeline",
              "State Transitions",
              "BSA Estimate (Hrs)",
              "BSA Actuals (Hrs)",
              "Dev Estimate (Hrs)",
              "Dev Actuals (Hrs)",
              "QA Estimate (Hrs)",
              "QA Actuals (Hrs)",
              "BSA Effort Split Up",
              "DEV Effort Split Up",
              "QA Effort Split Up",
              "Metrics Non-Compliance Tickets"]
  };
  constructor() { }

  exportToCSV(data:any){
    new Angular5Csv(data,"SummaryReport",this.options);
  }
}
