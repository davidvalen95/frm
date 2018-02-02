import {Component} from '@angular/core';
import {Alert, AlertController, IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import {BaseForm, InputType, KeyValue} from "../../../../components/Forms/base-form";
import {NgForm} from "@angular/forms";
import {ApiProvider, TextValue} from "../../../../providers/api/api";
import {HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {RootParamsProvider} from "../../../../providers/root-params/root-params";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import 'rxjs/add/operator/map';
import {InfoInterface, LeaveApplicationTopInterface} from "../home-leave-application/home-leave-application";
import {share} from "rxjs/operator/share";
import {ReplaySubject} from "rxjs/ReplaySubject";

/**
 * Generated class for the ApplyLeaveApplicationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-apply-leave-application',
  templateUrl: 'apply-leave-application.html',
})
export class ApplyLeaveApplicationPage {

  public pageParam: ApplyLeaveApplicationParam                   = {};
  public baseForms: BaseForm[]                                   = [];
  public apiReplaySubject: { [key: string]: ReplaySubject<any> } = {};

  constructor(public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
      this.pageParam = navParams.data;

    // console.log('applyLeaveApplicationData', this.pageParam.leaveApplicationTop , this.pageParam.leaveApplicationTop.info,  this.pageParam.leaveApplicationTop.info.available);

    this.apiGetApplyRule();

    this.setupForms();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ApplyLeaveApplicationPage');

  }

  setupForms() {


    var name: BaseForm = new BaseForm("Employee", "empName");
    name.value         = `${this.userProvider.userSession.empId} ${this.userProvider.userSession.name}`;
    name.isReadOnly    = true;


    var dateFrom = new BaseForm("Date From", "dateFrom");
    dateFrom.setInputTypeDate({min: new Date()});
    dateFrom.value = new Date().toISOString();




    var dateTo = new BaseForm("Date To", "dateTo");
    dateTo.value = new Date().toISOString();
    dateTo.setInputTypeDate({min: new Date()});

    dateFrom.changeListener.subscribe((data:BaseForm)=>{

      if(new Date(dateTo.value) < new Date(dateFrom.value)){
        dateTo.value = dateFrom.value;
      }else{

      }
        // dateTo.value = "";
      dateTo.dateSetting.min = data.value;


    });
    dateTo.changeListener.subscribe((data:BaseForm)=>{

      this.helperProvider.getDifferentDay(dateFrom.value, dateTo.value);
    });

    var totalApply = new BaseForm("Total Apply Day(s)", "");
    totalApply.isReadOnly = true;


    var type = new BaseForm("Type", "type");
    type.setInputTypeSelect([{key: "Annual", value: "annual"}]);
    type.setInputTypeSelectChain(this.apiReplaySubject.applyRule,(data:ApplyLeaveRuleInterface)=>{

      var selectKeyValue: KeyValue[] = [];
      data.cmb_leave_type.map((textValue:TextValue)=>{
        selectKeyValue.push({
          key: textValue.text,
          value: textValue.value,
        })
      })

      return selectKeyValue;
    })

    var remark = new BaseForm("Remark", "remark");
    remark.setInputTypeText();

    var notifiedTo              = new BaseForm("Notified to", "notifiedTo");
    notifiedTo.rules.isRequired = false;


    this.baseForms.push(name, dateFrom, dateTo, type, remark, notifiedTo);
  }

  formSubmit(form: NgForm) {

  }


  public leavePage() {

    this.helperProvider.showConfirmAlert("leave this page", () => {
      this.navCtrl.pop({}, () => {

      });

    })
  }


  public showConfirmAlert(message: string, handler: () => void): Alert {

    //#alertconfirmation
    var alert: Alert = this.alertController.create({
      title: "Confirmation",
      message: `Are you sure to ${message}?`,
      buttons: [
        {text: "no", role: "cancel"},
        {
          text: "yes",
          handler: handler
        }
      ]
    })
    alert.present();
    return alert;
  }


  public apiGetApplyRule() {
    // http://hrms.dxn2u.com:8888/hrm_test2/s/LeaveApplication_top?mobile=true&cmd=add&tid=MY080127&user_id=MY080127

    if(!this.apiReplaySubject.applyRule){
      this.apiReplaySubject.applyRule = new ReplaySubject(0);

      var url                      = `${ApiProvider.HRM_URL}s/LeaveApplication_top`;
      var params                   = {
        mobile: "true",
        cmd: "add",
        tid: this.userProvider.userSession.empId,
        user_id: this.userProvider.userSession.empId,
        leaveAvailable: this.pageParam.leaveApplicationTop.info.available || "18",
      }




      this.httpClient.get<ApplyLeaveRuleInterface>(url, {withCredentials:true, params: params}).subscribe(this.apiReplaySubject.applyRule);
    }


    return this.apiReplaySubject.applyRule;


  }



}


export interface ApplyLeaveApplicationParam {
    leaveApplicationTop?:LeaveApplicationTopInterface;
}

interface ApplyLeaveRuleInterface {
  reqAttach1: boolean;
  reqAttach2: boolean;
  reqAttach3: boolean;
  reqAttach4: boolean;
  reqAttachDesc1?: string;
  reqAttachDesc2?: string;
  reqAttachDesc3?: string;
  reqAttachDesc4?: string;
  attachment1url: string;
  attachment2url: string;
  attachment3url: string;
  attachment4url: string;
  cmb_leave_type: TextValue[];
  cmb_halfdayoff_morning: TextValue[];
  total_available_rl: string;
  enableHalfday: boolean;
  approved: boolean;
  info: InfoInterface;
  data: ApplyData;
}

interface ApplyData {
  attachment1: string;
  attachment2: string;
  attachment3: string;
  attachment4: string;
  notified_to: string;
  birth_date: string;
  leave_date_from: string;
  halfdayoff_morning: string;// t f
  halfday_date: string;
  exclude_dt: string; //f t
  leave_type: string;
  id: string;
  emp_id: string;
  hospital_name: string;
}
