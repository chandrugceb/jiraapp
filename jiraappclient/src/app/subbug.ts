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
    devtimeline:number;    
    qatimeline:number;
}