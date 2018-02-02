import {EventEmitter, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {ApiProvider} from "../../providers/api/api";
import {NgModel} from "@angular/forms";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {FileJsonFormat, MyHelper} from "../../app/MyHelper";
import {File} from "@ionic/app-scripts";

@Injectable()
export class BaseForm {
  public labelType: LabelType = LabelType.stacked;
  public inputType: InputType = InputType.text;

  public placeholder: string                        = "";
  public selectOptions: KeyValue[]                  = [];
  public rules: InputRules                          = {isRequired: true, min: 0};
  public isHidden: boolean                          = false;
  public styling: InputStyle                        = {};
  public value: any                              = "";
  public isReadOnly: boolean                        = false;
  public dateSetting: DateSetting                   = {min: "1900-01-01"};
  public changeListener: ReplaySubject<BaseForm>          = new ReplaySubject(0);
  public inputClickListener: ReplaySubject<BaseForm>      = new ReplaySubject(0);
  public labelClickListener: ReplaySubject<BaseForm>      = new ReplaySubject(0);
  public buttonRightClickListener: ReplaySubject<NgModel> = new ReplaySubject(0);
  public searchBarSetting?: SearchBarSetting              = null;
  public isSearchBar: boolean                             = false;
  public isDisabled: boolean                              = false;
  public isInitializeState:boolean = false;
  public infoBottom:string = "";
  public fileCallbackEvent: (event)=>void;
  private lastBroadcast: number;
  private lastBroadcastWithNumber: number = -1;
  public buttonRightSuccess: ButtonSettingInterface       = {
    label: "",
    isHidden: true,
    clickListener: new ReplaySubject(1)
  };
  public buttonRightDanger: ButtonSettingInterface        = {
    label: "",
    isHidden: true,
    clickListener: new ReplaySubject(1)
  };

  private isSelectProcessing: boolean                     = false;

  constructor(public label: string,
              public name?: string,) {
    this.placeholder = `Enter ${this.label}`;


    // var promise: Promise<any> = Promise.resolve("tes");
    this.changeListener.subscribe((model: BaseForm) => {
      if (this.inputType == InputType.number && this.rules.max) {
        // if ((model.value as number) > this.rules.max) {
        //   // model.
        // }

        var test;
      }
      //
      // if(this.inputType == InputType.select){
      //   this.value = model.value;
      // }

    })


  }

  public setDateAdvanceDay(param: string, day:number = 1) {
    if (param == null || param == "") {
      return;
    }
    try {
      var date = new Date(param);
      date.setDate(date.getDate() + day);
      this.value = date.toISOString();
    } catch (error) {

    }

  }

  public setInputTypeFile(callbackEvent:(event)=>void){
    this.inputType = InputType.file;
    // this.value = "0 ";
    this.fileCallbackEvent = callbackEvent;
  }
  public setInputTypeDate(dateSetting: DateSetting) {
    this.placeholder = `Select ${this.label}`;
    this.inputType = InputType.date;
    // Return today's date and time

    dateSetting.hourValues = "";
    if (dateSetting.min == null)
      dateSetting.min = "1900-01-01";

    if (dateSetting.max == null)
      dateSetting.max = BaseForm.getAdvanceDate(712);

    if (dateSetting.displayFormat == null) {
      dateSetting.displayFormat = "DD MMM YYYY";
    }

    if (dateSetting.min instanceof Date) {
      dateSetting.min = (<Date>dateSetting.min).toISOString()
    }
    if (dateSetting.max instanceof Date) {
      dateSetting.max = (<Date>dateSetting.max).toISOString()
    }

    this.dateSetting = dateSetting;
    console.log(`setting ${this.name}`, this.dateSetting)


  }

  public setDateTimezone(timezone: number = 8): string {

    console.log('setDateTimezone', this.dateSetting)
    this.value = new Date((new Date().getTime() - new Date().getTimezoneOffset()) + timezone * 3600 * 1000).toISOString();
    return this.value;
  }

  public static setDateTimezone(date: Date, timezone: number): Date {
    return new Date((date.getTime() - date.getTimezoneOffset()) + timezone * 3600 * 1000);
  }

  public setInputTypeTime() {
    this.placeholder = `Select ${this.label}`;

    var dateSetting: DateSetting = {};
    dateSetting.displayFormat    = "HH:mm";
    this.inputType               = InputType.date;
    dateSetting.min              = '00:00';
    dateSetting.max              = "23:59";
    dateSetting.hourValues       = "";
    var prefix                   = "";

    for (var i = 0; i < 24; i++) {
      dateSetting.hourValues += prefix;
      dateSetting.hourValues += ("" + '0' + i).slice(-2);

      prefix = ",";
    }

    console.log('timesetting', dateSetting);
    this.dateSetting = dateSetting;

  }

  public setInputTypeText(){
    this.inputType = InputType.text;
    this.placeholder = `Enter ${this.label}`;

  }
  public setInputTypeSelect(options: KeyValue[]) {
    if(!this.isSelectProcessing){
      this.selectOptions = [];
      this.isSelectProcessing = true;
      this.placeholder = `Select ${this.label}`;
      this.inputType     = InputType.select;
      this.selectOptions = options;

      var text: string = "sdoifjiojdf";

      this.isSelectProcessing = false;


    }

  }

  public setInputTypeSelectChain(observable: Observable<any>, processData: (data: any) => KeyValue[]) {
    this.placeholder = `Select ${this.label}`;

    this.inputType = InputType.select;

    // parsing as key value
    observable.subscribe((data:any) => {
      this.selectOptions = processData(data)
      console.log('selectOptions', this.selectOptions)
    })


  }

  public activateButtonRightDanger(label:string):ReplaySubject<BaseForm>{
    this.buttonRightDanger.label = label;
    this.buttonRightDanger.isHidden = false;
    return this.buttonRightDanger.clickListener;
  }

  public setInputTypeSearchBar(url: string, httpParams: HttpParams, paramBindEvent: string[], processData: (serverResponse: any) => KeyValue[]) {
    // this.placeholder = `Search ${this.label}`;

    this.isSearchBar      = true;
    this.inputType        = InputType.searchBar;
    // this.isReadOnly       = true
    this.searchBarSetting = {
      url: url,
      httpParams: httpParams,
      httpParamBindEvent: paramBindEvent,
      processData: processData
    }
    this.placeholder = "Click here to search " + this.label;
  }

  public setRulesPatternNumberOnly() {
    this.inputType                = InputType.number;
    this.rules.pattern            = "[0-9]+";
    this.rules.patternInformation = "Only number";
  }

  public setRulesPatternEmail() {
    this.rules.pattern            = '[\\w]+(\\.[\\w+])*@[\\w]+(.[\\w]+)*\\.[a-zA-Z]{2,4}'
    this.rules.patternInformation = "Must valid email";
  }



  public static getAdvanceDate(advance: number, from = new Date(),) {
    from.setDate(from.getDate() + advance);

    return from;
  }

  public getInputTypeText(): string {
    console.log('getInputTypeText', InputType[this.inputType])
    return InputType[this.inputType];
  }

  public broadcastIonChange(event) {
    if (this.value == null) {
      return;
    }
   // if(this.lastBroadcast && new Date().getTime() - this.lastBroadcast < 1000 ){
   //    return;
    this.lastBroadcastWithNumber++;
    if(this.lastBroadcastWithNumber%2>0){
      return;
    }
    this.lastBroadcast = new Date().getTime();
    this.changeListener.next(this) //# my BaseForm


  }

  public broadcastNgChange(event){

    if(this.inputType == InputType.text){
      this.changeListener.next(this);
    }

    if(this.inputType == InputType.file){

      if(!event.target.files[0]){
        return;
      }
      // var test:File = event.target.files[0];
      // event.target.value = "C:\\fakepath\\Screen Shot 2018-01-19 at 2.22.22 PM.png";
      console.log('broadcastTheEvent',event);

      this.fileCallbackEvent(event);

      // MyHelper.readFile(event,(result)=>{
      //   // console.log(result);
      //   this.fileCallback(result);
      // })
    }
  }

  public getReadOnlyValue(): string{

    switch(this.inputType){
      case InputType.date:
      case InputType.email:
      case InputType.number:
      case InputType.password:
      case InputType.searchBar:
      case InputType.text:
        return this.value !=='' ? this.value : "-";
      case InputType.select:

        var bank:string = "";

        //# get the label(key) if type select
        this.selectOptions.map((keyValue)=>{
          if(keyValue.value == this.value){
            bank =  keyValue.key
          }
        });
        return bank;

      default:
        return this.value;
    }

  }

}

export interface KeyValue {
  value?: any,
  key: string,
  order?:number,
}

export interface InputRules {
  isRequired?: boolean,
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
  text, select, password, email, date, number, searchBar,textarea,file
}

export enum LabelType {
  inline, stacked


}

export interface DateSetting {
  min?: string | Date;
  max?: string | Date;
  displayFormat?: string;
  hourValues?: string;
}

export interface SearchBarSetting {
  url: string;
  processData: (serverResponse: any) => KeyValue[]
  httpParams: HttpParams;
  httpParamBindEvent: string[];
}

export interface ButtonSettingInterface{
  label:string;
  clickListener: ReplaySubject<BaseForm>;
  isHidden: boolean;
}
