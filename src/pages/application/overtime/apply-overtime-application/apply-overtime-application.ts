import {Component, ViewChild} from '@angular/core';
import {
  Alert, AlertController, IonicPage, Navbar, NavController, NavParams, Platform,
  ToastController
} from 'ionic-angular';
import {
  ApiProvider, SuccessMessageInterface, TextValueInterface,
  VisitationFilterApi
} from "../../../../providers/api/api";
import {BaseForm, InputType, KeyValue} from "../../../../components/Forms/base-form";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {AttachmentRuleInterface, DayRuleInterface, LeaveHistoryInterface} from "../../leave/ApiInterface";
import {HttpClient} from "@angular/common/http";
import {AlertStatusInterface, HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {RootParamsProvider} from "../../../../providers/root-params/root-params";
import {ApplyBaseInterface} from "../../../../app/app.component";
import {
  OvertimeHistoryInterface, OvertimeListDataInterface, OvertimeListInterface,
  OvertimeRuleInterface
} from "../ApiInterface";
import {Observable} from "rxjs/Observable";
import {NgForm} from "@angular/forms";
import {MatureKeyValueContainer} from "../../../../components/detail-key-value/detail-key-value";
import {SectionFloatingInputInterface} from "../../../../components/Forms/section-floating-input/section-floating-input";

/**
 * Generated class for the ApplyOvertimeApplicationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-apply-overtime-application',
  templateUrl: 'apply-overtime-application.html',
})
export class ApplyOvertimeApplicationPage {

  public title: string = "Overtime Application";
  public segmentValue: string                                    = "form";
  public pageParam: ApplyOvertimeApplicationParam                = {isEditing: false,isApproval:false, isApply:true};
  public baseForms: BaseForm[]                                   = [];
  public approvalBaseForms: SectionFloatingInputInterface;

  public apiReplaySubject: { [key: string]: ReplaySubject<any> } = {};
  public attachmentValueContainer: object                        = {};
  public applyRule: OvertimeRuleInterface;
  public attachmentData: KeyValue[]                              = []
  public isCanApprove: boolean                                   = false;

  public isCanAcknowledge: boolean = false;
  public isCanDelete: boolean      = false;
  public isCanSubmit: boolean      = false;

  public approvalHistoriesContainer:MatureKeyValueContainer[] = []
  public currentAlert:AlertStatusInterface;

  @ViewChild(Navbar) navbar: Navbar;

  constructor(public platform:Platform, public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {

    this.setHardwareBackButton();
    this.pageParam = navParams.data;


    // console.log('applyLeaveApplicationData', this.pageParam.leaveApplicationTop , this.pageParam.leaveApplicationTop.info,  this.pageParam.leaveApplicationTop.info.available);

    this.title = this.pageParam.isApproval ? "Overtime Approval" : "Overtime Application";

    var loader = this.helperProvider.presentLoadingV2("Loading");
    this.apiGetApplyRule().toPromise().then((data: OvertimeRuleInterface) => {
      this.applyRule = data;
      this.applyRule.data = this.helperProvider.mergeObject(this.applyRule.data, this.applyRule.datatmp || this.applyRule.data);

      this.setupButtonLogic();
      this.setupForms();


      if (!this.pageParam.isApply) {
        this.getHistory();
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

  setupButtonLogic() {
    this.isCanDelete  = this.pageParam.isEditing && this.applyRule.approved == 0 && this.applyRule.changeDate;
    this.isCanSubmit  = !this.pageParam.isEditing || ( this.pageParam.isEditing && this.applyRule.approved == 0);
    this.isCanApprove = this.pageParam.isApproval && this.applyRule.data.status.toLowerCase() != 'ca' && this.applyRule.allowEdit;
  }

  ionViewDidLoad() {

    //#override back button
    this.navbar.backButtonClick = (e: UIEvent) => {
      this.leavePage();
    }
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
      .setValue(this.applyRule.data.status)
      .setInputTypeSelect([
        {key: 'Approve', value: "AP"},
        {key: 'Reject', value: "RE"}
      ],true)
    if(this.applyRule.data.status.toLowerCase() != ""){
       status.value = this.applyRule.data.status.toLowerCase() != "re" ? "AP" : "RE";
    }

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


    this.approvalBaseForms = {      name: "For your approval",      baseForms: [status, approverRemark, alertEmail],      isHidden: false,      isOpen: true,      description: "",    }

    this.setNotEditable();

  }


  setupForms() {

    this.isCanDelete = this.pageParam.isEditing && this.applyRule.approved == 0;
    this.isCanSubmit = !this.pageParam.isEditing || ( this.pageParam.isEditing && this.applyRule.approved == 0);


    var name: BaseForm = new BaseForm("Employee", "employee");
    name.value         = this.pageParam.isEditing ? this.applyRule.data.emp_id : `${this.userProvider.userSession.empId} ${this.userProvider.userSession.name}`;
    name.isReadOnly    = true;
    name.isDisabled    = true;

    var createdDate        = new BaseForm("Created Date", "");
    createdDate.isReadOnly = true;
    createdDate.value      = this.applyRule.created_date;


    var overtimeDate = new BaseForm("Date overtime", "ot_date");
    overtimeDate.setInputTypeDate({});
    overtimeDate.value = BaseForm.getAdvanceDate(1, new Date(this.applyRule.data.ot_date)).toISOString();

    this.applyRule.data.reason
    var overtimeTimeFrom = new BaseForm("Overtime time from", "ot_time_from");
    overtimeTimeFrom.setInputTypeTime();
    overtimeTimeFrom.value =  this.applyRule.data.ot_time_from;

    var overtimeTimeTo = new BaseForm("Overtime time To", "ot_time_to");
    overtimeTimeTo.setInputTypeTime();
    overtimeTimeTo.value = this.applyRule.data.ot_time_to;

    var overtimeClaimType   = new BaseForm("Over time clain type", "ot_claim_type");
    overtimeClaimType.value = this.applyRule.data.ot_claim_type;
    overtimeClaimType.setInputTypeSelectChain(this.apiGetApplyRule(), (data: OvertimeRuleInterface) => {
      var keyValues: KeyValue[] = []

      data.cmb_ot_claim_type.map((currentData) => {
        keyValues.push({
          key: currentData.text,
          value: currentData.value,
        });
      })

      return keyValues;


    });

    var reason   = new BaseForm("reason", 'reason').setInputTypeTextarea();
    reason.value = this.applyRule.data.reason;


    this.baseForms.push(name, createdDate, overtimeDate, overtimeTimeFrom, overtimeTimeTo, overtimeClaimType, reason);


    // this.baseForms.
    this.setNotEditable();
  }

  private setNotEditable() {

    this.baseForms.forEach((currentBaseForm: BaseForm) => {
      currentBaseForm.isReadOnly = (this.isCanSubmit && !this.pageParam.isApproval) ? currentBaseForm.isReadOnly : true;
    })

    if(this.approvalBaseForms && this.approvalBaseForms.baseForms){
      this.approvalBaseForms.baseForms.forEach((currentBaseForm:BaseForm)=>{
        currentBaseForm.isReadOnly = (!this.isCanApprove);
      })
    }

  }

  formSubmitApproval(form: NgForm) {

    /*
        mobile:true
        id:102807
        approver_remark:yo u canot
        alert_employee:t
        status:RE
        sts:update
        tid:102807
        userid:MY080026
        callback:Ext.data.JsonP.callback36
        _dc:1518166076485
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


      var url = `${ApiProvider.HRM_URL}s/OvertimeApplicationApproval_op`;
      this.currentAlert = this.helperProvider.showConfirmAlert("Commit Approval",()=>{
        this.apiProvider.submitGet<SuccessMessageInterface>(url,param,(data:SuccessMessageInterface)=>{
          this.navCtrl.pop();
          this.helperProvider.presentToast(data.message || "");
        })
      })
    } else {
      this.currentAlert = this.helperProvider.showAlert("Please check field(s) mark in red", "");
    }


  }

  formSubmit(form: NgForm) {

    var test: object = {};
    if (form.valid) {
      console.log('formvalue', form.value);
      var json = this.helperProvider.convertToJson(form);
      console.log('jsonraw', json);

      json["emp_id"] = this.applyRule.data.emp_id;
      json["act"]    = this.pageParam.isEditing ? "edit" : "add";
      // json["half_date"]  = form.value.leave_date_from;
      json["sts"]    = this.pageParam.isEditing ? "update" : "save";
      json["tid"]    = this.pageParam.isEditing ? this.pageParam.list.id : this.userProvider.userSession.empId;
      json["userid"] = this.userProvider.userSession.empId;
      json["mobile"] = true;
      json["id"]     = this.pageParam.isEditing ? this.pageParam.list.id : -1;
      json           = this.helperProvider.convertIsoToServerDate(json, ["ot_date"]);

      var url = `${ApiProvider.HRM_URL}s/OvertimeApplication_op`;

      json = this.helperProvider.mergeObject(json, this.attachmentValueContainer);
      console.log('formSUbmit', json, this.attachmentValueContainer);


      // this.httpClient.post(url, )
      var from = new Date("2018-03-06T" + form.value.ot_time_from);
      var to = new Date("2018-03-06T" +  form.value.ot_time_to);
      var extraMessage = "Are you sure to submit Application?";
      if(from.getTime() > to.getTime()){
        extraMessage = "Overtime Time To less than Overtime Time From will be until next day OT, are you sure to continue?"
      }
      console.log(from,to, from.getTime(), to.getTime());
      this.helperProvider.showConfirmRawAlert(` ${extraMessage}`, () => {

        this.apiExecuteSubmitApplication(json);
      });
    } else {
      this.currentAlert = this.helperProvider.showAlert("Please check field(s) mark in red", "");
    }

  }


  formDelete() {
    var json            = [];
    json["sts"]         = "delete";
    json["tid"]         = this.pageParam.list.id;
    json["id"]          = this.pageParam.list.id;
    json["userid"]      = this.userProvider.userSession.empId;
    json["mobile"]      = true;
    this.currentAlert = this.helperProvider.showConfirmAlert("delete this application", () => {
      this.apiExecuteSubmitApplication(json);
    });
  }


  public leavePage() {

      this.navCtrl.pop({}, () => {

      });
  }

  ionViewWillEnter(){
    console.log('ionviewwillenter');
    this.setHardwareBackButton();
  }
  public setHardwareBackButton(){
    this.platform.ready().then(() => {

      this.platform.registerBackButtonAction(() => {
        try{
          if(this.currentAlert.isPresent){this.currentAlert.alert.dismiss(); return;}
        }catch(exception){
          console.log(exception);
        }
        this.leavePage();

      });
    });
  }


  public getHistory(){

    console.log('getHistory-1');
    if (this.applyRule.history) {
      console.log('getHistory-2');

      this.applyRule.history.forEach((data: OvertimeHistoryInterface, index) => {
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

  private apiGetApplyRule() {

    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_top?mobile=true&cmd=add&tid=MY080127


    if (!this.apiReplaySubject.applyRule) {
      this.apiReplaySubject.applyRule = new ReplaySubject(0);

      var url    = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/OvertimeApplicationApproval_top" : "s/OvertimeApplication_top"}`;
      var params = {
        mobile: "true",
        cmd: this.pageParam.isEditing ? "edit" : "add",
        tid: this.pageParam.isEditing ? this.pageParam.list.id : this.userProvider.userSession.empId,
        user_id: this.userProvider.userSession.empId,
      }


      this.httpClient.get<OvertimeRuleInterface>(url, {
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


  private apiExecuteSubmitApplication(json: object): void {

    // http://hrms.dxn2u.com:8888/hrm_test2/s/LeaveApplicationAjax?reqtype=total_day&emp_id=MY080127&leave_type=EL&leave_date_from=22%20Feb%202018&leave_date_to=22%20Feb%202018&halfday_date=22%20Feb%202018&exclude_dt=&id=-1&ct_id=MY&callback=Ext.data.JsonP.callback56&_dc=1517798772579

    var url = `${ApiProvider.HRM_URL}s/OvertimeApplication_op`;
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
        this.currentAlert = this.helperProvider.showAlert(message);
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


  private setAttachmentData(data: OvertimeRuleInterface, fileForms: BaseForm[]) {


    fileForms.forEach((currentForm: BaseForm, index) => {
      var i = index + 1;

      var currentUrl: string = data[`attachment${i}url`];

      if (!currentUrl) {
        return;
      }
      currentForm.setFileAttachmentInfo(data.data[`attachment${i}`], `${ApiProvider.BASE_URL}${currentUrl}`);
    });


  }

}

export interface ApplyOvertimeApplicationParam extends ApplyBaseInterface<OvertimeListDataInterface> {


}


