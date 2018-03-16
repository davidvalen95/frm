import {EventEmitter, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {ApiProvider} from "../../providers/api/api";
import {NgForm, NgModel} from "@angular/forms";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {FileJsonFormat, MyHelper} from "../../app/MyHelper";
import {File} from "@ionic/app-scripts";
import {Subject} from "rxjs/Subject";

@Injectable()
export class BaseForm {
  public labelType: LabelType = LabelType.stacked;
  public inputType: InputType = InputType.text;

  public placeholder: string                              = "";
  public selectOptions: KeyValue[]                        = [];
  public rules: InputRules                                = {isRequired: true, min: 0};
  public isHidden: boolean                                = false;
  public styling: InputStyle                              = {};
  public value: any                                       = "";
  public isReadOnly: boolean                              = false;
  public dateSetting: DateSettingInterface                = {min: "1900-01-01"};
  public changeListener: ReplaySubject<BaseForm>          = new ReplaySubject(0);
  public inputClickListener: ReplaySubject<BaseForm>      = new ReplaySubject(0);
  public labelClickListener: ReplaySubject<BaseForm>      = new ReplaySubject(0);
  public buttonRightClickListener: ReplaySubject<NgModel> = new ReplaySubject(0);
  public searchBarSetting?: SearchBarSetting              = null;
  public isSearchBar: boolean                             = false;
  public isDisabled: boolean                              = false;
  public isInitializeState: boolean                       = false;
  public infoBottom: string                               = "";
  private lastBroadcast: number;
  private lastBroadcastWithNumber: number                 = -1;


  //# for file auto add
  private formValueContainer = null;


  public attachmentInfo: AttachmentInfoInterface = {isSet: false}


  public buttonRightSuccess: ButtonSettingInterface = {
    label: "",
    isHidden: true,
    clickListener: new ReplaySubject(0)
  };
  public buttonRightDanger: ButtonSettingInterface  = {
    label: "",
    isHidden: true,
    clickListener: new ReplaySubject(0)
  };

  private isSelectProcessing: boolean = false;

  constructor(public label: string,
              public name?: string,) {
    this.label = MyHelper.ucWord(this.label);
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

  public setInputTypePassword(){
    this.inputType = InputType.password;
  }

  public setHidden(isHidden: boolean = null, isRequiredWhenVisible: boolean = false) {
    var logic = isHidden != null ? isHidden : !this.isHidden;

    this.isHidden = logic;

    if (this.isHidden) {
      this.value            = '';
      this.rules.isRequired = false;
    } else {
      this.rules.isRequired = isRequiredWhenVisible;
    }

    return this;
  }

  public setDateAdvanceDay(param: string, day: number = 1) {
    if (param == null || param == "") {
      return;
    }
    try {
      var date = new Date(param);
      date.setDate(date.getDate() + day);
      this.value = date.toISOString();
    } catch (error) {

    }

    return this;
  }


  public setInputTypeFile(formValueContainer: object) {
    this.inputType = InputType.file;
    // this.value = "0 ";
    // this.fileCallbackEvent = callbackEvent;

    this.formValueContainer = formValueContainer;

    return this;

  }

  public setInputTypeDate(dateSetting: DateSettingInterface) {
    this.placeholder = `Select ${this.label}`;
    this.inputType   = InputType.date;
    // Return today's date and time

    dateSetting.hourValues = "";
    if (dateSetting.min == null){
      var year = new Date().getFullYear() - 1;
      dateSetting.min = `${year}-01-01`;

    }

    if (dateSetting.max == null)
      dateSetting.max = BaseForm.getAdvanceDate(712);

    if (dateSetting.displayFormat == null) {
      dateSetting.displayFormat = "DDD DD MMM YYYY";
    }

    if (dateSetting.min instanceof Date) {
      dateSetting.min = (<Date>dateSetting.min).toISOString()
    }
    if (dateSetting.max instanceof Date) {
      dateSetting.max = (<Date>dateSetting.max).toISOString()
    }

    this.dateSetting = dateSetting;
    console.log(`setting ${this.name}`, this.dateSetting)


    return this;
  }

  public setDateTimezone(timezone: number = 8) {

    this.value = new Date((new Date().getTime() - new Date().getTimezoneOffset()) + timezone * 3600 * 1000).toISOString();
    return this;
  }


  public setInputTypeTime() {
    this.placeholder = `Select ${this.label}`;

    var dateSetting: DateSettingInterface = {};
    dateSetting.displayFormat             = "HH:mm";
    this.inputType                        = InputType.datetime;
    dateSetting.min                       = '00:00';
    dateSetting.max                       = "23:59";
    dateSetting.hourValues                = "";
    dateSetting.isTime                    = true;
    var prefix                            = "";

    for (var i = 0; i < 24; i++) {
      dateSetting.hourValues += prefix;
      dateSetting.hourValues += ("" + '0' + i).slice(-2);

      prefix = ",";
    }

    console.log('timesetting', dateSetting);
    this.dateSetting = dateSetting;

    return this;
  }

  public setInputTypeText() {
    this.inputType   = InputType.text;
    this.placeholder = `Enter ${this.label}`;
    return this;

  }

  public setInputTypeTextarea() {
    this.inputType = InputType.textarea;

    return this;
  }

  public setInputTypeSelect(options: KeyValue[], isFirstDefault:boolean = false) {
    if (!this.isSelectProcessing) {
      this.selectOptions      = [];
      this.isSelectProcessing = true;
      this.placeholder        = `Select ${this.label}`;
      this.inputType          = InputType.select;
      this.selectOptions      = options;

      var text: string = "sdoifjiojdf";

      this.isSelectProcessing = false;
      console.log("firstDefaultBefore",this.name,isFirstDefault,isFirstDefault && (!this.value || this.value == "" ),  this.value);

      if(isFirstDefault && (!this.value || this.value == "" )){
        this.value = this.selectOptions[0].value;
        console.log("firstDefault", this.value);
      }


    }

    return this;

  }

  public setInputTypeRadio(options: KeyValue[], isFirstDefault:boolean = false) {
    if (!this.isSelectProcessing) {
      this.selectOptions      = [];
      this.isSelectProcessing = true;
      this.placeholder        = `Select ${this.label}`;
      this.inputType          = InputType.radio;
      this.selectOptions      = options;

      this.isSelectProcessing = false;
      console.log("firstDefaultBefore",this.name,isFirstDefault,isFirstDefault && (!this.value || this.value == "" ),  this.value);

      if(isFirstDefault && (!this.value || this.value == "" )){
        this.value = this.selectOptions[0].value;
        console.log("firstDefault", this.value);
      }


    }

    return this;

  }



  public setInputTypeSelectTrueFalse() {
    if (!this.isSelectProcessing) {
      this.selectOptions      = [];
      this.isSelectProcessing = true;
      this.placeholder        = `Select ${this.label}`;
      this.inputType          = InputType.select;
      this.selectOptions      = [{
        key:"Yes",value:"true",
      },{
        key: "No", value: "false",
      }];

      this.isSelectProcessing = false;


    }

    return this;

  }

  public setInputTypeSelectChain<T>(observable: Observable<T>, processData: (data: T) => KeyValue[], isFirstDefault:boolean = false) {
    this.placeholder = `Select ${this.label}`;

    this.inputType = InputType.select;

    // parsing as key value
    observable.subscribe((data: T) => {
      this.selectOptions = processData(data)
      if(isFirstDefault && this.value == ""){
        this.value = this.selectOptions[0].value;
        console.log("firstDefault", this.value);
      }
      console.log('selectOptions', this.selectOptions)
    })

    return this;

  }


  public setInputTypeRadioChain<T>(observable: Observable<T>, processData: (data: T) => KeyValue[], isFirstDefault:boolean = false) {
    this.placeholder = `Select ${this.label}`;

    this.inputType = InputType.radio;

    // parsing as key value
    observable.subscribe((data: T) => {
      this.selectOptions = processData(data)
      if(isFirstDefault && this.value == ""){
        this.value = this.selectOptions[0].value;
        console.log("firstDefault", this.value);
      }
      console.log('selectOptions', this.selectOptions)
    })

    return this;

  }

  public activateButtonRightDanger(label: string): ReplaySubject<BaseForm> {
    this.buttonRightDanger.label    = label;
    this.buttonRightDanger.isHidden = false;
    return this.buttonRightDanger.clickListener;
  }

  public setInputTypeSearchBar(url: string, httpParams: HttpParams, paramBindEvent: string[], processData: (serverResponse: any) => KeyValue[]) {
    this.placeholder = `Search ${this.label}`;

    this.value = "-";
    this.isSearchBar      = true;
    this.inputType        = InputType.text;
    // this.isReadOnly       = true
    this.searchBarSetting = {
      url: url,
      httpParams: httpParams,
      httpParamBindEvent: paramBindEvent,
      processData: processData
    }
    this.placeholder      = "Click here to search " + this.label;

    return this;
  }

  public setRulesPatternNumberOnly() {
    this.inputType                = InputType.number;
    this.rules.pattern            = "[0-9]+";
    this.rules.patternInformation = "Only number";

    return this;
  }

  public setRulesPatternEmail() {
    this.rules.pattern            = '[\\w]+(\\.[\\w+])*@[\\w]+(.[\\w]+)*\\.[a-zA-Z]{2,4}'
    this.rules.patternInformation = "Must valid email";

    return this;
  }


  public static getAdvanceDate(advance: number, from = new Date(),) {

    //# kalo ga set hours, jadi 00:00:00 ikut tanggal nya pas
    //# kalo di set hours, tanggal jadi hari ssetelah nya jadi harus -1
    from.setDate(from.getDate() + advance -1);
    from.setHours(7);
    return from;
  }

  public getServerDateFormat() {
    if (this.inputType == InputType.date) {
      var mmm = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      try {
        var date = new Date(this.value);
        return ('0' + date.getUTCDate()).slice(-2) + ` ${mmm[date.getUTCMonth()]} ${date.getUTCFullYear()}`
      } catch (e) {
        console.log('error', e.toString())
      }

    }

    return this.value;
  }

  public getInputTypeText(): string {
    // console.log('getInputTypeText', InputType[this.inputType])
    return InputType[this.inputType];
  }

  public broadcastIonChange(origin) {
    if (this.value == null) {
      return;
    }
    // if(this.lastBroadcast && new Date().getTime() - this.lastBroadcast < 1000 ){
    //    return;
    // this.lastBroadcastWithNumber++;
    //# IONCHANGE ANEH TRIGGER 4 KALI
    // console.log('broadcastIonChange', origin, this.name, this.value);
    // if (this.lastBroadcastWithNumber % 4 > 0) {
    //   return;
    // }
    // console.log('lastbroadcastWithnumber', this.lastBroadcastWithNumber);
    ;
    this.lastBroadcast = new Date().getTime();
    this.changeListener.next(this) //# my BaseForm


  }

  public broadcastNgChange(event, parentForm: NgForm) {

    if (this.inputType == InputType.text) {
      this.changeListener.next(this);
    }

    if (this.inputType == InputType.file) {

      if (!event.target.files[0]) {
        this.rules.isRequired = true;

        return;
      }

      this.formValueContainer[this.name] = event.target.files[0];
      this.rules.isRequired = false;
      this.infoBottom = `File set. ${event.target.files[0].name}`



    }
  }


  private getReadOnlyForDate(){
    if(this.dateSetting.isTime){
      return this.value;
    }else{
      return this.getServerDateFormat();

    }
  }

  public getReadOnlyValue(): string {

    switch (this.inputType) {
      case InputType.date:
      case InputType.datetime:
        return this.getReadOnlyForDate();
      case InputType.email:
      case InputType.number:
      case InputType.password:
      case InputType.text:
      case InputType.textarea:
        return this.value !== '' ? this.value : "-";
      case InputType.select:

        var bank: string = "";

        //# get the label(key) if type select
        this.selectOptions.map((keyValue) => {
          if (keyValue.value == this.value) {
            bank = keyValue.key
          }
        });
        return bank;

      default:
        return "-";
    }

  }

  public setFileAttachmentInfo(name: string, url: string) {
    name = !name ? "Attachment " : name;
    if (!url || url == "") {
      return;
    }
    this.attachmentInfo = {
      isSet: true,
      name: name,
      url: url,
    }

    return this;
  }

  public setIsRequired(isRequired: boolean) {

    this.rules.isRequired = isRequired;

    if (this.inputType == InputType.file) {
      if (this.attachmentInfo.isSet) {
        this.rules.isRequired = false;
      }
    }


    return this;
  }

  public setValue(value: string) {
    if(value && value != ""){
      this.value = value;

    }
    return this;
  }

  public getSelectOptionJsonOrigin() : KeyValue{
    var filter = this.selectOptions.filter((data)=>{
      return data.value == this.value;
    });

    if(filter[0]){
      return filter[0];
    }else{
      return null;
    }
  }



  public closeDatetimeIonicPicker(){
    var cancelButton = document.getElementsByClassName("picker-button")[0];
    console.log('cancelButton',cancelButton);
    if(cancelButton){
      // Create a click event to be triggered
      var clickEvent = new MouseEvent("click", {
        "view": window,
        "bubbles": true,
        "cancelable": false
      });
      cancelButton.dispatchEvent(clickEvent);
    }
  }


}

export interface KeyValue {
  value?: any,
  key: string,
  order?: number,
  originJson?:any;
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
  text, select, password, email, date, number, textarea, file,datetime, radio
}

export enum LabelType {
  inline, stacked


}

export interface DateSettingInterface {
  min?: string | Date;
  max?: string | Date;
  displayFormat?: string;
  hourValues?: string;
  isTime?: boolean;
}

export interface SearchBarSetting {
  url: string;
  processData: (serverResponse: any) => KeyValue[]
  httpParams: HttpParams;
  httpParamBindEvent: string[];
}

export interface ButtonSettingInterface {
  label: string;
  clickListener: ReplaySubject<BaseForm>;
  isHidden: boolean;
}

export interface AttachmentInfoInterface {
  isSet: boolean;
  name?: string;
  url?: string;
}
