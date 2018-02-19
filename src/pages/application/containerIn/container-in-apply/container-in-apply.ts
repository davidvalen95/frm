import {Component, ViewChild} from '@angular/core';
import {AlertController, IonicPage, Navbar, NavController, NavParams, ToastController} from 'ionic-angular';
import {BaseForm, InputType, KeyValue} from "../../../../components/Forms/base-form";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {
  ContainerInHistoryInterface, ContainerInListDataInterface,
  ContainerInRuleInterface, ContainerInVisitorCategoryInterface
} from "../ContainerInApiInterface";
import {MatureKeyValueContainer} from "../../../../components/detail-key-value/detail-key-value";
import {HttpClient, HttpParams} from "@angular/common/http";
import {
  ApiProvider, EmployeeInformationInterface, SuccessMessageInterface,
  TextValueInterface
} from "../../../../providers/api/api";
import {HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {RootParamsProvider} from "../../../../providers/root-params/root-params";
import {ApplyBaseInterface} from "../../../../app/app.component";
import {NgForm} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {AttachmentRuleInterface} from "../../leave/ApiInterface";
import {SectionFloatingInputInterface} from "../../../../components/Forms/section-floating-input/section-floating-input";

/**
 * Generated class for the ContainerInApplyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-container-in-apply',
  templateUrl: 'container-in-apply.html',
})
export class ContainerInApplyPage {


  public title: string;
  public segmentValue: string                                    = "form";
  public pageParam: ContainerInApplyParam                        = {isEditing: false, isApproval: false, isApply: true};
  public baseForms: BaseForm[]                                   = [];
  public sectionFloatings: SectionFloatingInputInterface[]       = []
  public approvalBaseForms: BaseForm[]                           = [];
  public apiReplaySubject: { [key: string]: ReplaySubject<any> } = {};
  public attachmentValueContainer: object                        = {};
  public applyRule: ContainerInRuleInterface;
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
    this.title     = this.pageParam.title || "";

    // console.log('applyLeaveApplicationData', this.pageParam.leaveApplicationTop , this.pageParam.leaveApplicationTop.info,  this.pageParam.leaveApplicationTop.info.available);


    var loader = this.helperProvider.presentLoadingV2("Loading");
    this.apiGetApplyRule().toPromise().then((data: ContainerInRuleInterface) => {
      this.applyRule       = data;
      this.applyRule.data  = this.helperProvider.mergeObject(this.applyRule.data, this.applyRule.datatmp || this.applyRule.data);
      this.applyRule.isFnf = this.applyRule.loc_id.toLowerCase() == 'fnf';

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





    //region baseform
    var name: BaseForm = new BaseForm("Employee", "employee");
    name.value         = this.pageParam.isEditing ? this.applyRule.employee || "" : `${this.userProvider.userSession.empId} ${this.userProvider.userSession.name}`;
    name.isReadOnly    = true;
    name.isDisabled    = true;

    var createdDate              = new BaseForm("Created Date", "ctd");
    createdDate.isReadOnly       = true;
    createdDate.value            = this.applyRule.created_date;
    createdDate.rules.isRequired = false;

    this.applyRule.data.visitation_time
    var visitorCategory   = new BaseForm("Visitor Category", "visitorcategory_code");
    visitorCategory.value = this.applyRule.data.visitorcategory_code;
    visitorCategory.setInputTypeSelectChain<ContainerInRuleInterface>(this.apiGetApplyRule(), (data: ContainerInRuleInterface,) => {

      var keyValue: KeyValue[] = [];


      data.visitorcategory.forEach(raw => {

        var currentKeyValue = {
          key: raw.visitorcategory_name,
          value: raw.visitorcategory_code,
        };
        if (raw.only_fnf) {
          if (this.applyRule.isFnf) {
            keyValue.push(currentKeyValue);
          }
        } else {
          keyValue.push({
            key: raw.visitorcategory_name,
            value: raw.visitorcategory_code,
          })
        }


      })

      return keyValue;
    }, true)

    visitorCategory.changeListener.subscribe((data)=>{
      this.apiProvider.getVisitationFormRules(this.userProvider.userSession.ct_id,data.value,false).subscribe((rule)=>{
        console.log('theRule,rule',rule);
      })
    })
    this.baseForms.push(name, createdDate, visitorCategory);
    //endregion


    //region containerInDetail
    var visitationDateFrom   = new BaseForm("Visitation Date", "visitation_date");
    visitationDateFrom.value = BaseForm.getAdvanceDate(1, new Date(this.applyRule.data.visitation_date)).toISOString();
    visitationDateFrom.setInputTypeDate({});


    var untilDate   = new BaseForm("Until date", "until_date");
    untilDate.value = BaseForm.getAdvanceDate(1, new Date(this.applyRule.data.until_date)).toISOString();
    untilDate.setInputTypeDate({});


    var visitationTime   = new BaseForm("Visitation time", "visitation_time");
    visitationTime.value = this.applyRule.data.visitation_time
    visitationTime.setInputTypeTime();

    var deliveryType   = new BaseForm("Delivery type", "delivery_type");
    deliveryType.value = this.applyRule.data.delivery_type;
    deliveryType.setInputTypeSelectChain<ContainerInRuleInterface>(this.apiGetApplyRule(), (data: ContainerInRuleInterface) => {
      var keyValue: KeyValue[] = [];
      data.cmbDeliveryType.forEach(raw => {
        keyValue.push({
          key: raw.text,
          value: raw.value,
        })
      })
      return keyValue;
    })


    this.sectionFloatings.push({
      name: "Container In Detail",
      isOpen: false,
      baseForms: [visitationDateFrom, untilDate, visitationTime, deliveryType],
    })

    //endregion


    //region containerInformation
    var containerName   = new BaseForm("Container name", "visitor_name")
    containerName.value = this.applyRule.data.visitor_name;

    var containerSize   = new BaseForm("container size", "container_size");
    containerSize.value = this.applyRule.data.container_size;
    containerSize.setInputTypeSelectChain<ContainerInRuleInterface>(this.apiGetApplyRule(), (data: ContainerInRuleInterface) => {
      var keyValue: KeyValue[] = [];
      data.cmbContainerSize.forEach(raw => {
        keyValue.push({
          key: raw.text,
          value: raw.value,
        })
      })
      return keyValue;
    })


    //when import
    var containerNo   = new BaseForm("Container no.", 'visitor_no');
    containerNo.value = this.applyRule.data.visitor_no;

    var containerSealNo   = new BaseForm("Container seal no.", 'container_sealno');
    containerSealNo.value = this.applyRule.data.container_sealno;
    //=========


    var transportationCompany   = new BaseForm("Transportation company", "outsider_code");
    transportationCompany.value = this.applyRule.data.outsider_code;

    transportationCompany.setInputTypeSelectChain(this.apiGetOutsider(),(data=>{
      var keyValue: KeyValue[] = [];
      console.log('transportationCompany',data);

      return keyValue;
    }))

    //when export

    var referenceNo   = new BaseForm("Reference No", 'visitor_id');
    referenceNo.value = this.applyRule.data.visitor_id;

    var portName   = new BaseForm("port name", "port_name");
    portName.value = this.applyRule.data.port_name;
    //=========

    this.sectionFloatings.push({
      name: "Container Information",
      isOpen: false,
      baseForms: [referenceNo, containerName, containerSize, containerNo, containerSealNo, transportationCompany, portName]
    });


    deliveryType.changeListener.subscribe(data => {

      referenceNo.toggleHidden(false, true);
      containerName.toggleHidden(false, true);
      containerSize.toggleHidden(false, true);
      containerNo.toggleHidden(false, true);
      containerSealNo.toggleHidden(false, true);
      transportationCompany.toggleHidden(false, true);
      portName.toggleHidden(false, true)


      if (data.value.toLowerCase() == "import") {
        referenceNo.toggleHidden(true);
        portName.toggleHidden(true);
      }

      if (data.value.toLowerCase() == 'export') {
        containerSealNo.toggleHidden(true);
        containerNo.toggleHidden(true);
      }
    })


    //endregion


    var remark = new BaseForm("remark", "Remark");

    this.sectionFloatings.push({
      name: "Additional Information",
      baseForms: [remark,],
      isOpen: false,
    })


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
      param["id"]             = this.pageParam.list.id || this.pageParam.list.tid || "-1";
      param["sts"]            = "update";
      param["tid"]            = this.pageParam.list.id || this.pageParam.list.tid || "-1";
      param["userid"]         = this.userProvider.userSession.empId;
      param["mobile"]         = "true";
      param["hospital_name"]  = "";
      console.log('formAPprovalSubmit', param);


      var url = `${ApiProvider.HRM_URL}s/ContainerInApplicationApproval_op`;
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

      json["emp_id"] = this.applyRule.data.emp_id;
      // json["half_date"]  = form.value.leave_date_from;
      json["sts"]    = this.pageParam.isEditing ? "update" : "save";
      json["act"]    = this.pageParam.isEditing ? "edit" : "add";
      json["tid"]    = this.pageParam.isEditing ? this.pageParam.list.id : -1;
      json["userid"] = this.userProvider.userSession.empId;
      json["mobile"] = true;
      json["id"]     = this.pageParam.isEditing ? this.pageParam.list.id : -1;
      json           = this.helperProvider.convertIsoToServerDate(json, ["visitation_date", "until_date"]);
      json["requisition_type"] = 'container';
      json["container_out"] = false;



      json = this.helperProvider.mergeObject(json, this.attachmentValueContainer);
      json = this.removeWrongDate(json);
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
    if (this.applyRule.history) {

      this.applyRule.history.forEach((data: ContainerInHistoryInterface, index) => {
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

      var url    = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/VisitationApplicationApprovaltop" : "s/VisitationApplication_top"}`;
      var params = {
        mobile: "true",
        cmd: this.pageParam.isEditing ? "edit" : "add",
        tid: this.pageParam.isEditing ? this.pageParam.list.id : this.userProvider.userSession.empId,
        user_id: this.userProvider.userSession.empId,
        container: "true",
        requisition_type: "container",
        container_out: "false",

      }


      this.httpClient.get<ContainerInRuleInterface>(url, {
        withCredentials: true,
        params: params
      }).subscribe(this.apiReplaySubject.applyRule);
    }


    return this.apiReplaySubject.applyRule;


  }

  private apiGetOutsider(){
    if (!this.apiReplaySubject.outsider) {
      this.apiReplaySubject.outsider = new ReplaySubject(0);


      var url    = `${ApiProvider.HRM_URL}s/VisitationRulesList`;
      var params = {
        mobile: "true",
        requisition_type: "container",
        reqtype: "container",
        container_out: "false",

      }


      this.httpClient.get<ContainerInRuleInterface>(url, {
        withCredentials: true,
        params: params
      }).subscribe(this.apiReplaySubject.outsider);
    }


    return this.apiReplaySubject.outsider;
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

    var url = `${ApiProvider.HRM_URL}s/VisitationApplication_op`;
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


  private setAttachmentData(data: ContainerInRuleInterface, fileForms: BaseForm[]) {


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

export interface ContainerInApplyParam extends ApplyBaseInterface<ContainerInListDataInterface> {

}
