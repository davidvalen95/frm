import { HttpClient } from '@angular/common/http';
import {Injectable, ViewChild} from '@angular/core';
import {VisitationApplicationParam} from "../../pages/application/visitation-application/visitation-application";
import {BaseForm} from "../../components/Forms/base-form";
import {Slides} from "ionic-angular";
import {NgForm} from "@angular/forms";

/*
  Generated class for the RootParamsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RootParamsProvider {
  public isPartial:boolean = false;
  public version:string = "1.4.071";
  public visitationApplicationParam?: VisitationApplicationParam = {isProvider:true} ;


  constructor(public http: HttpClient) {
    console.log('Hello RootParamsProvider Provider');
    if(this.isPartial){
      console.log('version',this.version)
    }
  }
 //

}


interface PageForm {
  title: string,
  isOpen: boolean,
  baseForms: BaseForm[]
  isHidden: boolean
}

