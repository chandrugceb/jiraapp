import { Injectable } from '@angular/core';
import{HttpClient, HttpResponse, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private baseUrl:string;
  private authheaders = new HttpHeaders({'Content-Type':'application/json',
                                        'Accept':'application/json',
                                        'X-Atlassian-Token':'no-check'});

  constructor(private _http:HttpClient) { 
    this.baseUrl='http://' + window.location.hostname+':8080/api/search';
  }

  getStory(){
    return this._http.post(this.baseUrl,this.getRequestBodyWithOffset(0),{headers:this.authheaders});
  }

  getStoryWithOffset(startAt:Number){
    return this._http.post(this.baseUrl,this.getRequestBodyWithOffset(startAt),{headers:this.authheaders});
  }

  getRequestBodyWithOffset(startAt:Number){
    return {
      "jql": localStorage.getItem('jql'),
      "startAt": startAt,
      "maxResults": 100,      
      "fields": [
        "summary",
        "status",
        "assignee",
        "created",
        "resolutiondate",
        "customfield_14229",
        "customfield_14230", 
        "customfield_11400", 
        "customfield_14100", 
        "customfield_14226", 
        "customfield_14227"],
      "fieldsByKeys": false
    };
  }

  getSubbugForStory(storyKey:string){
    return this._http.post(this.baseUrl,this.getSubbugRequestBodyWithStory(storyKey),{headers:this.authheaders});
  }

  getSubbugRequestBodyWithStory(storyKey:string){
    return {
      "jql": "project = air AND type = sub-bug and parent = " + storyKey,
      "startAt": 0,
      "maxResults": 100,      
      "fields": [
        "summary",
        "status",
        "assignee",
        "created",
        "parent",
        "resolutiondate", 
        "customfield_11400", 
        "customfield_14100", 
        "customfield_14226", 
        "customfield_14227"],
      "fieldsByKeys": false
    };
  }

}
