import {EventEmitter, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {ApiProvider} from "../../providers/api/api";
import {NgModel} from "@angular/forms";
import {ReplaySubject} from "rxjs/ReplaySubject";

@Injectable()
export class BaseForm {
  public labelType: LabelType = LabelType.stacked;
  public inputType: InputType = InputType.text;

  public placeholder: string                    = "";
  public selectOptions: KeyValue[]              = [];
  public rules: InputRules                      = {required: true, min: 0};
  public isHidden: boolean                      = false;
  public styling: InputStyle                    = {};
  public value: string                          = "";
  public isReadOnly: boolean                    = false;
  public dateSetting: DateSetting               = {min: "1900-01-01", max: BaseForm.getCurrentDate()};
  public changeListener: ReplaySubject<NgModel> = new ReplaySubject(5);
  public searchBarSetting?: SearchBarSetting    = null;
  constructor(public label: string,
              public name?: string,) {


    // var promise: Promise<any> = Promise.resolve("tes");
    this.changeListener.subscribe((model: NgModel) => {
      if (this.inputType == InputType.number && this.rules.max) {
        if ((model.value as number) > this.rules.max) {
          // model.
        }

        var test;
      }
      //
      // if(this.inputType == InputType.select){
      //   this.value = model.value;
      // }

    })


  }


  public setInputTypeDate(dateSetting: DateSetting) {
    this.inputType = InputType.date;
    // Return today's date and time

    dateSetting.hourValues = "";
    if (dateSetting.min == null)
      dateSetting.min = "1900-01-01";

    if (dateSetting.max == null)
      dateSetting.max = BaseForm.getCurrentDate();

    if(dateSetting.displayFormat == null){
      dateSetting.displayFormat = "DD MMM YYYY";
    }

    if(dateSetting.min instanceof  Date){
      dateSetting.min = (<Date>dateSetting.min).toISOString()
    }
    if(dateSetting.max instanceof  Date){
      dateSetting.max = (<Date>dateSetting.max).toISOString()
    }

    this.dateSetting = dateSetting;
    console.log(`setting ${this.name}`, this.dateSetting)


  }

  public setInputTypeTime(){
    var dateSetting:DateSetting = {};
    dateSetting.displayFormat = "HH:mm";
    this.inputType = InputType.date;
    dateSetting.min = '00:00';
    dateSetting.max = "23:59";
    dateSetting.hourValues = "";
    var prefix = "";

    for(var i=0;i<24;i++){
      dateSetting.hourValues += prefix;
      dateSetting.hourValues += (""+'0'+i).slice(-2);

      prefix = ",";
    }

    console.log('timesetting',dateSetting);
    this.dateSetting = dateSetting;

  }

  public setInputTypeSelect(options: KeyValue[]) {
    this.inputType     = InputType.select;
    this.selectOptions = options;

    var text:string = "sdoifjiojdf";

  }

  public setInputTypeSelectChain(observable: Observable<any>, processData: (data: object[]) => KeyValue[]) {
    this.inputType = InputType.select;

    observable.subscribe((data: object[]) => {
      this.selectOptions = processData(data)
      console.log('selectOptions', this.selectOptions)
    })


  }

  public setInputTypeSearchBar(url: string, httpParams: HttpParams, paramBindEvent: string[], processData: (serverResponse: any) => KeyValue[]) {
    this.inputType        = InputType.searchBar;
    this.isReadOnly       = true
    this.searchBarSetting = {
      url: url,
      httpParams: httpParams,
      httpParamBindEvent: paramBindEvent,
      processData: processData
    }
  }

  public setRulesPatternNumberOnly() {
    this.rules.pattern            = "[0-9]+";
    this.rules.patternInformation = "Only number";
  }

  public setRulesPatternEmail() {
    this.rules.pattern            = '[\\w]+(\\.[\\w+])*@[\\w]+(.[\\w]+)*\\.[a-zA-Z]{2,4}'
    this.rules.patternInformation = "Must valid email";
  }

  public static getCurrentDate() {
    var currentTime = new Date();
// returns the month (from 0 to 11)
    var month       = ('0' + currentTime.getMonth()).slice(-2);
// returns the day of the month (from 1 to 31)
    var day         = ('0' + currentTime.getDate()).slice(-2);
// returns the year (four digits)
    var year        = currentTime.getFullYear();

    console.log('max date', `${year}-${month}-${day}`)
    return currentTime.toISOString()
  }

  public static getAdvanceDate(advance:number, from = new Date(), ){
    from.setDate(from.getDate() + advance);
    return from.toISOString();
  }
  public getInputTypeText():string{
    console.log('getInputTypeText', InputType[this.inputType])
    return InputType[this.inputType];
  }

}

export interface KeyValue {
  value?: any,
  key: string,

}

export interface InputRules {
  required?: boolean,
  minlength?: number,
  maxlength?: number,
  pattern?: string,
  patternInformation?: string,
  max?: number
  min?: number
}

export interface InputStyle {
  label?: string,


}

export enum InputType {
  text, select, password, email, date, number, searchBar
}

export enum LabelType {
  inline, stacked


}

export interface DateSetting {
  min?: string | Date;
  max?: string | Date;
  displayFormat?: string;
  hourValues?:string;
}

export interface SearchBarSetting {
  url: string;
  processData: (serverResponse: any) => KeyValue[]
  httpParams: HttpParams;
  httpParamBindEvent: string[];
}

