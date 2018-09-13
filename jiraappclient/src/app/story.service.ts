import { Injectable } from '@angular/core';
import{HttpClient, HttpResponse, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private reqbody:any;
  private baseUrl:string;
  private authheaders = new HttpHeaders({'Content-Type':'application/json',
                                        'Accept':'application/json',
                                        'X-Atlassian-Token':'no-check'});

  constructor(private _http:HttpClient) { 
    this.baseUrl='http://' + window.location.hostname+':8080/api/search';
    this.reqbody = this.getRequestBodyWithOffset(0);
  }

  getStory(){
    return this._http.post(this.baseUrl,this.reqbody,{headers:this.authheaders});
  }

  getStoryWithOffset(startAt:Number){
    return this._http.post(this.baseUrl,this.getRequestBodyWithOffset(startAt),{headers:this.authheaders});
  }

  getRequestBodyWithOffset(startAt:Number){
    return {
      "jql": "project = air AND type = story and labels in (B2B)",
      "startAt": startAt,
      "maxResults": 100,      
      "fields": [
        "summary",
        "status",
        "assignee",
        "created",
        "resolutiondate"],
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
        "resolutiondate"],
      "fieldsByKeys": false
    };
  }

}
