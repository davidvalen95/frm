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
  public pageParam: ContainerInApplyParam                        = {
    isEditing: false,
    isApproval: false,
    isApply: true,
    isContainerIn: true
  };
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
    this.isCanDelete  = this.pageParam.isEditing && this.applyRule.approved == 0 && this.pageParam.isContainerIn;
    this.isCanSubmit  = this.pageParam.isApply || ( this.pageParam.isEditing && this.applyRule.approved == 0);
    this.isCanApprove = this.pageParam.isApproval && this.applyRule.allowEdit;
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
    setTimeout(()=>{    deliveryType.value = this.applyRule.data.delivery_type;},300)
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
      name: this.pageParam.isContainerIn ? "Container In Detail" : "Container Out Detail",
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


    //# containerOut
    var specifyReason = new BaseForm("Please Specify reason", "sealno_reason");
    specifyReason.toggleHidden(true, true);
    specifyReason.value = this.applyRule.data.sealno_reason;

    var isWithoutContainerSealNo = new BaseForm("Without Container Seal no", "isWithoutContainerSealNo");
    isWithoutContainerSealNo.toggleHidden(this.pageParam.isContainerIn, false);
    isWithoutContainerSealNo.setInputTypeSelectTrueFalse();
    isWithoutContainerSealNo.value = "false";
    isWithoutContainerSealNo.changeListener.subscribe((data) => {
      var isWithout = this.helperProvider.parseBoolean(data.value);
      containerSealNo.toggleHidden(isWithout, true);
      specifyReason.toggleHidden(!isWithout, true);
    })
    //============
    var inspectorSealNo = new BaseForm("Inspector Seal no.", "inspector_sealno");
    inspectorSealNo.toggleHidden(this.pageParam.isContainerIn, false);
    inspectorSealNo.value = this.applyRule.data.inspector_sealno;

    var dxnSealno   = new BaseForm("Dxn Seal no.", "dxn_sealno");
    dxnSealno.value = this.applyRule.data.dxn_sealno;
    dxnSealno.setInputTypeSelectChain<ContainerInRuleInterface>(this.apiGetApplyRule(), (data: ContainerInRuleInterface) => {
      var keyValue: KeyValue[] = [];

      data.dxnSealNo.forEach((dxnSealno) => {
        keyValue.push({
          key: dxnSealno, value: dxnSealno,
        })
      })
      return keyValue;
    })
    dxnSealno.toggleHidden(this.pageParam.isContainerIn, true);

    var transportationCompany   = new BaseForm("Transportation company", "outsider_code");
    transportationCompany.value = this.applyRule.data.outsider_code;
    transportationCompany.setInputTypeSelect([]);
    // transportationCompany.setInputTypeSelectChain()

    //when export

    var referenceNo   = new BaseForm("Reference No", 'visitor_id');
    referenceNo.value = this.applyRule.data.visitor_id;


    var portName   = new BaseForm("port name", "port_name");
    portName.value = this.applyRule.data.port_name;


    //=========


    //# container Out



    deliveryType.changeListener.subscribe(data => {

      referenceNo.toggleHidden(false, true);
      containerName.toggleHidden(false, true);
      containerSize.toggleHidden(false, true);
      containerNo.toggleHidden(false, true);
      containerSealNo.toggleHidden(false, true);
      transportationCompany.toggleHidden(false, true);
      portName.toggleHidden(false, true)


      if (data.value.toLowerCase() == "import" && this.pageParam.isContainerIn) {
        referenceNo.toggleHidden(true);
        portName.toggleHidden(true);
      }

      if (data.value.toLowerCase() == 'export' && this.pageParam.isContainerIn) {
        containerSealNo.toggleHidden(true);
        containerNo.toggleHidden(true);
      }
    })

    this.sectionFloatings.push({
      name: "Container Information",
      isOpen: false,
      baseForms: [referenceNo, containerName, containerSize, containerNo, isWithoutContainerSealNo, containerSealNo, specifyReason , inspectorSealNo, dxnSealno, transportationCompany, portName,]
    });




    //endregion


    //region additional

    var remark   = new BaseForm("remark", "remark");
    remark.value = this.applyRule.data.remark;
    remark.setIsRequired(false);


    var purpose   = new BaseForm("Purpose", "purpose_id");
    purpose.value = this.applyRule.data.purpose_id;
    purpose.setInputTypeSelectChain<ContainerInRuleInterface>(this.apiGetApplyRule(), (data: ContainerInRuleInterface) => {
      var keyValue: KeyValue[] = [];

      data.purpose.forEach((tv) => {
        keyValue.push({
          key: tv.purpose,
          value: tv.id,
          originJson: tv,
        });
      })

      return keyValue;
    });
    purpose.toggleHidden(true, false);



    var purposeSpecify   = new BaseForm("Please Specify Purpose", "purpose_specify");
    purposeSpecify.value = this.applyRule.data.purpose_specify;
    // purposeSpecify.toggleHidden(true, true);
    purposeSpecify.toggleHidden(true, false);


    purpose.changeListener.subscribe((data) => {
      var keyValue = data.getSelectOptionJsonOrigin();
      if (!keyValue) {
        return;
      }
      var isSpecify: boolean = keyValue.originJson["specify"];
      purposeSpecify.toggleHidden(!isSpecify, true);
    })


    var destination = new BaseForm("Destination", "destination_id");
    destination.value = this.applyRule.data.destination_id
    destination.setInputTypeSelectChain<ContainerInRuleInterface>(this.apiGetApplyRule(), (data: ContainerInRuleInterface) => {
      var keyValue: KeyValue[] = [];
      data.destination.forEach((tv) => {
        keyValue.push({
          key: tv.destination,
          value: tv.id,
          originJson: tv,
        });
      })

      return keyValue;
    });
    destination.toggleHidden(true,false);

    var destinationSpecify   = new BaseForm("Please Specify destination", "destination_specify");
    destinationSpecify.value = this.applyRule.data.destination_specify
    destinationSpecify.toggleHidden(true, false);


    destination.changeListener.subscribe((data) => {
      var keyValue = data.getSelectOptionJsonOrigin();
      if (!keyValue) {
        return;
      }
      var isSpecify: boolean = keyValue.originJson["specify"];
      destinationSpecify.toggleHidden(!isSpecify, true);
    })


    var attachment1 = new BaseForm("Attachment 1", "attachment1").setInputTypeFile(this.attachmentValueContainer).toggleHidden();
    var attachment2 = new BaseForm("Attachment 2", "attachment2").setInputTypeFile(this.attachmentValueContainer).toggleHidden();
    var attachment3 = new BaseForm("Attachment 3", "attachment3").setInputTypeFile(this.attachmentValueContainer).toggleHidden();
    var attachment4 = new BaseForm("Attachment 4", "attachment4").setInputTypeFile(this.attachmentValueContainer).toggleHidden();
    this.setAttachmentData(this.applyRule, [attachment1, attachment2, attachment3, attachment4]);


    visitorCategory.changeListener.subscribe((data) => {
      this.apiProvider.getVisitationFormRules(this.userProvider.userSession.ct_id, data.value, false).subscribe((rule) => {
        console.log('theRule,rule', rule);
        var outsider: { outsider_code: string, company_name: string }[] = rule["outsiders"];

        var keyValue: KeyValue[] = [];

        outsider.forEach((current) => {
          keyValue.push({
            key: current.company_name,
            value: current.outsider_code,
          });
        })

        transportationCompany.setInputTypeSelect(keyValue);
        this.attachmentToggle(rule, [attachment1, attachment2, attachment3, attachment4]);
      })
    })


    this.sectionFloatings.push({
      name: "Additional Information",
      baseForms: [remark, purpose, purposeSpecify, destination, destinationSpecify, attachment1, attachment2, attachment3, attachment4],
      isOpen: false,
    })

    //endregion


    this.setNotEditable();


  }

  private setEditableForContainerOut(currentBaseForm: BaseForm) {
    if (!this.pageParam.isContainerIn && !this.pageParam.isApproval) {
      console.log('setNotEditable', this.pageParam.isContainerIn, this.pageParam.isApproval)

      var editableInContainerOut = ["visitation_date", "until_date", "visitation_time", "visitor_no", "container_sealno", "sealno_reason", "isWithoutContainerSealNo", "inspector_sealno", "dxn_sealno", "destination_id", "destination_specify", "purpose_id", "purpose_specify"];

      if (editableInContainerOut.indexOf(currentBaseForm.name) > -1) {
        currentBaseForm.isReadOnly = false;
      }

    }
  }

  private setNotEditable() {

    this.baseForms.forEach((currentBaseForm: BaseForm) => {
      currentBaseForm.isReadOnly = (this.isCanSubmit && !this.pageParam.isApproval && this.pageParam.isContainerIn) ? currentBaseForm.isReadOnly : true;

      this.setEditableForContainerOut(currentBaseForm);
      //# kalo lagi container out, enable visitation date nya

    })

    this.sectionFloatings.forEach(currentInputSection => {
      currentInputSection.baseForms.forEach((currentBaseForm: BaseForm) => {
        currentBaseForm.isReadOnly = (this.isCanSubmit && !this.pageParam.isApproval && this.pageParam.isContainerIn) ? currentBaseForm.isReadOnly : true;
        this.setEditableForContainerOut(currentBaseForm);

      })

      currentInputSection.isOpen = (!this.pageParam.isApproval) //#
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
      var param                          = this.helperProvider.convertToJson(form);
      param["approve_remark"]            = form.value.approver_remark;
      param["id"]                        = this.pageParam.list.id || this.pageParam.list.tid || "-1";
      param["visitation_application_id"] = this.pageParam.list.id || this.pageParam.list.tid || "-1";
      param["act"]                       = "edit";
      // param["sts"]            = "update";
      param["tid"]                       = this.pageParam.list.id || this.pageParam.list.tid || "-1";
      param["userid"]                    = this.userProvider.userSession.empId;
      param["mobile"]                    = "true";
      param["container"]                 = "true";
      param["requisition_type"]          = "container";
      // param["con"]
      param                              = this.helperProvider.convertIsoToServerDate(param, ["visitation_date", "until_date"]);

      console.log('formAPprovalSubmit', param);


      var url = `${ApiProvider.HRM_URL}s/VisitationApplicationApproval_op`;
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

      json["emp_id"]           = this.applyRule.data.emp_id;
      // json["half_date"]  = form.value.leave_date_from;
      json["sts"]              = this.pageParam.isEditing ? "update" : "save";
      json["act"]              = this.pageParam.isEditing ? "edit" : "add";
      json["tid"]              = this.pageParam.isEditing ? this.pageParam.list.id : -1;
      json["userid"]           = this.userProvider.userSession.empId;
      json["mobile"]           = true;
      json["id"]               = this.pageParam.isEditing ? this.pageParam.list.id : -1;
      json                     = this.helperProvider.convertIsoToServerDate(json, ["visitation_date", "until_date"]);
      json["requisition_type"] = 'container';
      json["container_out"]    = !this.pageParam.isContainerIn;
      json["container_in"]     = this.pageParam.isContainerIn;


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


  formDelete(form: NgForm) {

    // var json = this.helperProvider.convertToJson(form);
    var json = [];
    // json["sts"]    = "delete";

    json["act"]              = "delete";
    json["requisition_type"] = 'container';
    json["container_out"]    = false;
    json["tid"]              = this.pageParam.list.id;
    json["id"]               = this.pageParam.list.id;
    json["userid"]           = this.userProvider.userSession.empId;
    json["empid"]            = this.userProvider.userSession.empId;
    json["mobile"]           = true;
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

      // var url    = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/VisitationApplicationApprovaltop" : "s/VisitationApplication_top"}`;
      var url    = `${ApiProvider.HRM_URL}s/VisitationApplication_top`;
      var params = {
        mobile: "true",
        cmd: this.pageParam.isEditing ? "edit" : "add",
        tid: this.pageParam.isEditing ? this.pageParam.list.id : "-1",
        user_id: this.userProvider.userSession.empId,
        container: "true",
        requisition_type: "container",
        container_out: "" + !this.pageParam.isContainerIn,
        container_in: "" + this.pageParam.isContainerIn,
        approval: "" + this.pageParam.isApproval,

      }


      this.httpClient.get<ContainerInRuleInterface>(url, {
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


    var application = this.pageParam.isContainerIn ? `${ApiProvider.HRM_URL}s/VisitationApplication_op` : `${ApiProvider.HRM_URL}s/VisitationApplicationContainerout_op`;

    var url = this.pageParam.isApproval ? "" : application;


    var closure = (response)=> {
      console.log('responseClosure', response);
      var message = response.message || "Cannot retrieve message";
      if (response.success) {
        this.helperProvider.presentToast(message);

        setTimeout(() => {
          this.navCtrl.pop();

        }, 500)
      } else {
        this.helperProvider.showAlert(message);
      }
    }

    // this.apiProvider.submitFormWithProgress<SuccessMessageInterface>(url, json, this.responseClosure);

    if (this.pageParam.isContainerIn) {
      this.apiProvider.submitFormWithProgress<SuccessMessageInterface>(url, json, closure);

    } else {
      this.apiProvider.submitGet<SuccessMessageInterface>(url, json, closure);

    }


  }



  private attachmentToggle(rule: AttachmentRuleInterface, baseForms: BaseForm[]) {

    console.log('attachmentToggle', rule, baseForms);
    for (var k in baseForms) {
      var key                = +k;// to number
      var keyPlusOne         = key + 1;
      var isVisible: boolean = this.helperProvider.parseBoolean(rule[`attachment${keyPlusOne}`] || false);
      console.log(keyPlusOne, isVisible, typeof isVisible);
      baseForms[key].isHidden = !isVisible;
      baseForms[key].setIsRequired(isVisible);
      baseForms[key].label = rule[`attachment${keyPlusOne}_desc`] || `Attachment ${keyPlusOne}`;

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
  isContainerIn: boolean;
}
