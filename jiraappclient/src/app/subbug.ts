import { Changelog } from "./changelog";

export class Subbug {
    key:string;
    summary:string;    
    status:string;
    assignee:string;
    created:Date;
    resolutiondate:Date;
    age:number;
    parent:string;
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