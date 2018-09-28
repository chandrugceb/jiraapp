import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Subbug } from '../subbug';
import {MatSort, 
        MatTable, 
        MatSortable, 
        MatSortHeader, 
        MatTableDataSource,
        MatBottomSheet, 
        MatBottomSheetRef} from '@angular/material';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  public bsaefforts:any;
  public devefforts:any;
  public qaefforts:any;
  public bsahrs:number=0;
  public devhrs:number=0;
  public qahrs:number=0;

  constructor(private bottomSheetRef: MatBottomSheetRef<ReportComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {     
    this.bsaefforts = data.bsaefforts;
    this.devefforts = data.devefforts;
    this.qaefforts = data.qaefforts;
    this.bsaefforts.map((bsa)=>this.bsahrs = this.bsahrs + bsa.effort);
    this.devefforts.map((dev)=>this.devhrs = this.devhrs + dev.effort);
    this.qaefforts.map((qa)=>this.qahrs = this.qahrs + qa.effort);
  }

  ngOnInit() {
  }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
