import { Subbug } from "./subbug";
import {Changelog} from "./changelog";

export class Story {
    key:string;
    summary:string;    
    status:string;
    assignee:string;
    created:Date;
    resolutiondate:Date;
    age:number;
    storysubbugs:Subbug[];
    storyactivesubbugcount:number;
    issubbugloaded:boolean;
    ischangelogsloaded:boolean;
    changelogs:Changelog[];
    predevanatimeline:number;
    devlag:number;
    devanatimeline:number;
    devtimeline:number;
    qalag:number;    
    qatimeline:number;
    reopencount:number;
    statetransition:string;
    devestimate:number;
    devactuals:number;
    qaestimate:number;
    qaactuals:number;
}