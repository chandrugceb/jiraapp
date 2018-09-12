import { Subbug } from "./subbug";

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
}