import {Component, ViewChild} from '@angular/core';
import {AlertController, IonicPage, Navbar, NavController, NavParams, ToastController} from 'ionic-angular';
import {ApplyBaseInterface} from "../../../../app/app.component";
import {
  IncompleteRecordDataDetailInterface, IncompleteRecordHistoryInterface, IncompleteRecordListDataInterface,
  IncompleteRecordRuleInterface
} from "../IncompleteRecordApiInterface";
import {BaseForm, KeyValue} from "../../../../components/Forms/base-form";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {MatureKeyValueContainer} from "../../../../components/detail-key-value/detail-key-value";
import {SectionFloatingInputInterface} from "../../../../components/Forms/section-floating-input/section-floating-input";
import {NgForm} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ApiProvider, SuccessMessageInterface, TextValueInterface} from "../../../../providers/api/api";
import {HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {RootParamsProvider} from "../../../../providers/root-params/root-params";
import {Observable} from "rxjs/Observable";
import {AttachmentRuleInterface} from "../../../application/leave/ApiInterface";

/**
 * Generated class for the IncompleteRecordApplyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-incomplete-record-apply',
  templateUrl: 'incomplete-record-apply.html',
})
export class IncompleteRecordApplyPage {


  public title: string;
  public segmentValue: string                                    = "form";
  public pageParam: IncompleteRecordApplyInterface               = {isEditing: false, isApproval: false, isApply: true};
  public baseForms: BaseForm[]                                   = [];
  public approvalBaseForms: BaseForm[]                           = [];
  public apiReplaySubject: { [key: string]: ReplaySubject<any> } = {};
  public attachmentValueContainer: object                        = {};
  public applyRule: IncompleteRecordRuleInterface;
  public attachmentData: KeyValue[]                              = [];
  public isCanApprove: boolean                                   = false;

  public isCanAcknowledge: boolean = false;
  public isCanDelete: boolean      = false;
  public isCanSubmit: boolean      = false;

  public approvalHistoriesContainer: MatureKeyValueContainer[] = [];

  public sectionDataDetail: SectionFloatingInputInterface[] = [];
  public isDoneFetch: boolean                               = false;


  @ViewChild(Navbar) navbar: Navbar;
  @ViewChild("parentForm") parentForm: NgForm;

  constructor(public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    this.pageParam = navParams.data;
    console.log('pageParam', this.pageParam)
    this.title = this.pageParam.title || "";

    // console.log('applyLeaveApplicationData', this.pageParam.leaveApplicationTop , this.pageParam.leaveApplicationTop.info,  this.pageParam.leaveApplicationTop.info.available);


    var loader = this.helperProvider.presentLoadingV2("Loading");
    this.apiGetApplyRule().toPromise().then((data: IncompleteRecordRuleInterface) => {
      this.applyRule      = data;
      this.applyRule.data = this.helperProvider.mergeObject(this.applyRule.data, this.applyRule.datatmp || this.applyRule.data);
      this.applyRule.data = this.helperProvider.mergeObject(this.applyRule.data, this.applyRule.captured || this.applyRule.data);
      this.applyRule.data = this.helperProvider.mergeObject(this.applyRule.data, this.applyRule.attendance || this.applyRule.data);

      console.log(this.applyRule);
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
    this.isCanDelete  = this.pageParam.isEditing && this.applyRule.approved == 0;
    this.isCanSubmit  = this.pageParam.isApply || ( this.pageParam.isEditing && this.applyRule.approved == 0);
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
      .setInputTypeSelect([
        {key: 'Approve', value: "AP"},
        {key: 'Reject', value: "RE"}
      ])
    if (this.applyRule.data.status.toLowerCase() != "") {
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


    this.approvalBaseForms.push(status, approverRemark, alertEmail);

    this.setNotEditable();

  }


  setupForms() {


    var employee: BaseForm = new BaseForm("Employee", "employee");
    employee.value         = this.pageParam.isEditing ? this.applyRule.data.emp_id : "";
    employee.isReadOnly    = true;
    employee.isDisabled    = true;

    var date        = new BaseForm("Date", "att_date");
    date.isReadOnly = true;
    date.value      = this.pageParam.isApproval ? this.applyRule.att_date : this.applyRule.data.att_date;


    var year        = new BaseForm("Year", "year");
    year.isReadOnly = true;
    year.value      = this.applyRule.data.year;


    var recordType        = new BaseForm("Record Type", "record_type");
    recordType.value      = this.pageParam.isApproval ? this.applyRule.att_type : this.applyRule.data.record_type;
    recordType.isReadOnly = true;


    if (!this.pageParam.isApproval) {
      recordType.setInputTypeSelectChain<IncompleteRecordRuleInterface>(this.apiGetApplyRule(), (data: IncompleteRecordRuleInterface) => {
        var keyValue: KeyValue[] = [];


        data.cmb_record_type.forEach((textValue) => {
          keyValue.push({
            key: textValue.text,
            value: textValue.value,
          })
        })


        return keyValue;
      })
    }


    var timeCapture: BaseForm[] = [];
    this.applyRule.captured.forEach((string, index) => {
      var capture        = new BaseForm(`Time Captured ${index + 1}`, "");
      capture.value      = string;
      capture.isReadOnly = true;
      timeCapture.push(capture);
    })


    var timeIn        = new BaseForm("Time in", "time_in");
    timeIn.value      = this.applyRule.data.time_in;
    timeIn.isReadOnly = timeIn.value != "";
    timeIn.setInputTypeTime();


    var restOut   = new BaseForm("Rest Out", "rest_out");
    restOut.value = this.applyRule.data.rest_out;
    // restOut.isReadOnly = restOut.value != "";
    restOut.setInputTypeTime();


    var restIn   = new BaseForm("Rest In", "rest_in");
    restIn.value = this.applyRule.data.rest_in;
    // restIn.isReadOnly = restIn.value != "";
    restIn.setInputTypeTime();

    var timeOut   = new BaseForm("time out", "time_out");
    timeOut.value = this.applyRule.data.time_out;
    // timeOut.isReadOnly = timeOut.value != "";
    timeOut.setInputTypeTime();

    var reasonType   = new BaseForm("Reason Type", "reason_type");
    reasonType.value = this.applyRule.data.reason_type;
    reasonType.setInputTypeSelectChain<IncompleteRecordRuleInterface>(this.apiGetApplyRule(), (data: IncompleteRecordRuleInterface) => {
      var keyValue: KeyValue[] = [];

      data.cmb_reason_type.forEach((textValue) => {
        keyValue.push({
          key: textValue.text,
          value: textValue.value,
        })
      })
      return keyValue;

    })

    var reason   = new BaseForm("Reason", "reason");
    reason.value = this.applyRule.data.reason;
    reason.setInputTypeTextarea();


    var currentStatus        = new BaseForm("Current status", "");
    currentStatus.isReadOnly = true;
    currentStatus.isHidden   = !this.pageParam.isApproval;
    currentStatus.value      = this.applyRule.current_status;
    currentStatus.isDisabled = true;


    this.baseForms.push(employee, date, year, recordType, ...timeCapture, timeIn, restOut, restIn, timeOut, reasonType, reason, currentStatus);


  }

  private setNotEditable() {

    this.baseForms.forEach((currentBaseForm: BaseForm) => {
      currentBaseForm.isReadOnly = (this.isCanSubmit && !this.pageParam.isApproval) ? currentBaseForm.isReadOnly : true;
    })

    this.sectionDataDetail.forEach(currentInputSection => {
      currentInputSection.baseForms.forEach((currentBaseForm: BaseForm) => {
        currentBaseForm.isReadOnly = (this.isCanSubmit && !this.pageParam.isApproval) ? currentBaseForm.isReadOnly : true;
      })
    })
    this.approvalBaseForms.forEach((approvalBaseForm: BaseForm) => {
      approvalBaseForm.isReadOnly = (!this.isCanApprove);
    })
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


      var id = this.pageParam.list.id || this.pageParam.list.tid;
      id     = id.slice(0, id.indexOf(";"));

      param["id"]            = id;
      param["sts"]           = "update";
      param["tid"]           = id;
      param["userid"]        = this.userProvider.userSession.empId;
      param["mobile"]        = "true";

      // param["detail_id"]      = -1;
      console.log('formAPprovalSubmit', param);


      var url = `${ApiProvider.HRM_URL}s/AttendanceApproval_op`;
      this.helperProvider.showConfirmAlert("Commit Approval", () => {
        this.apiProvider.submitGet<SuccessMessageInterface>(url, param, (data: SuccessMessageInterface) => {
          this.navCtrl.pop();
          this.helperProvider.presentToast(data.message || "");
        })
      })
    } else {
      this.helperProvider.showAlert("Please check field(s) mark in red", "");
    }


  }

  formSubmit(form: NgForm) {

    var test: object = {};
    if (form.valid) {
      console.log('formvalue', form.value);
      var json = this.helperProvider.convertToJson(form);
      console.log('jsonraw', json);


      var id            = this.pageParam.list.id || this.pageParam.list.tid;
      id                = id.slice(0, id.indexOf(";"));
      json["id"]        = id;
      json["tid"]       = id;
      json["emp_id"]    = this.applyRule.data.emp_id;
      // json["half_date"]  = form.value.leave_date_from;
      json["sts"]       = this.pageParam.isEditing ? "update" : "save";
      json["userid"]    = this.userProvider.userSession.empId;
      json["mobile"]    = true;
      json["detail_id"] = -1;
      json              = this.helperProvider.convertIsoToServerDate(json, ["work_date_from", "work_date_to"]);


      json = this.helperProvider.mergeObject(json, this.attachmentValueContainer);
      console.log('formSUbmit', json, this.attachmentValueContainer);


      // this.httpClient.post(url, )
      this.helperProvider.showConfirmAlert("Submit leave application?", () => {

        this.apiExecuteSubmitApplication(json);
      });
    } else {
      this.helperProvider.showAlert("Please check field(s) mark in red", "");
    }

  }


  formDelete() {
    var json       = [];
    json["sts"]    = "delete";
    json["act"]    = "delete";
    json["tid"]    = this.pageParam.list.id;
    json["id"]     = this.pageParam.list.id;
    json["userid"] = this.userProvider.userSession.empId;
    json["mobile"] = true;
    this.helperProvider.showConfirmAlert("Delete this leave application?", () => {
      this.apiExecuteSubmitApplication(json);
    });
  }


  public leavePage() {

    this.helperProvider.showConfirmAlert("leave this page", () => {
      this.navCtrl.pop({}, () => {

      });

    })
  }


  public getHistory() {
    //
    if (this.applyRule.history) {

      this.applyRule.history.forEach((data: IncompleteRecordHistoryInterface, index) => {
        var keyValues: KeyValue[] = [];
        for (var key in data) {
          var value = data[key];
          keyValues.push({
            key: key,
            value: value,
          });
        }


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

//
    if (!this.apiReplaySubject.applyRule) {
      this.apiReplaySubject.applyRule = new ReplaySubject(0);

      var url    = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/AttendanceApproval_top" : "s/IncompletedRecord_top"}`;
      var params = {
        mobile: "true",
        cmd: this.pageParam.isEditing ? "edit" : "add",
        tid: this.pageParam.isEditing ? this.pageParam.list.id : "-1",
        user_id: this.userProvider.userSession.empId,
      }


      this.httpClient.get<IncompleteRecordRuleInterface>(url, {
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

    var url = `${ApiProvider.HRM_URL}s/IncompletedRecord_op`;
    //
    // this.httpClient.post(url,body)

    this.apiProvider.submitGet<SuccessMessageInterface>(url, json, (response: SuccessMessageInterface) => {

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


  private setAttachmentData(data: IncompleteRecordRuleInterface, fileForms: BaseForm[]) {


    fileForms.forEach((currentForm: BaseForm, index) => {
      var i = index + 1;

      var currentUrl: string = data[`attachment${i}url`];

      if (!currentUrl) {
        return;
      }
      currentForm.setFileAttachmentInfo(data.data[`attachment${i}`], `${ApiProvider.BASE_URL}${currentUrl}`);
    });


  }


  private removeWrongDate(originJson: object) {

    var json = Object.assign({}, originJson);

    var indexOf: string[] = ["work_date", "time_in", "rest_in", "rest_out", "time_out"]

    console.log("beforeRemoveWrongDate", originJson);
    //# delete any form that contains
    for (var key in json) {
      indexOf.forEach((string) => {
        if (key.indexOf(string) >= 0 && (key.indexOf("work_date_from") == -1) && key.indexOf("work_date_to") == -1) {
          delete json[key];
        }
      })
    }


    //# copy to json
    this.sectionDataDetail.forEach((floatingInput: SectionFloatingInputInterface) => {
      floatingInput.baseForms.forEach((currentBaseForm: BaseForm) => {
        json[currentBaseForm.name] = currentBaseForm.value;
      })
    })

    return json;


  }
}

export interface IncompleteRecordApplyInterface extends ApplyBaseInterface<IncompleteRecordListDataInterface> {

}
