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
  private bsaefforts:any;
  private devefforts:any;
  private qaefforts:any;

  constructor(private bottomSheetRef: MatBottomSheetRef<ReportComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {     
    this.bsaefforts = data.bsaefforts;
    this.devefforts = data.devefforts;
    this.qaefforts = data.qaefforts;
  }

  ngOnInit() {
  }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
