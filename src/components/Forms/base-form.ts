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

  public placeholder: string                        = "";
  public selectOptions: KeyValue[]                  = [];
  public rules: InputRules                          = {isRequired: true, min: 0};
  public isHidden: boolean                          = false;
  public styling: InputStyle                        = {};
  public value: string                              = "";
  public isReadOnly: boolean                        = false;
  public dateSetting: DateSetting                   = {min: "1900-01-01", max: BaseForm.getCurrentDate()};
  public changeListener: ReplaySubject<BaseForm>     = new ReplaySubject(10);
  public inputClickListener: ReplaySubject<BaseForm> = new ReplaySubject(10);
  public labelClickListener: ReplaySubject<BaseForm> = new ReplaySubject(10);
  public buttonRightClickListener: ReplaySubject<NgModel> = new ReplaySubject(10);
  public searchBarSetting?: SearchBarSetting        = null;
  public isSearchBar: boolean                       = false;
  public isDisabled: boolean                        = false;
  public buttonRight: FloatingRightButton           = {
    label: "",
    isHidden: true,
    clickListener: new ReplaySubject(10)
  };
  private isSelectProcessing: boolean = false;

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

  public setDateAdvance1Day(param: string) {
    if (param == null || param == "") {
      return;
    }
    try {
      var date = new Date(param);
      date.setDate(date.getDate() + 1);
      this.value = date.toISOString();
    } catch (error) {

    }

  }

  public setInputTypeDate(dateSetting: DateSetting) {
    this.placeholder = `Select ${this.label}`;
    this.inputType = InputType.date;
    // Return today's date and time

    dateSetting.hourValues = "";
    if (dateSetting.min == null)
      dateSetting.min = "1900-01-01";

    if (dateSetting.max == null)
      dateSetting.max = BaseForm.getCurrentDate();

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

  public setInputTypeSelectChain(observable: Observable<any>, processData: (data: object[]) => KeyValue[]) {
    this.placeholder = `Select ${this.label}`;

    this.inputType = InputType.select;

    // parsing as key value
    observable.subscribe((data: object[]) => {
      this.selectOptions = processData(data)
      console.log('selectOptions', this.selectOptions)
    })


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

  public static getAdvanceDate(advance: number, from = new Date(),) {
    from.setDate(from.getDate() + advance);
    return from.toISOString();
  }

  public getInputTypeText(): string {
    console.log('getInputTypeText', InputType[this.inputType])
    return InputType[this.inputType];
  }

  public broadcast(ngModel: NgModel) {
    if (ngModel == null || ngModel.value == null) {
      return;
    }
    this.changeListener.next(this)
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
  text, select, password, email, date, number, searchBar
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

export interface FloatingRightButton{
  label:string;
  clickListener: ReplaySubject<BaseForm>;
  isHidden: boolean;
}
