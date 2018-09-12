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
        MatBottomSheetRef} from '@angular/material';

import {Story} from './story';
import {Subbug} from './subbug';
import { SubbugComponent } from './subbug/subbug.component';
import { SubbugService } from './subbug.service';
import { Changelog } from './changelog';
import {Cl} from './cl';
import { MetricsService } from './metrics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{ 
  storyReqCount:number=0;
  changelogReqCount:number=0; 
  isStoryLoaded:boolean=false;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  title = 'app';
  dataSource;
  private ready:boolean=false;
  private stories:Story[]=[]; 
  private subbugs:Subbug[]=[];
  private cls:Cl[]=[];
  private subbugchangelogs:Changelog[]=[];
  private rawStories:any;
  displayedColumns: string[] = ['key', 'summary', 'status', 'assignee', 'created', 'resolutiondate', 'age','storysubbugs'];
  pageSizeOptions: number[] = [5, 10, 25, 100];

  // MatPaginator Inputs
  length = 100;
  pageSize = 10;

  // MatPaginator Output
  pageEvent: PageEvent;

  constructor(private bottomSheet: MatBottomSheet, 
              private _storyService:StoryService, 
              private _subbugService:SubbugService,
              private _metricsService:MetricsService) { 
    this._storyService.getStory().subscribe(
      (res)=>{
        console.log(res);
        this.parseStoriesRes(res);
      },
      (err)=>{});
  }

  ngOnInit() { 
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
      newStory.storyactivesubbugcount=0;
      //console.log((new Date()).valueOf());
      this.stories.push(newStory);
    }
    this.dataSource = new MatTableDataSource(this.stories);      
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.ready=true;
  }

  round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }
  applyFilter(filterValue: string) {
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
        (err)=>{});
    }else{
      this.isStoryLoaded=true;
      this.loadSubbugsForStories();
    }

  }
  getRecord(row:any){
    console.log(row);
  }

  loadSubbugsForStories(){
    for(let Story of this.stories){
      this.storyReqCount++;
      this._storyService.getSubbugForStory(Story.key).subscribe((res)=>{
        this.parseSubbugRes(res);
        this.storyReqCount--;
        if(this.storyReqCount==0){
          console.log(this.subbugs);
          this.pushSubbugs();
        }
      },
      (err)=>{});
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
      newSubbug.devtimeline = 0;
      newSubbug.qatimeline = 0;
      newSubbug.changelogs = [];
      this.subbugs.push(newSubbug);
    }
    
  }

  pushSubbugs(){
    let newStories:Story[]=[];
    for(let story of this.stories){
      for(let subbug of this.subbugs){
        if(story.key == subbug.parent){
          story.storysubbugs.push(subbug);
          if(subbug.status != 'Done'){
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
    this.loadChangelogsForSubbugs();
  }

  openBottomSheet(parentKey:string): void {
    console.log(this.subbugs.filter(e => e.parent == parentKey));
    this.bottomSheet.open(SubbugComponent, {
      data:{subbugs:{data:this.subbugs.filter(e => e.parent == parentKey), parentKey:parentKey}}
    });
  }

  loadChangelogsForSubbugs(){
    for(let subbug of this.subbugs){
      this.changelogReqCount++;
      this._subbugService.getChangelogWithOffset(subbug.key,0).subscribe((res)=>{
        this.changelogReqCount--;
        this.parseSubbugChangelogRes(res);
      },
      (err)=>{});
    }
  }

  parseSubbugChangelogRes(res){
    let rawChangelogs = res.values;
    this.handleMoreChangeLogs(res);
    for(let value of rawChangelogs){
      let rawItems = value.items;
      for(let item of rawItems){
        if(item.field=="status"){
          let newChangelog = new Changelog();
          newChangelog.key = this.getKeyFromUrl(res.self);
          newChangelog.created = new Date(value.created);
          newChangelog.field = item.field;
          newChangelog.fromString = item.fromString;
          newChangelog.toString = item.toString;
          this.subbugchangelogs.push(newChangelog);
        }
      }
    }
    if(this.changelogReqCount==0){
      console.log(this.subbugchangelogs);
      this.pushSubbugChangeLogs();
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
          this.parseSubbugChangelogRes(resnew);          
        },
        (err)=>{});
    }else{
    }
  }
  pushSubbugChangeLogs(){
    let newStories:Story[]=[];
    for(let story of this.stories){
      story.storysubbugs=[];
      for(let subbug of this.subbugs){
        if(story.key == subbug.parent){
          subbug.changelogs=[];
          for(let changelog of this.subbugchangelogs){
            if(subbug.key == changelog.key){
              subbug.changelogs.push(changelog);
            }
          }          
          subbug.devtimeline = this._metricsService.getDevTimeLine(subbug.changelogs);
          subbug.qatimeline = this._metricsService.getQATimeLine(subbug.changelogs);
          story.storysubbugs.push(subbug);
          if(subbug.status != 'Done'){
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
    this.generateCl();
  }

  generateCl(){
    let key:string='';
    let stateTransition:string='';
    for(let subbug of this.subbugs){
      key = subbug.key;
      stateTransition = '';
      for(let changelog of this.subbugchangelogs){
        if(subbug.key == changelog.key){
          if(stateTransition.length>0){
            stateTransition = stateTransition + " -> " + changelog.toString;
          }else{
            stateTransition = changelog.fromString + " -> " + changelog.toString;
          }
        }
      }
      let cl = new Cl();
      cl.key=key;
      cl.stateTransition=stateTransition;
      this.cls.push(cl);
    }
    
    console.log(this.cls);
  }

}
