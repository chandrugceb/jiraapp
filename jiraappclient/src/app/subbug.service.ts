import { Injectable } from '@angular/core';
import{HttpClient, HttpResponse, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SubbugService {
  private baseUrl:string;
  private authheaders = new HttpHeaders({'Content-Type':'application/json',
                                        'Accept':'application/json',
                                        'X-Atlassian-Token':'no-check'});

  constructor(private _http:HttpClient) { 
    this.baseUrl='http://' + window.location.hostname+':8080/api/issue/';
  }

  getChangelogWithOffset(key:string,offset:number){
    return this._http.get(this.baseUrl+key+"?maxResults=100&startAt="+offset,{headers:this.authheaders});
  }
}
