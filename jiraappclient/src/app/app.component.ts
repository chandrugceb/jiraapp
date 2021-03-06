import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import { StoryService } from './story.service';
import {MatSort, 
        MatTable, 
        MatSortable, 
        MatSortHeader, 
        MatTableDataSource, 
        PageEvent, 
        MatPaginator,
        MatBottomSheet,
        MatBottomSheetRef,
        MatStep,
        MatStepper} from '@angular/material';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {Story} from './story';
import {Subbug} from './subbug';
import {Effort} from './effort';
import { SubbugComponent } from './subbug/subbug.component';
import {ReportComponent} from './report/report.component';
import { SubbugService } from './subbug.service';
import { Changelog } from './changelog';
import {Cl} from './cl';
import { MetricsService } from './metrics.service';
import { ExportService } from './export.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{ 
  jqlFormGroup: FormGroup;
  filterFormGroup: FormGroup;
  errorCount:number=0;

  storyReqCount:number=0;
  changelogReqCount:number=0; 
  isStoryLoaded:boolean=true;  
  private allKeys:string[]=[];
  private storedjql:string='';
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('stepper') stepper:MatStepper;
  title = 'app';
  dataSource;
  private ready:boolean=false;
  private stories:Story[]=[]; 
  private subbugs:Subbug[]=[];
  private cls:Cl[]=[];  
  private bsaactualssplit:Cl[]=[];
  private devactualssplit:Cl[]=[];
  private qaactualssplit:Cl[]=[];
  private changelogs:Changelog[]=[];    
  private bsaactuallogs:Changelog[]=[]; 
  private devactuallogs:Changelog[]=[];  
  private qaactuallogs:Changelog[]=[];
  private bsaefforts:Effort[]=[];
  private devefforts:Effort[]=[];
  private qaefforts:Effort[]=[]
  public contentloaded:boolean=false;
  private rawStories:any;
  displayedColumns: string[] = ['key', 
                                'summary', 
                                'status', 
                                'assignee', 
                                'created', 
                                'resolutiondate', 
                                'age',
                                'storysubbugs',
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
                                'qaactuals',
                                'metricnoncompliancecount'];
  pageSizeOptions: number[] = [5, 10, 25, 100];

  // MatPaginator Inputs
  length = 100;
  pageSize = 10;

  // MatPaginator Output
  pageEvent: PageEvent;

  constructor(private bottomSheet: MatBottomSheet, 
              private _storyService:StoryService, 
              private _subbugService:SubbugService,
              private _metricsService:MetricsService,
              private _formBuilder: FormBuilder,
              private _exportService:ExportService) { 
      this.storedjql = localStorage.getItem('jql');
      //console.log('In Constructor');
      if(this.storedjql !== null)
      {
           this.kickstart();
      }
      this.dataSource = new MatTableDataSource(this.stories);      
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

  }

  kickstart(){

    this.isStoryLoaded=false; 
    this._storyService.getStory().subscribe(
      (res)=>{
        //console.log(res);
        this.parseStoriesRes(res);
      },
      (err)=>{
        this.errorCount++;
      });
  }

  reset(){    
  this.errorCount=0;
  this.storyReqCount=0;
  this.changelogReqCount=0; 
  this.isStoryLoaded=true;  
  this.allKeys=[];
  this.stories=[]; 
  this.subbugs=[];
  this.cls=[];
  this.bsaactualssplit=[];
  this.devactualssplit=[];
  this.qaactualssplit=[];
  this.changelogs=[];
  this.bsaactuallogs=[];
  this.devactuallogs=[];
  this.qaactuallogs=[];
  this.bsaefforts=[];
  this.devefforts=[];
  this.qaefforts=[];
  this.contentloaded=false;
  this.dataSource = new MatTableDataSource(this.stories);      
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
   // console.log('In ngOnInit');
    this.jqlFormGroup = this._formBuilder.group({
      jqlCtrl: ['', Validators.required]
    });
    this.filterFormGroup = this._formBuilder.group({
      filterCtrl: ['', Validators.required]
    }); 
    this.jqlFormGroup.get('jqlCtrl').setValue(this.storedjql);
    if(this.storedjql != null)
    {
    this.stepper.selectedIndex = 1;
    }
  }
  parseStoriesRes(res){
    this.rawStories = res.issues;
    this.handleMoreStories(res);
    for(let story of this.rawStories){
      var newStory = new Story();
      newStory.key = story.key;
      newStory.summary = story.fields.summary;
      newStory.status = story.fields.status.name;
      newStory.assignee = (story.fields.assignee)? story.fields.assignee.displayName:null;
      newStory.created = new Date(story.fields.created);
      newStory.resolutiondate = (story.fields.resolutiondate)?(new Date(story.fields.resolutiondate)):null;
      newStory.age = this.round((((newStory.resolutiondate)?
                        (newStory.resolutiondate.valueOf()-newStory.created.valueOf()):
                        ((new Date()).valueOf()-newStory.created.valueOf()))/1000/60/60/24),1);
      newStory.storysubbugs = [];
      newStory.changelogs = [];
      newStory.storyactivesubbugcount=0;
      newStory.issubbugloaded=false;
      newStory.ischangelogsloaded=false;
      newStory.predevanatimeline = 0;
      newStory.devanatimeline = 0;
      newStory.devlag = 0;
      newStory.devtimeline = 0;
      newStory.qalag = 0;
      newStory.qatimeline = 0;
      newStory.reopencount = 0;
      newStory.statetransition = '';      
      newStory.bsaestimate = story.fields.customfield_14229;
      newStory.bsaactuals = story.fields.customfield_14230;
      newStory.devestimate = story.fields.customfield_11400;
      newStory.devactuals = story.fields.customfield_14100;
      newStory.qaestimate = story.fields.customfield_14226;
      newStory.qaactuals = story.fields.customfield_14227;
      newStory.metricnoncompliancecount = 0;
      //console.log((new Date()).valueOf());
      this.stories.push(newStory);
    }
    this.dataSource = new MatTableDataSource(this.stories);      
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.ready=true;
    if((res.startAt + res.maxResults) > res.total){
      this.isStoryLoaded=true;
      this.loadSubbugsForStories();
    }
  }

  round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }
  applyFilter(filterValue: string) {
    this.dataSource.filterPredicate = (data, filter) => {
      if(data.summary.trim().toLowerCase().indexOf(filter) !== -1)
        return true;
      else if(data.key.trim().toLowerCase().indexOf(filter) !== -1)
        return true;
      else if(data.assignee != null)
            {
              if(data.assignee.trim().toLowerCase().indexOf(filter) !== -1)
              return true;
            }
      if(data.status.trim().toLowerCase().indexOf(filter) !== -1)
            return true;
      else
        return false;
    };
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
  }
  handleMoreStories(res:any){
    if((res.startAt + res.maxResults) < res.total){
      this._storyService.getStoryWithOffset(res.startAt + res.maxResults).subscribe(
        (resnew)=>{
          this.parseStoriesRes(resnew);
        },
        (err)=>{
          this.errorCount++;
        });
    }
  }
  getRecord(row:any){
//    console.log(row);
  }

  loadSubbugsForStories(){
    for(let Story of this.stories){
      this.storyReqCount++;
      this._storyService.getSubbugForStory(Story.key).subscribe((res)=>{
        this.parseSubbugRes(res);
        this.storyReqCount--;
        if(this.storyReqCount==0){
        //  console.log(this.subbugs);
          this.pushSubbugs();
        }
      },
      (err)=>{
        this.errorCount++;
      });
    }
  }

  parseSubbugRes(res){    
    let rawSubbugs:any;
    rawSubbugs = res.issues;
    for(let subbug of rawSubbugs){
      var newSubbug = new Subbug();
      newSubbug.key = subbug.key;
      newSubbug.summary = subbug.fields.summary;
      newSubbug.status = subbug.fields.status.name;
      newSubbug.assignee = (subbug.fields.assignee)? subbug.fields.assignee.displayName:null;
      newSubbug.created = new Date(subbug.fields.created);
      newSubbug.resolutiondate = (subbug.fields.resolutiondate)?(new Date(subbug.fields.resolutiondate)):null;
      newSubbug.age = this.round((((newSubbug.resolutiondate)?
                        (newSubbug.resolutiondate.valueOf()-newSubbug.created.valueOf()):
                        ((new Date()).valueOf()-newSubbug.created.valueOf()))/1000/60/60/24),1);
      newSubbug.parent = subbug.fields.parent.key;
      newSubbug.predevanatimeline = 0;
      newSubbug.devanatimeline = 0;
      newSubbug.devlag = 0;
      newSubbug.devtimeline = 0;
      newSubbug.qalag = 0;
      newSubbug.qatimeline = 0;
      newSubbug.changelogs = [];
      newSubbug.reopencount = 0;
      newSubbug.statetransition = '';
      newSubbug.bsaestimate = subbug.fields.customfield_14229;
      newSubbug.bsaactuals = subbug.fields.customfield_14230;
      newSubbug.devestimate = subbug.fields.customfield_11400;
      newSubbug.devactuals = subbug.fields.customfield_14100;
      newSubbug.qaestimate = subbug.fields.customfield_14226;
      newSubbug.qaactuals = subbug.fields.customfield_14227;
      this.subbugs.push(newSubbug);
    }
    
  }

  pushSubbugs(){
    let newStories:Story[]=[];
    for(let story of this.stories){
      for(let subbug of this.subbugs){
        if(story.key == subbug.parent){
          story.storysubbugs.push(subbug);
          if(subbug.status != 'Done' && subbug.status != 'Closed' ){
            story.storyactivesubbugcount++;
          }
        }
      }
      story.issubbugloaded=true;
      newStories.push(story);
    }
    this.dataSource = new MatTableDataSource(newStories);      
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.ready=true;
    this.loadChangelogs();
  }

  openBottomSheet(parentKey:string): void {
   // console.log(this.subbugs.filter(e => e.parent == parentKey));
    this.bottomSheet.open(SubbugComponent, {
      data:{subbugs:{data:this.subbugs.filter(e => e.parent == parentKey), parentKey:parentKey}}
    });
  }

  openReportBottomSheet(): void {
     this.bottomSheet.open(ReportComponent, {
       data:{bsaefforts:this.bsaefforts, devefforts:this.devefforts, qaefforts:this.qaefforts}
     });
   }

  loadChangelogs(){
    for(let story of this.stories){
      this.allKeys.push(story.key);
    }
    for(let subbug of this.subbugs){
      this.allKeys.push(subbug.key)
    }
    for(let key of this.allKeys){
      this.changelogReqCount++;
      this._subbugService.getChangelogWithOffset(key,0).subscribe((res)=>{
        this.changelogReqCount--;
        this.parseChangelogRes(res);
      },
      (err)=>{
        this.errorCount++;
      });
    }
  }

  parseChangelogRes(res){
    //console.log(res);
    let rawChangelogs = res.values;
    this.handleMoreChangeLogs(res);
    for(let value of rawChangelogs){
      let rawItems = value.items;
      for(let item of rawItems){
        if(item.field=="status"){
          let newChangelog = new Changelog();
          newChangelog.key = this.getKeyFromUrl(res.self);
          newChangelog.author = value.author.displayName;
          newChangelog.created = new Date(value.created);
          newChangelog.field = item.field;
          newChangelog.fromString = item.fromString;
          newChangelog.toString = item.toString;
          this.changelogs.push(newChangelog);
        }
        else if(item.field=="Dev Actuals (Hrs)"){
          let newChangelog = new Changelog();
          newChangelog.key = this.getKeyFromUrl(res.self);
          newChangelog.author = value.author.displayName;
          newChangelog.created = new Date(value.created);
          newChangelog.field = item.field;
          newChangelog.fromString = item.fromString;
          newChangelog.toString = item.toString;
          this.devactuallogs.push(newChangelog);
        }
        else if(item.field=="QA Actuals (Hrs)"){
          let newChangelog = new Changelog();
          newChangelog.key = this.getKeyFromUrl(res.self);
          newChangelog.author = value.author.displayName;
          newChangelog.created = new Date(value.created);
          newChangelog.field = item.field;
          newChangelog.fromString = item.fromString;
          newChangelog.toString = item.toString;
          this.qaactuallogs.push(newChangelog);
        }
        else if(item.field=="BSA Actuals (Hrs)"){
          let newChangelog = new Changelog();
          newChangelog.key = this.getKeyFromUrl(res.self);
          newChangelog.author = value.author.displayName;
          newChangelog.created = new Date(value.created);
          newChangelog.field = item.field;
          newChangelog.fromString = item.fromString;
          newChangelog.toString = item.toString;
          this.bsaactuallogs.push(newChangelog);
        }
      }
    }
    if(this.changelogReqCount==0){
    //  console.log(this.changelogs);
      this.pushChangeLogs();
    }
  }

  getKeyFromUrl(url:string){
    let start:number;
    let end:number;
    start = url.indexOf("issue/")+6;
    end = url.indexOf("/changelog");
    return url.substring(start,end);
  }

  handleMoreChangeLogs(res:any){
    if((res.startAt + res.maxResults) < res.total){      
      this.changelogReqCount++;
      this._subbugService.getChangelogWithOffset(this.getKeyFromUrl(res.self),(res.startAt + res.maxResults)).subscribe(
        (resnew)=>{
          this.changelogReqCount--;
          this.parseChangelogRes(resnew);          
        },
        (err)=>{
          this.errorCount++;
        });
    }else{
    }
  }
  pushChangeLogs(){
    let newStories:Story[]=[];    
    this.generateCl();    
    this.generatebsaactualsplit();
    this.generatedevactualsplit();
    this.generateqaactualsplit();
    this.generateeffortactualsplit();
    for(let story of this.stories){
      story.storysubbugs=[];
      for(let changelog of this.changelogs){
        if(story.key == changelog.key){
          story.changelogs.push(changelog);
        }
      }
      story.ischangelogsloaded=true;
      story.storyactivesubbugcount=0; 
      for(let subbug of this.subbugs){
        if(story.key == subbug.parent){
          subbug.changelogs=[];
          for(let changelog of this.changelogs){
            if(subbug.key == changelog.key){
              subbug.changelogs.push(changelog);
            }
          }   
          subbug.predevanatimeline = this.round(this._metricsService.getPreDevAnalysisTimeLine(subbug.changelogs),2);
          subbug.devanatimeline = this.round(this._metricsService.getDevAnalysisTimeLine(subbug.changelogs),2);    
          subbug.devtimeline = this.round(this._metricsService.getDevTimeLine(subbug.changelogs),2);
          subbug.qatimeline = this.round(this._metricsService.getQATimeLine(subbug.changelogs),2);
          subbug.devlag = this.round(this._metricsService.getDevLag(subbug.changelogs),2);
          subbug.qalag = this.round(this._metricsService.getQALag(subbug.changelogs),2);
          subbug.reopencount = this._metricsService.getReopenCount(subbug.changelogs);
          subbug.statetransition = this.getStateTransitionSummary(subbug.key);
          subbug.bsaactualssplit = this.getBSAActualsSplitSummary(subbug.key);
          subbug.devactualssplit = this.getDevActualsSplitSummary(subbug.key);
          subbug.qaactualssplit = this.getQAActualsSplitSummary(subbug.key);
          story.bsaactuals = ((story.bsaactuals || 0) + (subbug.bsaactuals || 0))==0? null:((story.bsaactuals || 0) + (subbug.bsaactuals || 0));
          story.devactuals = ((story.devactuals || 0) + (subbug.devactuals || 0))==0? null:((story.devactuals || 0) + (subbug.devactuals || 0));
          story.qaactuals = ((story.qaactuals || 0) + (subbug.qaactuals || 0))==0? null:((story.qaactuals || 0) + (subbug.qaactuals || 0));
          story.storysubbugs.push(subbug);
          if(subbug.status != 'Done' && subbug.status != 'Closed' ){
            story.storyactivesubbugcount++;
          }
        }
      }
      story.predevanatimeline = this.round(this._metricsService.getOverallPreDevAnalysisTimeLine(story),2);
      story.devanatimeline = this.round(this._metricsService.getOverallDevAnalysisTimeLine(story),2);    
      story.devtimeline = this.round(this._metricsService.getOverallDevTimeLine(story),2);
      story.qatimeline = this.round(this._metricsService.getQATimeLine(story.changelogs),2); //QA's story level time is already overall qa timeline
      story.devlag = this.round(this._metricsService.getOverallDevLag(story),2);
      story.qalag = this.round(this._metricsService.getOverallQALag(story),2);
      story.reopencount = this._metricsService.getOverallReopenCount(story);
      story.statetransition = this.getStateTransitionSummary(story.key);
      story.bsaactualssplit = this.getBSAActualsSplitSummary(story.key);
      story.devactualssplit = this.getDevActualsSplitSummary(story.key);
      story.qaactualssplit = this.getQAActualsSplitSummary(story.key);
      story.metricnoncompliancecount = this._metricsService.getStoryMetricNonComplianceCount(story);
      story.issubbugloaded=true;
      newStories.push(story);
    }
    this.dataSource = new MatTableDataSource(newStories);      
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.ready=true;
  }

  generateCl(){
    let key:string='';
    let stateTransition:string='';
    for(let allKey of this.allKeys){
      key = allKey;
      stateTransition = '';
      for(let changelog of this.changelogs){
        if(allKey == changelog.key){
          if(stateTransition.length>0){
            stateTransition = stateTransition + " ► " + changelog.toString;
          }else{
            stateTransition = changelog.fromString + " ► " + changelog.toString;
          }
        }
      }
      let cl = new Cl();
      cl.key=key;
      cl.stateTransition=stateTransition;
      this.cls.push(cl);
    }
  }
  
  getStateTransitionSummary(key:string){
    for(let cl of this.cls){
      if(cl.key==key){
        if(cl.stateTransition.length > 0)
        {
          return cl.stateTransition;
        }
        return 'No State Changes Observed';
      }
    }
    return 'No State Changes Observed';
  }

  saveToLocal(jql:string){
    //console.log(jql);
    let savedjql:string=localStorage.getItem('jql');
    if(savedjql !== jql)
    {
      localStorage.setItem('jql',jql);
      this.reset();
      this.kickstart();
    }
  }

