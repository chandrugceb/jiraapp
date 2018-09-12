import { Injectable } from '@angular/core';
import { Changelog } from './changelog';

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
    }
    return DevTimeLine;
  }

  private getDateDiffInDays(startDate:Date,endDate:Date, changelog:any){
    console.log(startDate,endDate,changelog);
    return this.round(((endDate.valueOf()-startDate.valueOf())/1000/60/60/24),2);
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
    }
    return QATimeLine;
  }
}
