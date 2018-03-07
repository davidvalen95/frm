import {Component, ViewChild} from '@angular/core';
import {Alert, AlertController, IonicPage, Navbar, NavController, NavParams, ToastController} from 'ionic-angular';
import {BaseForm, InputType, KeyValue} from "../../../../components/Forms/base-form";
import {NgForm} from "@angular/forms";
import {
  ApiProvider, HistoryBaseInterface, SuccessMessageInterface,
  TextValueInterface
} from "../../../../providers/api/api";
import {HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {BroadcastType, RootParamsProvider} from "../../../../providers/root-params/root-params";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import 'rxjs/add/operator/map';
import {share} from "rxjs/operator/share";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {
  AttachmentRuleInterface, DayRuleInterface, LeaveApplicationFilter, LeaveApplicationTopInterface,
  LeaveHistoryInterface,
  LeaveListInterface
} from "../ApiInterface";
import {leave} from "@angular/core/src/profile/wtf_impl";
import {MatureKeyValueContainer} from "../../../../components/detail-key-value/detail-key-value";
import {ApplyBaseInterface} from "../../../../app/app.component";

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

  public title:string = "";
  public segmentValue: string                                    = "form";
  public pageParam: ApplyLeaveApplicationParam                   = {isEditing: false, isApproval: false, isApply: true};
  public baseForms: BaseForm[]                                   = [];
  public approvalBaseForms: BaseForm[]                           = [];
  public apiReplaySubject: { [key: string]: ReplaySubject<any> } = {};
  public attachmentValueContainer: object                        = {};
  public applyRule: LeaveApplicationTopInterface;
  public attachmentData: KeyValue[]                              = [];
  public isCanApprove: boolean                                   = false;
  public isCanAcknowledge: boolean = false;
  public isCanDelete: boolean      = false;
  public isCanSubmit: boolean      = false;
  public formButton

  public approvalHistoriesContainer: MatureKeyValueContainer[] = [];

  public availableDayContainer: MatureKeyValueContainer = {
    name: "Annual leave available as of",
    isOpen: true,
    keyValue: [],
  }


  @ViewChild(Navbar) navbar: Navbar;

  constructor(public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    this.pageParam = navParams.data;

    this.title = this.pageParam.title || "Leave Application";

    // console.log('applyLeaveApplicationData', this.pageParam.leaveApplicationTop , this.pageParam.leaveApplicationTop.info,  this.pageParam.leaveApplicationTop.info.available);

    var loader = this.helperProvider.presentLoadingV2("Please wait, retrieving your leave summary");

    this.apiGetSummary().then((data)=>{
      return this.apiGetApplyRule().toPromise();
    }).then((data: LeaveApplicationTopInterface) => {

      // if(this.pageParam.isApproval){
      //   data = this.helperProvider.swapObject(data,"data","datatmp");
      // }


      this.applyRule = data;
      this.applyRule.data = this.helperProvider.mergeObject(this.applyRule.data, this.applyRule.datatmp || this.applyRule.data);

      this.setupButtonLogic();
      this.setupForms();
      if (!this.pageParam.isApply) {
        this.getHistory();
      }
      if (this.pageParam.isApply) {
        this.getLeaveAvaliable();
      }
      if (this.pageParam.isApproval) {
        this.setupApprovalForms();
      }
    }).catch((rejected) => {
      this.helperProvider.presentToast("Error");
      console.log(rejected);
    }).finally(() => {
      loader.dismiss();
    });


  }

  ionViewDidLoad() {

    //#override back button
    // this.navbar.backButtonClick = (e: UIEvent) => {
    //   this.leavePage();
    // }
  }

  ionViewDidLeave() {

    //# broadcast event
    console.log('applyLeaveAPplicationLeave');
    // this.rootParam.broadcast.next(BroadcastType.homeLeaveApplicationOnResume);

    if (this.pageParam.onDidLeave) {
      console.log('applyLeaveAPplicationLeaveCallback');

      this.pageParam.onDidLeave();
    }

  }

  setupApprovalForms() {

    var status = new BaseForm("Status", "status")
      .setInputTypeSelect([
        {key: 'Approve', value: "AP"},
        {key: 'Reject', value: "RE"}
      ])
      .setValue(this.applyRule.data.status);

    var approverRemark = new BaseForm("Approver Remark", "approver_remark")
      .setInputTypeTextarea()
      .setValue(this.applyRule.data.approver_remark);

    var alertEmail = new BaseForm("trigger Alert Employee", "alert_employee")
      .setInputTypeSelect([
        {key: "Yes", value: "t"},
        {key: "No", value: "f"},
      ])
      .setValue(this.applyRule.data.alert_employee);

    alertEmail.infoBottom = "Trigger alert email notification with approver remark for employee";


    this.approvalBaseForms.push(status, approverRemark, alertEmail);


  }


  setupButtonLogic() {
    var dateFrom = BaseForm.getAdvanceDate(1, new Date(this.applyRule.data.leave_date_from));
    var isBackDate = new Date().getTime() > dateFrom.getTime();
    this.isCanDelete  = this.pageParam.isEditing && this.applyRule.approved == 0 && !isBackDate;
    this.isCanSubmit  = !this.pageParam.isEditing || ( this.pageParam.isEditing && this.applyRule.approved == 0 && !isBackDate);
    this.isCanApprove = this.pageParam.isApproval && this.applyRule.allowEdit;
  }


  setupForms() {


    var name: BaseForm = new BaseForm("Employee", "employee");
    name.value         = this.pageParam.isEditing ? this.applyRule.data.emp_id : `${this.userProvider.userSession.empId} ${this.userProvider.userSession.name}`;
    name.isReadOnly    = true;


    var dateFrom = new BaseForm("Date From", "leave_date_from");
    dateFrom.setInputTypeDate({});
    dateFrom.value            = (this.pageParam.dateFrom || BaseForm.getAdvanceDate(1, new Date(this.applyRule.data.leave_date_from))).toISOString();
    dateFrom.rules.isRequired = false
    dateFrom.isReadOnly = this.pageParam.isFromAbsenceRecord;


    var dateTo   = new BaseForm("Date To", "leave_date_to");
    dateTo.value = (this.pageParam.dateFrom || BaseForm.getAdvanceDate(1, new Date(this.applyRule.data.leave_date_to))).toISOString();
    dateTo.setInputTypeDate({});
    dateTo.isReadOnly = this.pageParam.isFromAbsenceRecord;



    var totalApply        = new BaseForm("Total Apply Day(s)", "total_day");
    totalApply.isReadOnly = true;


    var leaveType = new BaseForm("leave Type", "leave_type");

    setTimeout(() => {
      leaveType.value = this.applyRule.data.leave_type;

    }, 200);

    leaveType.setInputTypeSelect([{key: "Annual", value: "annual"}]);
    leaveType.setInputTypeSelectChain(this.apiReplaySubject.applyRule, (data: LeaveApplicationTopInterface) => {

      var selectKeyValue: KeyValue[] = [];
      data.cmb_leave_type.map((textValue: TextValueInterface) => {
        selectKeyValue.push({
          key: textValue.text,
          value: textValue.value,
        })
      });

      return selectKeyValue;
    });


    var attachment1 = new BaseForm("Attachment 1", "attachment1").setInputTypeFile(this.attachmentValueContainer).toggleHidden();
    var attachment2 = new BaseForm("Attachment 2", "attachment2").setInputTypeFile(this.attachmentValueContainer).toggleHidden();
    var attachment3 = new BaseForm("Attachment 3", "attachment3").setInputTypeFile(this.attachmentValueContainer).toggleHidden();
    var attachment4 = new BaseForm("Attachment 4", "attachment4").setInputTypeFile(this.attachmentValueContainer).toggleHidden();
    this.setAttachmentData(this.applyRule, [attachment1, attachment2, attachment3, attachment4]);


    var hospital = new BaseForm("Hospital Name", "hospital_name");
    hospital.toggleHidden(true);
    hospital.value = this.applyRule.data.hospital_name;



    var availableReplacement        = new BaseForm("Total available replacement leave", "");
    availableReplacement.isReadOnly = true;


    var remark       = new BaseForm("Remark", "remark");
    // remark.setInputTypeText();
    remark.inputType = InputType.textarea;
    remark.value     = this.applyRule.data.remark;

    var notifiedTo              = new BaseForm("Notified to", "notified_to");
    notifiedTo.rules.isRequired = false;
    notifiedTo.toggleHidden(true);
    notifiedTo.value = this.applyRule.data.notified_to;

    leaveType.changeListener.subscribe((data: BaseForm) => {
      if (data.value == "") {
        return;
      }

      var loader = this.helperProvider.presentLoadingV2("Loading rule");

      this.apiGetAtachmentRule(data.value).toPromise().then(attachmentRule => {
        this.attachmentToggle(attachmentRule, [attachment1, attachment2, attachment3, attachment4]);
        loader.dismiss();
        loader = null;

        var value = data.value.toLowerCase();


        hospital.toggleHidden(value != 'sl', true);
        notifiedTo.toggleHidden(value == 'al' || value == 'alh');
        if (value == 'rl') {
          availableReplacement.toggleHidden(false);
          this.apiGetApplyRule().subscribe((data: LeaveApplicationTopInterface) => {
            if (data.enableHalfday) {
              //# halfdate di display
            }
          });

          //# overtime claimable
          //# replacement leave taken

        } else {
          availableReplacement.toggleHidden(true);
          //# halfdate hidden
          //# overtime hideen
          //# leave taken hidden
        }


      });

      this.apiExecuteGetDayRule(dateFrom, dateTo, availableReplacement, totalApply, leaveType.value);

    });

    dateFrom.changeListener.subscribe((data: BaseForm) => {


      if (new Date(dateTo.value) < new Date(dateFrom.value)) {
        dateTo.value = dateFrom.value;
      } else {
        this.apiExecuteGetDayRule(dateFrom, dateTo, availableReplacement, totalApply, leaveType.value);

        // totalApply.value = this.helperProvider.getDifferentDay(dateFrom.value, dateTo.value) + 1;

      }
      // dateTo.value = "";
      dateTo.dateSetting.min = data.value;


    });
    dateTo.changeListener.subscribe((data: BaseForm) => {

      // totalApply.value = this.helperProvider.getDifferentDay(dateFrom.value, dateTo.value) + 1;
      this.apiExecuteGetDayRule(dateFrom, dateTo, availableReplacement, totalApply, leaveType.value);

    });
    this.baseForms.push(name, dateFrom, dateTo, leaveType, totalApply, availableReplacement, hospital, notifiedTo, attachment1, attachment2, attachment3, attachment4, remark);

    // this.baseForms.
    this.setNotEditable(this.baseForms);
  }

  private setNotEditable(baseForms: BaseForm[]) {

    baseForms.forEach((currentBaseForm: BaseForm) => {
      currentBaseForm.isReadOnly = (this.isCanSubmit && !this.pageParam.isApproval) ? currentBaseForm.isReadOnly : true;
    })
  }


  formSubmit(form: NgForm) {


    var test: object = {};
    if (form.valid) {
      console.log('formvalue', form.value);
      var json = this.helperProvider.convertToJson(form);
      console.log('jsonraw', json);

      // json["employee"]            = `${this.userProvider.userSession.empId} ${this.userProvider.userSession.name}`;
      json["created_date"] = this.pageParam.isEditing ? this.pageParam.list.created_date : this.helperProvider.getCurrentDate(false);
      // json["leave_date_from_tmp"] = form.value.leave_date_from;
      // json["leave_date_to_tmp"]   = form.value.leave_date_to;
      json["exclude_dt"]         = "";
      json["chk_halfday"]        = null;
      // json["halfday_date_tmp"]    = form.value.leave_date_from;
      json["halfday_date"]       = this.pageParam.isEditing ? this.applyRule.data.halfday_date : form.value.leave_date_from;
      // json["birth_date_tmp"]      = form.value.leave_date_from;
      json["halfdayoff_morning"] = null;
      json["reason_type"]        = null;

      json["emp_id"]     = this.pageParam.isEditing ? this.applyRule.data.emp_id : this.userProvider.userSession.empId;
      json["act"]        = this.pageParam.isEditing ? "edit" : "add";
      // json["half_date"]  = form.value.leave_date_from;
      json["birth_date"] = this.pageParam.isEditing ? this.applyRule.data.birth_date : form.value.leave_date_from;
      json["sts"]        = this.pageParam.isEditing ? "update" : "save";
      json["tid"]        = this.pageParam.isEditing ? this.pageParam.list.id : this.userProvider.userSession.empId;
      json["userid"]     = this.userProvider.userSession.empId;
      json["mobile"]     = true;
      json["id"]         = this.pageParam.isEditing ? this.pageParam.list.id : -1;
      json               = this.helperProvider.convertIsoToServerDate(json, ["birth_date", "birth_date_tmp", "created_date", "half_date", "halfday_date", "halfday_date_tmp", "leave_date_from", "leave_date_from_tmp", "leave_date_to_tmp", "leave_date_to",]);

      var url = `${ApiProvider.HRM_URL}s/LeaveApplication_op`;

      json = this.helperProvider.mergeObject(json, this.attachmentValueContainer);
      console.log('formSUbmit', json, this.attachmentValueContainer);


      // this.httpClient.post(url, )
      this.helperProvider.showConfirmAlert("Submit Application?", () => {

        this.apiExecuteSubmitApplication(json);
      });
    } else {
      this.helperProvider.showAlert("Please check field(s) mark in red", "");
    }

  }

  formDelete() {
    var json            = [];
    json["sts"]         = "delete";
    json["tid"]         = this.pageParam.list.id;
    json["id"]          = this.pageParam.list.id;
    json["userid"]      = this.userProvider.userSession.empId;
    json["emp_id"]      = this.userProvider.userSession.empId;
    json["mobile"]      = true;
    json["leave_type"]  = this.applyRule.info.total_leave;
    json["chk_halfday"] = this.applyRule.enableHalfday;
    this.helperProvider.showConfirmAlert("Delete this leave application?", () => {
      this.apiExecuteSubmitApplication(json);
    });
  }

  formSubmitApproval(form: NgForm) {

    /*
        mobile:true
        id:823
        approver_remark:remark
        alert_employee:t
        status:AP
        hospital_name:
        sts:update
        tid:823
        userid:MY040001
        callback:Ext.data.JsonP.callback35
        _dc:1518151219815
     */

    if (form.valid) {
      var param               = this.helperProvider.convertToJson(form);
      param["approve_remark"] = form.value.approver_remark;
      param["id"]             = this.pageParam.list.id || this.pageParam.list.tid;
      param["sts"]            = "update";
      param["tid"]            = this.pageParam.list.id || this.pageParam.list.tid;
      param["userid"]         = this.userProvider.userSession.empId;
      param["mobile"]         = "true";
      param["hospital_name"]  = "";
      console.log('formAPprovalSubmit', param);


      var url = `${ApiProvider.HRM_URL}s/LeaveApplicationApproval_op`;
      this.helperProvider.showConfirmAlert("Commit Approval",()=>{
        this.apiProvider.submitGet<SuccessMessageInterface>(url,param,(data:SuccessMessageInterface)=>{
          this.navCtrl.pop();
          this.helperProvider.presentToast(data.message || "");
        })
      })
    } else {
      this.helperProvider.showAlert("Please check field(s) mark in red", "");
    }





  }

  public leavePage() {

    this.helperProvider.showConfirmAlert("leave this page", () => {
      this.navCtrl.pop({}, () => {

      });

    })
  }

  public getHistory() {
    console.log('getHistory-1');
    if (this.applyRule.history) {
      console.log('getHistory-2');

      this.applyRule.history.forEach((data: LeaveHistoryInterface, index) => {
        var keyValues: KeyValue[] = [];
        for (var key in data) {

          var value = data[key];

          if(key == 'emp_name'){
            value = `${data['emp_id']} - ${value}`;
          }

          if(key != 'emp_id' && key !='status'){
            keyValues.push({
              key: key,
              value: value,
            });
          }

        }
        console.log('getHistory-3', this.approvalHistoriesContainer);


        this.approvalHistoriesContainer.push({
          isOpen: true,
          name: `${index + 1} ${data.status}`,
          keyValue: keyValues
        })
      })
    }
  }

  public getLeaveAvaliable() {

    this.availableDayContainer.keyValue.push({
      key: this.applyRule.info.currentDate,
      value: `${this.applyRule.info.available} Days`
    });
    this.availableDayContainer.keyValue.push({
      key: this.applyRule.info.nextDate,
      value: `${this.applyRule.info.availableNext} Days`
    });
  }

  private apiGetApplyRule() {
    // http://hrms.dxn2u.com:8888/hrm_test2/s/LeaveApplication_top?mobile=true&cmd=add&tid=MY080127&user_id=MY080127

    if (!this.apiReplaySubject.applyRule) {
      this.apiReplaySubject.applyRule = new ReplaySubject(0);

      var url    = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/LeaveApplicationApproval_top" : "s/LeaveApplication_top"}`;
      var params = {
        mobile: "true",
        cmd: this.pageParam.isEditing ? "edit" : "add",
        tid: this.pageParam.isEditing ? this.pageParam.list.id : this.userProvider.userSession.empId,
        user_id: this.userProvider.userSession.empId,
      }


      this.httpClient.get<LeaveApplicationTopInterface>(url, {
        withCredentials: true,
        params: params
      }).subscribe(this.apiReplaySubject.applyRule);
    }


    return this.apiReplaySubject.applyRule;


  }

  private apiGetAtachmentRule(leaveType): Observable<AttachmentRuleInterface> {
    // http://hrms.dxn2u.com:8888/hrm_test2/s/LeaveApplicationAjax?reqtype=req_attach&ct_id=MY&leave_type=AL
    if (!leaveType) {
      return;
    }
    var url = `${ApiProvider.HRM_URL}s/LeaveApplicationAjax`;


    var param = {
      reqtype: "req_attach",
      ct_id: this.userProvider.userSession.ct_id,
      leave_type: `${leaveType}`,
    }

    return this.httpClient.get<AttachmentRuleInterface>(url, {params: param, withCredentials: true});
  }


  private apiExecuteGetDayRule(formFrom: BaseForm, formTo: BaseForm, availableReplacement: BaseForm, totalDay: BaseForm, leaveType): void {
    var url = `${ApiProvider.HRM_URL}s/LeaveApplicationAjax`;


    var param = {
      reqtype: "total_day",
      emp_id: this.userProvider.userSession.empId,
      ct_id: this.userProvider.userSession.ct_id,
      leave_type: `${leaveType}`,
      leave_date_from: formFrom.getServerDateFormat(),
      leave_date_to: formTo.getServerDateFormat(),
      halfday_date: formFrom.getServerDateFormat(),
      exclude_dt: "",
      id: this.pageParam.isEditing ? "-2" : "-1",

    }

    // var loader = this.helperProvider.presentLoadingV2("Retrieving day");

    this.httpClient.get<DayRuleInterface>(url, {
      params: param,
      withCredentials: true
    }).toPromise().then((data: DayRuleInterface) => {
      availableReplacement.value = data.total_available_rl;
      totalDay.value             = data.total_day;
    }).finally(() => {
      // loader.dismiss();
    });
  }




  private apiExecuteSubmitApplication(json: object): void {

    // http://hrms.dxn2u.com:8888/hrm_test2/s/LeaveApplicationAjax?reqtype=total_day&emp_id=MY080127&leave_type=EL&leave_date_from=22%20Feb%202018&leave_date_to=22%20Feb%202018&halfday_date=22%20Feb%202018&exclude_dt=&id=-1&ct_id=MY&callback=Ext.data.JsonP.callback56&_dc=1517798772579

    var url = `${ApiProvider.HRM_URL}${this.pageParam.isApproval? "s/LeaveApplicationApproval_op" : "s/LeaveApplication_op"}`;
    //
    // this.httpClient.post(url,body)

    this.apiProvider.submitFormWithProgress<SuccessMessageInterface>(url, json, (response: SuccessMessageInterface) => {

      var message = response.message || "Cannot retrieve message";
      if (response.success) {
        this.helperProvider.presentToast(message);

        setTimeout(() => {
          this.navCtrl.pop();

        }, 500)
      } else {
        this.helperProvider.showAlert(message);
      }

    });


  }


  private attachmentToggle(rule: AttachmentRuleInterface, baseForms: BaseForm[]) {

    console.log('attachmentToggle', rule, baseForms);
    for (var k in baseForms) {
      var key                = +k;// to number
      var keyPlusOne         = key + 1;
      var isVisible: boolean = this.helperProvider.parseBoolean(rule[`reqAttach${keyPlusOne}`] || false);
      console.log(keyPlusOne, isVisible, typeof isVisible);
      baseForms[key].isHidden = !isVisible;
      baseForms[key].setIsRequired(isVisible);
      baseForms[key].label = rule[`reqAttachDesc${keyPlusOne}`] || `Attachment ${keyPlusOne}`;

      if (key == 3) {
        baseForms[key].rules.isRequired = false;
      }

      if (rule[`reqAttach${keyPlusOne}`]) {
      }
    }
  }


  private setAttachmentData(data: LeaveApplicationTopInterface, fileForms: BaseForm[]) {


    fileForms.forEach((currentForm: BaseForm, index) => {
      var i = index + 1;

      var currentUrl: string = data[`attachment${i}url`];

      if (!currentUrl) {
        return;
      }
      currentForm.setFileAttachmentInfo(data.data[`attachment${i}`], `${ApiProvider.BASE_URL}${currentUrl}`);
    });


  }


  public apiApproval(params: object) {
    var url = `${ApiProvider.HRM_URL}s/LeaveApplicationApproval_op`;


    this.apiProvider.submitFormWithProgress<SuccessMessageInterface>(url, params, (data) => {
      this.helperProvider.presentToast(data.message || "")
      setTimeout(() => {
        this.navCtrl.pop()
      }, 300);
    })
  }



  public apiGetSummary():Promise<LeaveApplicationFilter> {

    var url = `${ ApiProvider.HRM_URL }s/LeaveApplication_top?mobile=true`;

    var params: HttpParams = new HttpParams().set("mobile", "true")
      .append("cmd", "filter")
      .append("user_id", this.userProvider.userSession.empId);

    var promise: Promise<LeaveApplicationFilter> = this.httpClient.get<LeaveApplicationFilter>(url, {
      withCredentials: true,
      params: params
    }).toPromise();


    // var loader = this.helperProvider.presentLoadingV2("Loading summary");

    return promise;

  }


}


export interface ApplyLeaveApplicationParam extends ApplyBaseInterface<LeaveListInterface> {
  leaveApplicationTop?: LeaveApplicationFilter; //#buat display infodays
  dateFrom?:Date;
}

//
// interface EditInterface {
//   currentLeaveList?: LeaveListInterface;
// }