generatebsaactualsplit(){
    let key:string='';
    let stateTransition:string='';
    for(let allKey of this.allKeys){
      key = allKey;
      stateTransition = '';      
      let bsamap = new Map();
      for(let changelog of this.bsaactuallogs){
        if(allKey == changelog.key){
          if(bsamap.has(changelog.author)){
            let oldHrs = bsamap.get(changelog.author);
            bsamap.set(changelog.author,(
                                          oldHrs + 
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                                        )
                      );
          } else {
            bsamap.set(changelog.author,
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                      );
          }
        }
      }
      for(let bsa of Array.from(bsamap.keys())){
        if(stateTransition.length>0){
          stateTransition = stateTransition + ' | ' + bsa + ' (' + bsamap.get(bsa) + 'Hrs)';
        } else {
          stateTransition = bsa + ' (' + bsamap.get(bsa) + 'Hrs)';
        }
      }
      //console.log(stateTransition);
      let cl = new Cl();
      cl.key=key;
      cl.stateTransition=stateTransition;
      this.bsaactualssplit.push(cl);
    }
  }

  getBSAActualsSplitSummary(key:string){
    for(let cl of this.bsaactualssplit){
      if(cl.key==key){
        if(cl.stateTransition.length > 0)
        {
          return cl.stateTransition;
        }
        return 'No BSA Effort';
      }
    }
    return 'No BSA Effort';
  }

  generatedevactualsplit(){
    let key:string='';
    let stateTransition:string='';
    for(let allKey of this.allKeys){
      key = allKey;
      stateTransition = '';      
      let devmap = new Map();
      for(let changelog of this.devactuallogs){
        if(allKey == changelog.key){
          if(devmap.has(changelog.author)){
            let oldHrs = devmap.get(changelog.author);
            devmap.set(changelog.author,(
                                          oldHrs + 
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                                        )
                      );
          } else {
            devmap.set(changelog.author,
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                      );
          }
        }
      }
      for(let dev of Array.from(devmap.keys())){
        if(stateTransition.length>0){
          stateTransition = stateTransition + ' | ' + dev + ' (' + devmap.get(dev) + 'Hrs)';
        } else {
          stateTransition = dev + ' (' + devmap.get(dev) + 'Hrs)';
        }
      }
      //console.log(stateTransition);
      let cl = new Cl();
      cl.key=key;
      cl.stateTransition=stateTransition;
      this.devactualssplit.push(cl);
    }
  }

  getDevActualsSplitSummary(key:string){
    for(let cl of this.devactualssplit){
      if(cl.key==key){
        if(cl.stateTransition.length > 0)
        {
          return cl.stateTransition;
        }
        return 'No Dev Effort';
      }
    }
    return 'No Dev Effort';
  }

  generateqaactualsplit(){
    let key:string='';
    let stateTransition:string='';
    for(let allKey of this.allKeys){
      key = allKey;
      stateTransition = '';      
      let qamap = new Map();
      for(let changelog of this.qaactuallogs){
        if(allKey == changelog.key){
          if(qamap.has(changelog.author)){
            let oldHrs = qamap.get(changelog.author);
            qamap.set(changelog.author,(
                                          oldHrs + 
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                                        )
                      );
          } else {
            qamap.set(changelog.author,
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                      );
          }
        }
      }
      for(let qa of Array.from(qamap.keys())){
        if(stateTransition.length>0){
          stateTransition = stateTransition + ' | ' + qa + ' (' + qamap.get(qa) + 'Hrs)';
        } else {
          stateTransition = qa + ' (' + qamap.get(qa) + 'Hrs)';
        }
      }
      let cl = new Cl();
      cl.key=key;
      cl.stateTransition=stateTransition;
      this.qaactualssplit.push(cl);
    }
  }

  getQAActualsSplitSummary(key:string){
    for(let cl of this.qaactualssplit){
      if(cl.key==key){
        if(cl.stateTransition.length > 0)
        {
          return cl.stateTransition;
        }
        return 'No QA Effort';
      }
    }
    return 'No QA Effort';
  }

  generateeffortactualsplit(){      
      let bsamap = new Map();
      for(let changelog of this.bsaactuallogs){
          if(bsamap.has(changelog.author)){
            let oldHrs = bsamap.get(changelog.author);
            bsamap.set(changelog.author,(
                                          oldHrs + 
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                                        )
                      );
          } else {
            bsamap.set(changelog.author,
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                      );
          }
      }
      let devmap = new Map();
      for(let changelog of this.devactuallogs){
          if(devmap.has(changelog.author)){
            let oldHrs = devmap.get(changelog.author);
            devmap.set(changelog.author,(
                                          oldHrs + 
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                                        )
                      );
          } else {
            devmap.set(changelog.author,
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                      );
          }
      }
      let qamap = new Map();
      for(let changelog of this.qaactuallogs){
          if(qamap.has(changelog.author)){
            let oldHrs = qamap.get(changelog.author);
            qamap.set(changelog.author,(
                                          oldHrs + 
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                                        )
                      );
          } else {
            qamap.set(changelog.author,
                                          (
                                              parseFloat(changelog.toString) - 
                                              (parseFloat(changelog.fromString) || 0)
                                          ) 
                      );
          }
      }

      for(let bsaName of Array.from(bsamap.keys())){
        var bsaEffort = new Effort();
        bsaEffort.name = bsaName;
        bsaEffort.effort = this.round(bsamap.get(bsaName),2);
        this.bsaefforts.push(bsaEffort);
      }
      for(let devName of Array.from(devmap.keys())){
        var devEffort = new Effort();
        devEffort.name = devName;
        devEffort.effort = this.round(devmap.get(devName),2);
        this.devefforts.push(devEffort);
      }
      for(let qaName of Array.from(qamap.keys())){
        var qaEffort = new Effort();
        qaEffort.name = qaName;
        qaEffort.effort = this.round(qamap.get(qaName),2);
        this.qaefforts.push(qaEffort);
      }
      this.contentloaded=true;
    }

    exportToCSV(){
      let data:any[]=[];
      for(let story of this.stories){
        let newStory:any;
        newStory = new Story();
        newStory.key = story.key;
        newStory.summary = story.summary;
        newStory.status = story.status;
        newStory.assignee = story.assignee;
        newStory.created = story.created;
        newStory.resolutiondate = story.resolutiondate;
        newStory.age = story.age;        
        newStory.totalSubbugs = story.storyactivesubbugcount;
        newStory.activeSubbugs = story.storysubbugs.length;
        newStory.reopencount = story.reopencount;
        newStory.predevanatimeline = story.predevanatimeline;
        newStory.devlag = story.devlag;
        newStory.devanatimeline = story.devanatimeline;
        newStory.devtimeline = story.devtimeline;
        newStory.qalag = story.qalag;    
        newStory.qatimeline = story.qatimeline;
        newStory.statetransition = story.statetransition;
        newStory.bsaestimate = story.bsaestimate;
        newStory.bsaactuals = story.bsaactuals;
        newStory.devestimate = story.devestimate;
        newStory.devactuals = story.devactuals;
        newStory.qaestimate = story.qaestimate;
        newStory.qaactuals = story.qaactuals;
        newStory.bsaactualssplit = story.bsaactualssplit;
        newStory.devactualssplit = story.devactualssplit;
        newStory.qaactualssplit = story.qaactualssplit;
        newStory.metricnoncompliancecount = story.metricnoncompliancecount;
        data.push(newStory);
      }
      this._exportService.exportToCSV(data);
    }
}
