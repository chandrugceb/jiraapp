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
  selector: 'app-subbug',
  templateUrl: './subbug.component.html',
  styleUrls: ['./subbug.component.css']
})
export class SubbugComponent implements OnInit {
  private subbugs:Subbug[]=[];
  public parentKey:string;  
  @ViewChild(MatSort) sort: MatSort;
  dataSource;
  displayedColumns: string[] = ['key', 
                                'summary', 
                                'status', 
                                'assignee', 
                                'created', 
                                'resolutiondate', 
                                'age',
                                'reopencount',
                                'predevanatimeline',
                                'devlag',
                                'devanatimeline',
                                'devtimeline',
                                'qalag', 
                                'qatimeline',
                                'bsaestimate',
                                'bsaactuals',
                                'devestimate',
                                'devactuals',
                                'qaestimate',
                                'qaactuals'];

  constructor(private bottomSheetRef: MatBottomSheetRef<SubbugComponent>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {     
    this.parentKey = data.subbugs.parentKey;
    this.subbugs = data.subbugs.data;
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.subbugs);      
    this.dataSource.sort = this.sort;
  }

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
