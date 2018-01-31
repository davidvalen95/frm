import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {VisitationApplicationParam} from "../../pages/application/visitation-application/visitation-application";
import {BaseForm} from "../../components/Forms/base-form";
import {ReplaySubject} from "rxjs/ReplaySubject";

/*
  Generated class for the RootParamsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RootParamsProvider {


  /*
      - set partial to true
      - set correct version
      - set url to live
      - copy index html
      - sencha set global live ip
      - sencha app build
      - sencha app build native
      - cordova build android --release
   */

  public  isPartial:boolean = false;
  public  version:string = "1.5.23";
  public  isLive:boolean = false;



  public visitationApplicationParam?: VisitationApplicationParam = {isProvider:true} ;
  public broadcast:ReplaySubject<BroadcastType> = new ReplaySubject(-1);

  constructor(public http: HttpClient) {
    console.log('Hello RootParamsProvider Provider');
    if(this.isPartial){
      console.log('version',this.version)
    }

    this.broadcast.subscribe((data:BroadcastType)=>{
      console.log("theBroadcast",data);
    })
  }
 ////

}


interface PageForm {
  title: string,
  isOpen: boolean,
  baseForms: BaseForm[]
  isHidden: boolean
}

export enum BroadcastType{
  visitationPageOnResume
}

