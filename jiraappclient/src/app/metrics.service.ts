import { Injectable } from '@angular/core';
import { Changelog } from './changelog';
import { Story } from './story';
import { Subbug } from './subbug';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  constructor() { }

  getDevTimeLine(changelogs:Changelog[]){
    let DevStartOn:Date;
    let DevCompOn:Date;
    let DevToQAOn:Date;
    let DevPauseOn:Date;
    let DevTimeLine:number=0;
    let DevStartCount:number=0;
    let DevCompCount:number=0;
    let DevPauseCount:number=0;
    let lastStatus:string='';
    for(let changelog of changelogs){
      if(changelog.fromString=='Ready for Dev'){
        if(changelog.toString=='In Dev'){
          DevStartOn=changelog.created;
          DevStartCount++;
        } else if(changelog.toString=='Ready for QA'){
          DevStartOn=changelog.created;
          DevCompOn=changelog.created;
          DevToQAOn=changelog.created;
          DevStartCount++;
          DevCompCount++;
          DevTimeLine = DevTimeLine + this.getDateDiffInDays(DevStartOn,DevCompOn,changelog);
        }
      }
      else if(changelog.fromString=='In Dev'){
        if(changelog.toString=='Ready for Dev'){
          DevPauseOn=changelog.created;
          DevPauseCount++;
          DevTimeLine = DevTimeLine + this.getDateDiffInDays(DevStartOn,DevPauseOn,changelog);
        }
        else if(changelog.toString=='Dev Complete'){
          DevCompOn=changelog.created;
          DevCompCount++;
          DevTimeLine = DevTimeLine + this.getDateDiffInDays(DevStartOn,DevCompOn,changelog);
        } 
        else if(changelog.toString=='Ready for QA'){
          DevCompOn=changelog.created;
          DevToQAOn=changelog.created;
          DevCompCount++;
          DevTimeLine = DevTimeLine + this.getDateDiffInDays(DevStartOn,DevToQAOn,changelog);
        }
      }
      else if(changelog.fromString=='Dev Complete'){
        if(changelog.toString=='Ready for QA'){
          DevToQAOn=changelog.created;
          DevTimeLine = DevTimeLine + this.getDateDiffInDays(DevCompOn,DevToQAOn,changelog);
        }
      }
      lastStatus = changelog.toString;
    }
    if(lastStatus =='In Dev')
    DevTimeLine = DevTimeLine+this.getDateDiffInDays(DevStartOn,(new Date()),null);
    return DevTimeLine;
  }

  private getDateDiffInDays(startDate:Date,endDate:Date, changelog:any){
    //console.log(startDate,endDate,changelog); 
    return this.round(((endDate.valueOf()-startDate.valueOf())/1000/60/60/24), 2);
  }

  private round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  getQATimeLine(changelogs:Changelog[]){
    let QAStartOn:Date;
    let QACompOn:Date;
    let QAReOpenOn:Date;
    let QAPauseOn:Date;
    let QATimeLine:number=0;
    let QAStartCount:number=0;
    let QACompCount:number=0;
    let QAPauseCount:number=0;    
    let QAReOpenCount:number=0;
    let lastStatus:string='';
    for(let changelog of changelogs){
      if(changelog.fromString=='Ready for QA'){
        if(changelog.toString=='In QA'){
          QAStartOn=changelog.created;
          QAStartCount++;
        } 
      }
      else if(changelog.fromString=='In QA'){
        if(changelog.toString=='Passed'){
          QACompOn=changelog.created;
          QACompCount++;
          QATimeLine=QATimeLine+this.getDateDiffInDays(QAStartOn,QACompOn,changelog);
        }else if(changelog.toString=='Ready for Dev'){
          QAReOpenOn=changelog.created;
          QAReOpenCount++;
          QATimeLine=QATimeLine+this.getDateDiffInDays(QAStartOn,QAReOpenOn,changelog);          
        }else if(changelog.toString=='Ready for QA'){
          QAPauseOn=changelog.created;
          QAPauseCount++;
          QATimeLine=QATimeLine+this.getDateDiffInDays(QAStartOn,QAPauseOn,changelog);
        }
      }
      lastStatus = changelog.toString;
    }
    if(lastStatus=='In QA')
          QATimeLine=QATimeLine+this.getDateDiffInDays(QAStartOn,(new Date()),null);
    return QATimeLine;
  }

  getQALag(changelogs:Changelog[]){
    let QAAssignOn:Date;
    let QAActOn:Date;
    let QAAssignCount:number=0;
    let QAActCount:number=0;
    let QALag:number=0;
    let lastStatus:string='';
    for(let changelog of changelogs){
      if(changelog.toString=='Ready for QA'){
        QAAssignOn=changelog.created;
        QAAssignCount++;
      }else if(changelog.fromString=='Ready for QA'){
          QAActOn=changelog.created;
          QAActCount++;
          QALag=QALag+this.getDateDiffInDays(QAAssignOn,QAActOn,changelog);
      }
      lastStatus = changelog.toString;      
    }
    if(lastStatus =='Ready for QA')
        QALag = QALag+this.getDateDiffInDays(QAAssignOn,(new Date()),null);
    return QALag;
  }

  getDevLag(changelogs:Changelog[]){
    let DevAssignOn:Date;
    let DevActOn:Date;
    let DevAssignCount:number=0;
    let DevActCount:number=0;
    let DevLag:number=0;
    let lastStatus:string='';
    for(let changelog of changelogs){
      if(changelog.toString=='Ready for Dev'){
        DevAssignOn=changelog.created;
        DevAssignCount++;
      }else if(changelog.fromString=='Ready for Dev'){
          DevActOn=changelog.created;
          DevActCount++;
          DevLag=DevLag+this.getDateDiffInDays(DevAssignOn,DevActOn,changelog);
      }      
      lastStatus = changelog.toString;      
    }
    if(lastStatus =='Ready for Dev')
        DevLag = DevLag+this.getDateDiffInDays(DevAssignOn,(new Date()),null);
    return DevLag;
  }

  getPreDevAnalysisTimeLine(changelogs:Changelog[]){
    let DevAnaStartOn:Date;
    let PreDevAnaStartOn:Date;
    let AnaCompOn:Date;
    let DevAnaStartCount:number=0;    
    let PreDevAnaStartCount:number=0;
    let AnaCompCount:number=0;
    let PreDevAnalysisTimeLine:number=0;
    let lastStatus:string='';
    for(let changelog of changelogs){
      if(changelog.fromString=='Ready for Dev'){
        if(changelog.toString=='In Analysis'){
          DevAnaStartOn=changelog.created;
          DevAnaStartCount++;
        }
      }else if(changelog.fromString=='Backlog'){
        if(changelog.toString=='In Analysis'){
          PreDevAnaStartOn=changelog.created;
          PreDevAnaStartCount++;
        }
      }else if(changelog.fromString=='In Analysis'){
          AnaCompOn=changelog.created;
          AnaCompCount++;
          if(PreDevAnaStartCount>DevAnaStartCount){
            PreDevAnalysisTimeLine=PreDevAnalysisTimeLine+this.getDateDiffInDays(PreDevAnaStartOn,AnaCompOn,changelog);
          }
      }
      lastStatus = changelog.toString;    
    }
    if(lastStatus =='In Analysis' && PreDevAnaStartCount>DevAnaStartCount)
        PreDevAnalysisTimeLine = PreDevAnalysisTimeLine+this.getDateDiffInDays(PreDevAnaStartOn,(new Date()),null);
    return PreDevAnalysisTimeLine;
  }

  getDevAnalysisTimeLine(changelogs:Changelog[]){
    let DevAnaStartOn:Date;
    let PreDevAnaStartOn:Date;
    let AnaCompOn:Date;
    let DevAnaStartCount:number=0;    
    let PreDevAnaStartCount:number=0;
    let AnaCompCount:number=0;
    let DevAnalysisTimeLine:number=0;
    let lastStatus:string='';
    for(let changelog of changelogs){
      if(changelog.fromString=='Ready for Dev'){
        if(changelog.toString=='In Analysis'){
          DevAnaStartOn=changelog.created;
          DevAnaStartCount++;
        }
      }else if(changelog.fromString=='Backlog'){
        if(changelog.toString=='In Analysis'){
          PreDevAnaStartOn=changelog.created;
          PreDevAnaStartCount++;
        }
      }else if(changelog.fromString=='In Analysis'){
          AnaCompOn=changelog.created;
          AnaCompCount++;
          if(PreDevAnaStartCount<DevAnaStartCount){
            DevAnalysisTimeLine=DevAnalysisTimeLine+this.getDateDiffInDays(DevAnaStartOn,AnaCompOn,changelog);
          }
      }    
      lastStatus = changelog.toString;    
    }
    if(lastStatus =='In Analysis' && PreDevAnaStartCount<DevAnaStartCount)
        DevAnalysisTimeLine = DevAnalysisTimeLine+this.getDateDiffInDays(DevAnaStartOn,(new Date()),null);
    return DevAnalysisTimeLine;
  }

  getReopenCount(changelogs:Changelog[]){ 
    let ReOpenCount:number=0;
    for(let changelog of changelogs){
      if(changelog.fromString=='In QA'){
        if(changelog.toString=='Ready for Dev'){
          ReOpenCount++;        
        }
      }
    }
    return ReOpenCount;
  }

  getOverallPreDevAnalysisTimeLine(story:Story){
    let storyPreDevAnalysisTimeLine:number=0;
    let subbugsPreDevAnalysisTimeLine:number=0;
    for(let subbug of story.storysubbugs){
      subbugsPreDevAnalysisTimeLine = subbugsPreDevAnalysisTimeLine + subbug.predevanatimeline;
    }
    storyPreDevAnalysisTimeLine = this.getPreDevAnalysisTimeLine(story.changelogs);
    return storyPreDevAnalysisTimeLine + subbugsPreDevAnalysisTimeLine;
  }

  getOverallDevAnalysisTimeLine(story:Story){
    let storyDevAnalysisTimeLine:number=0;
    let subbugsDevAnalysisTimeLine:number=0;
    for(let subbug of story.storysubbugs){
      subbugsDevAnalysisTimeLine = subbugsDevAnalysisTimeLine + subbug.devanatimeline;
    }
    storyDevAnalysisTimeLine = this.getDevAnalysisTimeLine(story.changelogs);
    return storyDevAnalysisTimeLine + subbugsDevAnalysisTimeLine;
  }
  
  getOverallDevTimeLine(story:Story){
    let storyDevTimeLine:number=0;
    let subbugsDevTimeLine:number=0;
    for(let subbug of story.storysubbugs){
      subbugsDevTimeLine = subbugsDevTimeLine + subbug.devtimeline;
    }
    storyDevTimeLine = this.getDevTimeLine(story.changelogs);
    return storyDevTimeLine + subbugsDevTimeLine;
  }
  
  getOverallDevLag(story:Story){
    let storyDevLag:number=0;
    let subbugsDevLag:number=0;
    for(let subbug of story.storysubbugs){
      subbugsDevLag = subbugsDevLag + subbug.devlag;
    }
    storyDevLag = this.getDevLag(story.changelogs);
    return storyDevLag + subbugsDevLag;
  }

  getOverallQALag(story:Story){
    let storyQALag:number=0;
    let subbugsQALag:number=0;
    for(let subbug of story.storysubbugs){
      subbugsQALag = subbugsQALag + subbug.qalag;
    }
    storyQALag = this.getQALag(story.changelogs);
    return storyQALag + subbugsQALag;
  }

  getOverallReopenCount(story:Story){ 
    let StoryReOpenCount:number=0;
    let subbugsReOpenCount:number=0;
    for(let subbug of story.storysubbugs){
        subbugsReOpenCount = subbugsReOpenCount + subbug.reopencount;
      }
    StoryReOpenCount = this.getReopenCount(story.changelogs);
    return StoryReOpenCount + subbugsReOpenCount;
  }

  hasDevDone(changelogs:Changelog[]){
    let hasDevDone:boolean=false;
    for(let changelog of changelogs){
      if((changelog.toString == 'Dev Complete') || (changelog.toString == 'Ready for QA')){
        hasDevDone = true;
      }
    }
    return hasDevDone;
  }

  hasQADone(changelogs:Changelog[]){
    let hasQADone:boolean=false;
    for(let changelog of changelogs){
      if(changelog.fromString == 'In QA'){
        hasQADone = true;
      }
    }
    return hasQADone;
  }

  isTicketMetricCompliant(ticket:any){
    let hasDevDone:boolean=this.hasDevDone(ticket.changelogs);    
    let hasQADone:boolean=this.hasQADone(ticket.changelogs);
    let isSubbugMetricComplaint:boolean=true;
    if(ticket.devactuals == null || ticket.devactuals == 0){
      if(hasDevDone){
        isSubbugMetricComplaint=false;
      }
    }

    if(ticket.qaactuals == null || ticket.qaactuals == 0){
      if(hasQADone){
        isSubbugMetricComplaint=false;
      }
    }
    return isSubbugMetricComplaint;
  }

  getStoryMetricNonComplianceCount(story:Story){
    let NonComplianceCount:number=0;
    if(!this.isTicketMetricCompliant(story)){
      NonComplianceCount++;
    }
    for(let subbug of story.storysubbugs){
      if(!this.isTicketMetricCompliant(subbug)){
        NonComplianceCount++;
      }
    }
    return NonComplianceCount;
  }
}
