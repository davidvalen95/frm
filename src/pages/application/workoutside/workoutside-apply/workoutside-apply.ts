import {Component, ViewChild} from '@angular/core';
import {
  Alert, AlertController, IonicPage, Navbar, NavController, NavParams, Platform,
  ToastController
} from 'ionic-angular';
import {ApplyBaseInterface} from "../../../../app/app.component";
import {
  WorkoutsideDataDetailInterface,
  WorkoutsideListDataInterface, WorkoutsideListInterface,
  WorkoutsideRuleInterface
} from "../WorkoutsideApiInterface";
import {BaseForm, KeyValue} from "../../../../components/Forms/base-form";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {MatureKeyValueContainer} from "../../../../components/detail-key-value/detail-key-value";
import {HttpClient} from "@angular/common/http";
import {ApiProvider, SuccessMessageInterface, TextValueInterface} from "../../../../providers/api/api";
import {HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {RootParamsProvider} from "../../../../providers/root-params/root-params";
import {NgForm} from "@angular/forms";
import {OvertimeHistoryInterface} from "../../overtime/ApiInterface";
import {AttachmentRuleInterface} from "../../leave/ApiInterface";
import {Observable} from "rxjs/Observable";
import { SectionFloatingInputInterface} from "../../../../components/Forms/section-floating-input/section-floating-input";

/**
 * Generated class for the WorkoutsideApplyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-workoutside-apply',
  templateUrl: 'workoutside-apply.html',
})
export class WorkoutsideApplyPage {


  public title: string;
  public segmentValue: string             = "form";
  public pageParam: WorkoutsideApplyParam = {isEditing: false, isApproval: false, isApply: true};
  public baseForms: BaseForm[]            = [];
  public approvalBaseForms:SectionFloatingInputInterface;
  public apiReplaySubject: { [key: string]: ReplaySubject<any> } = {};
  public attachmentValueContainer: object                        = {};
  public applyRule: WorkoutsideRuleInterface;
  public attachmentData: KeyValue[]                              = [];
  public isCanApprove: boolean                                   = false;

  public isCanAcknowledge: boolean = false;
  public isCanDelete: boolean      = false;
  public isCanSubmit: boolean      = false;

  public approvalHistoriesContainer: MatureKeyValueContainer[] = [];

  public sectionDataDetail: SectionFloatingInputInterface[] = [];
  public isDoneFetch:boolean = false;
  public firstDayConfig:string ='false';
  public currentAlert:Alert;


  @ViewChild(Navbar) navbar: Navbar;
  @ViewChild("parentForm") parentForm:NgForm;
  constructor(public platform:Platform, public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    this.setHardwareBackButton();

    this.pageParam = navParams.data;
    this.title = this.pageParam.title || "" ;

    // console.log('applyLeaveApplicationData', this.pageParam.leaveApplicationTop , this.pageParam.leaveApplicationTop.info,  this.pageParam.leaveApplicationTop.info.available);


    var loader = this.helperProvider.presentLoadingV2("Loading");
    this.apiGetApplyRule().toPromise().then((data: WorkoutsideRuleInterface) => {
      this.applyRule      = data;
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
    this.isCanDelete  = this.pageParam.isEditing && this.applyRule.approved == 0;
    this.isCanSubmit  = this.pageParam.isApply || ( this.pageParam.isEditing && this.applyRule.approved == 0);
    this.isCanApprove = this.pageParam.isApproval && this.applyRule.data.status.toLowerCase() != 'ca' && this.applyRule.allowEdit;
  }

  ionViewDidLoad() {

    //#override back button
    this.navbar.backButtonClick = (e: UIEvent) => {
      this.leavePage();this.navbar.backButtonClick = (e: UIEvent) => {
        this.leavePage();
      }
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


    this.approvalBaseForms = {      name: "For your approval",      baseForms: [status, approverRemark, alertEmail],      isHidden: false,      isOpen: true,      description: "",    }

    this.setNotEditable();

  }


  setupForms() {

    var firstDayConfig = new BaseForm('Apply first day time slot to all date',"");
    firstDayConfig.value = 'false';
    firstDayConfig.setInputTypeSelect([
      {key: "Yes",value:"true"},
      {key: "No",value:"false"},
    ]);
    firstDayConfig.infoBottom = "*Fill in time (24 hours format, hh:mm)<br/>" +
      "*Put 00:00 for rest time if not applicable<br/>" +
      "*Put all slot 00:00 to skip the date (Holiday/Off/Rest Day)<br/>";

    firstDayConfig.changeListener.subscribe((data)=>{
      this.firstDayConfig = data.value;
    })

    var name: BaseForm = new BaseForm("Employee", "employee");
    name.value         = this.pageParam.isEditing ? this.applyRule.data.emp_id : `${this.userProvider.userSession.empId} ${this.userProvider.userSession.name}`;
    name.isReadOnly    = true;
    name.isDisabled    = true;

    var createdDate        = new BaseForm("Created Date", "");
    createdDate.isReadOnly = true;
    createdDate.value      = this.applyRule.created_date;

    var dateFrom = new BaseForm("date from", "work_date_from");
    dateFrom.setInputTypeDate({});
    dateFrom.value = (this.pageParam.dateFrom || BaseForm.getAdvanceDate(1, new Date(this.applyRule.data.work_date_from))).toISOString();
    dateFrom.isReadOnly = this.pageParam.isFromAbsenceRecord || this.applyRule.changeDate == 'false';
    dateFrom.changeListener.subscribe((data)=>{
      if (new Date(dateTo.value) < new Date(dateFrom.value)) {
        dateTo.value = dateFrom.value;
      } else {

        dateTo.dateSetting.min = data.value;
        this.setDataDetailSection(null,dateFrom,dateTo,firstDayConfig);
      }

    });
    // dateFrom.isReadOnly = this.pageParam.isEditing;

    var dateTo = new BaseForm("date to", "work_date_to");
    dateTo.setInputTypeDate({});
    dateTo.value = (this.pageParam.dateFrom || BaseForm.getAdvanceDate(1, new Date(this.applyRule.data.work_date_to))).toISOString();
    dateTo.isReadOnly = this.pageParam.isFromAbsenceRecord || this.applyRule.changeDate == 'false';

    dateTo.changeListener.subscribe((data: BaseForm) => {
      this.setDataDetailSection(null,dateFrom,dateTo,firstDayConfig);
    });


    var eventType = new BaseForm("Event Type","event_type");
    eventType.value = this.applyRule.data.event_type;
    eventType.setInputTypeSelectChain<WorkoutsideRuleInterface>(this.apiGetApplyRule(),(data:WorkoutsideRuleInterface)=>{
      var keyValue: KeyValue[] = [];


      data.cmb_event_type.forEach((currentTextValue:TextValueInterface)=>{
        if(currentTextValue.text == ""){
          return;
        }
        keyValue.push({
          key: currentTextValue.text,
          value: currentTextValue.value,
        })
      });


      return keyValue;
    });

    var workLocation = new BaseForm("work location","work_location");
    workLocation.value = this.applyRule.data.work_location;
    workLocation.changeListener.subscribe((data:BaseForm)=>{
      data.value = this.helperProvider.ucWord(data.value);
    })

    var reason = new BaseForm("reason","reason");
    reason.value = this.applyRule.data.reason;
    reason.setInputTypeTextarea();



    //
    // firstDayConfig.changeListener.subscribe((data)=>{
    //   this.setDataDetailSection(null,dateFrom,dateTo,firstDayConfig);
    //
    // });


    this.baseForms.push(name,createdDate, dateFrom,dateTo,eventType,workLocation,reason ,firstDayConfig);
    this.setNotEditable();

    setTimeout(()=>{

      if(!this.pageParam.isFromAbsenceRecord){
        this.setDataDetailSection(this.applyRule.detail,dateFrom,dateTo,firstDayConfig);



      }

      setTimeout(()=>{
        this.isDoneFetch = true;
      },500)

    },500)
  }

  private setNotEditable() {

    this.baseForms.forEach((currentBaseForm: BaseForm) => {
      currentBaseForm.isReadOnly = (this.isCanSubmit && !this.pageParam.isApproval) ? currentBaseForm.isReadOnly : true;
    })

    this.sectionDataDetail.forEach(currentInputSection=>{
      currentInputSection.baseForms.forEach((currentBaseForm: BaseForm) => {
        currentBaseForm.isReadOnly = (this.isCanSubmit && !this.pageParam.isApproval) ? currentBaseForm.isReadOnly : true;
      })
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


      var url = `${ApiProvider.HRM_URL}s/WorkoutsideApplicationApproval_op`;
      this.currentAlert = this.helperProvider.showConfirmAlert("Commit Approval", () => {
        this.apiProvider.submitGet<SuccessMessageInterface>(url, param, (data: SuccessMessageInterface) => {
          this.navCtrl.pop();
          this.helperProvider.presentToast(data.message || "");
        })
      })
    } else {
      this.currentAlert = this.helperProvider.showAlert("Please check field(s) mark in red", "");
    }


  }

  formSubmit(form: NgForm) {

    var check:{isValid:boolean,message:string}[] = [];
    var isAllZero = true;
    this.sectionDataDetail.forEach(data=>{
      var timeIn = data.baseForms[0];
      var restIn = data.baseForms[2];
      var restOut = data.baseForms[1];
      var timeOut = data.baseForms[3];
      var day = data.name;
      check.push(this.isValidResOutRestIn(day,restOut,restIn));
      check.push(this.isValidRestOutTimeIn(day,restOut,timeIn));
      check.push(this.isValidSkipRestin(day, timeIn,timeOut,restOut,restIn));
      check.push(this.isValidTimeOutRestIn(day,timeOut,restIn));
      check.push(this.isValidTimeoutToTimeIn(day, timeOut,timeIn));
      if(!this.isZeroZero(timeIn,restIn,restOut,timeOut)){
        isAllZero = false;
      }
    })

    var isValid = true;
    var message = "";
    check.forEach((data)=>{
      if(!data.isValid){
        isValid = false;
        message += `<p>${data.message}</p>`
      }
    });
    if(!isValid || isAllZero){
      if(isAllZero){
        message = "Please fill in the Work Outside Time at least one of Work Outside date";
      }
      this.currentAlert = this.helperProvider.showAlert(message);
      return;
    }

    var test: object = {};
    if (form.valid) {
      console.log('formvalue', form.value);
      var json = this.helperProvider.convertToJson(form);
      console.log('jsonraw', json);

      json["emp_id"] = this.applyRule.data.emp_id;
      // json["half_date"]  = form.value.leave_date_from;
      json["sts"]    = this.pageParam.isEditing ? "update" : "save";
      json["tid"]    = this.pageParam.isEditing ? this.pageParam.list.id : this.userProvider.userSession.empId;
      json["userid"] = this.userProvider.userSession.empId;
      json["mobile"] = true;
      json["id"]     = this.pageParam.isEditing ? this.pageParam.list.id : -1;
      json           = this.helperProvider.convertIsoToServerDate(json, ["work_date_from","work_date_to"]);


      json = this.helperProvider.mergeObject(json, this.attachmentValueContainer);
      json = this.removeWrongDate(json);
      console.log('formSUbmit', json, this.attachmentValueContainer);


      // this.httpClient.post(url, )
      this.currentAlert = this.helperProvider.showConfirmAlert("Submit Application?", () => {

        this.apiExecuteSubmitApplication(json);
      });
    } else {
      this.currentAlert = this.helperProvider.showAlert("Please check field(s) mark in red", "");
    }

  }


  formDelete() {
    var json       = [];
    json["sts"]    = "delete";
    json["tid"]    = this.pageParam.list.id;
    json["id"]     = this.pageParam.list.id;
    json["userid"] = this.userProvider.userSession.empId;
    json["mobile"] = true;
    this.currentAlert = this.helperProvider.showConfirmAlert("delete this application", () => {
      this.apiExecuteSubmitApplication(json);
    });
  }


  public leavePage() {

    this.currentAlert = this.currentAlert = this.helperProvider.showConfirmAlert("leave this page", () => {
      this.navCtrl.pop({}, () => {

      });
    })
  }


  public setHardwareBackButton(){
    this.platform.ready().then(() => {

      this.platform.registerBackButtonAction(() => {
        try{
          this.currentAlert.dismiss().then(()=>{}).catch(()=>{        this.leavePage();});          return;
        }catch(exception){
          console.log(exception);
        }
        this.leavePage();

      });
    });
  }


  public getHistory() {
    if (this.applyRule.history) {

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

      var url    = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/WorkoutsideApplicationApproval_top" : "s/WorkoutsideApplication_top"}`;
      var params = {
        mobile: "true",
        cmd: this.pageParam.isEditing ? "edit" : "add",
        tid: this.pageParam.isEditing ? this.pageParam.list.id : this.userProvider.userSession.empId,
        user_id: this.userProvider.userSession.empId,
      }


      this.httpClient.get<WorkoutsideRuleInterface>(url, {
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

    var url = `${ApiProvider.HRM_URL}s/WorkoutsideApplication_op`;
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


  private setAttachmentData(data: WorkoutsideRuleInterface, fileForms: BaseForm[]) {


    fileForms.forEach((currentForm: BaseForm, index) => {
      var i = index + 1;

      var currentUrl: string = data[`attachment${i}url`];

      if (!currentUrl) {
        return;
      }
      currentForm.setFileAttachmentInfo(data.data[`attachment${i}`], `${ApiProvider.BASE_URL}${currentUrl}`);
    });


  }

  private setDataDetailSection(dataDetail:WorkoutsideDataDetailInterface[],dateFrom:BaseForm,dateTo:BaseForm,firstDayConfig:BaseForm){



    //# range 2 form
    var difDayPlusOne = this.helperProvider.getDifferentDay(dateFrom.value,dateTo.value) + 1;
    if(dataDetail == null) {
      dataDetail = [];
      for(var i = 0 ; i<difDayPlusOne ; i++){



        var advancedDate:string = this.helperProvider.getServerDateFormat(BaseForm.getAdvanceDate((i), new Date(dateFrom.value)));

        dataDetail.push({
          work_date: advancedDate,
          time_in: "00:00",
          rest_out: "00:00",
          rest_in: "00:00",
          time_out: "00:00",
        })
      }
    }else{
      console.log('setDataDetailSection not null',dataDetail);
    }




    this.sectionDataDetail.splice(0, this.sectionDataDetail.length);


    dataDetail.forEach((currentDataDetail:WorkoutsideDataDetailInterface,index)=>{


      var timeInOldValue = "00:00";
      var restOutOldValue = "00:00";
      var restInOldValue = "00:00";
      var timeOutOldValue = "00:00";

      var timeIn = new BaseForm("Time In",`time_in${index}`);
      timeIn.value = currentDataDetail.time_in;
      timeIn.setInputTypeTime();
      timeIn.isReadOnly = this.applyRule.changeDate == 'false';
      timeIn.changeListener.subscribe(data=>{
        if(this.firstDayConfig =='false')
        timeInOldValue = data.value;
      });
      var restOut = new BaseForm("rest Out",`rest_out${index}`);
      restOut.setInputTypeTime();
      restOut.setIsRequired(false);
      restOut.value = currentDataDetail.rest_out;
      restOut.isReadOnly = this.applyRule.changeDate == 'false';
      restOut.changeListener.subscribe(data=>{
        if(this.firstDayConfig =='false')
          restOutOldValue = data.value;
      });

      var restIn = new BaseForm("rest In",`rest_in${index}`);
      restIn.setInputTypeTime();
      restIn.setIsRequired(false);
      restIn.value = currentDataDetail.rest_in;
      restIn.isReadOnly = this.applyRule.changeDate == 'false';
      restIn.changeListener.subscribe(data=>{
        if(this.firstDayConfig =='false')
          restInOldValue = data.value;
      });

      var timeOut = new BaseForm("time Out",`time_out${index}`);
      timeOut.setInputTypeTime();
      timeOut.value = currentDataDetail.time_out;
      timeOut.isReadOnly = this.applyRule.changeDate == 'false';
      timeOut.changeListener.subscribe(data=>{
        if(this.firstDayConfig =='false')
          timeOutOldValue = data.value;
      });


      var workDate = new BaseForm("",`work_date${index}`);
      workDate.isHidden = true;
      workDate.value = currentDataDetail.work_date;

      //# siapin sectionFloatings
      var section: SectionFloatingInputInterface = {
        name: currentDataDetail.work_date,
        description: "",
        baseForms: [timeIn,restOut,restIn,timeOut,workDate],
        isOpen:true,
      };
      this.sectionDataDetail.push(section);

      if(dataDetail){
        // console.log
        console.log('setDataDetailSection sectionDetail',section);

      }


      firstDayConfig.changeListener.subscribe((data)=>{
        console.log('setDataDetailSection firstDayConfig', data);

        if(index>0 && firstDayConfig.value === "true"){
          var firstTimein = this.sectionDataDetail[0].baseForms[0]
          firstTimein.changeListener.subscribe((data)=>{
            if(firstDayConfig.value === "true")

              timeIn.value = data.value;
          });

          var firstRestOut = this.sectionDataDetail[0].baseForms[1]
          firstRestOut.changeListener.subscribe((data)=>{
            if(firstDayConfig.value === "true")
              restOut.value = data.value
          });

          var firstRestIn= this.sectionDataDetail[0].baseForms[2]
          firstRestIn.changeListener.subscribe((data)=>{
            if(firstDayConfig.value === "true")
              restIn.value = data.value
          });

          var firstTimeOut = this.sectionDataDetail[0].baseForms[3]
          firstTimeOut.changeListener.subscribe((data)=>{
            if(firstDayConfig.value === "true")
              timeOut.value = data.value
          });
        }else{


          if(this.isDoneFetch){
            timeIn.value = timeInOldValue;
            restIn.value = restInOldValue;
            restOut.value = restOutOldValue;
            timeOut.value = timeOutOldValue;
          }

        }


      })


      //# other than  0 listen to 0
      if(index>0 && firstDayConfig.value === "true"){
        var firstTimein = this.sectionDataDetail[0].baseForms[0]
        firstTimein.changeListener.subscribe((data)=>{
          if(firstDayConfig.value === "true")
          timeIn.value = data.value
        });

        var firstRestOut = this.sectionDataDetail[0].baseForms[1]
        firstRestOut.changeListener.subscribe((data)=>{
          if(firstDayConfig.value === "true")

            restOut.value = data.value
        });

        var firstRestIn= this.sectionDataDetail[0].baseForms[2]
        firstRestIn.changeListener.subscribe((data)=>{
          if(firstDayConfig.value === "true")

            restIn.value = data.value
        });

        var firstTimeOut = this.sectionDataDetail[0].baseForms[3]
        firstTimeOut.changeListener.subscribe((data)=>{
          if(firstDayConfig.value === "true")

            timeOut.value = data.value
        });
      }else{


        if(this.isDoneFetch){
          timeIn.value = timeInOldValue;
          restIn.value = restInOldValue;
          restOut.value = restOutOldValue;
          timeOut.value = timeOutOldValue;
        }

      }


    })


    console.log('workoutsideDataDetail',this.applyRule,dataDetail, this.sectionDataDetail)

    // this.dataDetailRule.sectionDataDetail = sectionContainer;
    this.setNotEditable();

  }

  private removeWrongDate(originJson:object){

    var json = Object.assign({},originJson);

    var indexOf:string[] = ["work_date","time_in","rest_in","rest_out","time_out"]

    console.log("beforeRemoveWrongDate",originJson);
    //# delete any form that contains
    for (var key in json){
      indexOf.forEach((string)=>{
        if(key.indexOf(string)>=0 && (key.indexOf("work_date_from") == -1) && key.indexOf("work_date_to") == -1){
          delete json[key];
        }
      })
    }


    //# copy to json
    this.sectionDataDetail.forEach((floatingInput:SectionFloatingInputInterface)=>{
      floatingInput.baseForms.forEach((currentBaseForm:BaseForm)=>{
        json[currentBaseForm.name] = currentBaseForm.value;
      })
    })

    return json;



  }





  // a. if time in 23:00 > time out 18:00 pls prompt "Time Out cannot less than Time In!"
  // b. if rest out < time in pls prompt "Rest Out cannot less than Time In!"
  // c. if rest out < rest in pls prompt "Rest In cannot less than Rest Out!"
  // d. if time out < rest in pls prompt "Time Out cannot less than Rest In!"
  // e. if (time in OR time out is 00:00) AND (rest out OR rest in not 00:00), prompt "Rest-In must be 00:00 if you want to skip this date!"


  private isZeroZero(...timeForm:BaseForm[]){

    var isZeroZero:boolean = true;
    timeForm.forEach(baseForm=>{
      if(baseForm.value != "00:00"){
        isZeroZero = false;
      }
    })

    return isZeroZero;
  }

  private isValidTimeoutToTimeIn(date, timeIn, timeOut):{isValid:boolean,message:string}{
    var timeInDate = new Date("2018-01-01T"+timeOut.value);
    var timeOutDate = new Date("2018-01-01T"+timeIn.value);

    var isValid = timeOutDate.getTime() >= timeInDate.getTime();
    var message = isValid ? "" :  `Time Out cannot less than Time In!  <b style="color:red">(${date})</b> `;

    return {isValid:isValid,message:message};
  }

  private isValidSkipRestin(date, timeIn:BaseForm, timeOut:BaseForm, restOut:BaseForm, restIn:BaseForm):{isValid:boolean,message:string}{
    var timeInDate = new Date("2018-01-01T"+timeIn.value);
    var timeOutDate = new Date("2018-01-01T"+timeOut.value);
    var restOutDate = new Date("2018-01-01T"+restOut.value);
    var restInDate = new Date("2018-01-01T"+restIn.value);

    var isValid = ( (timeIn.value != "00:00" && timeOut.value != "00.00") || (restOut.value == "00:00" && restIn.value == "00:00"));
    var message = isValid ? "" :  `Rest-In must be 00:00 if you want to skip this date!  <b style="color:red">(${date})</b> `;

    return {isValid:isValid,message:message};
  }



  private isValidTimeOutRestIn(date, a:BaseForm, b:BaseForm):{isValid:boolean,message:string}{
    var aDate = new Date("2018-01-01T"+a.value);
    var bDate = new Date("2018-01-01T"+b.value);

    var isValid = aDate.getTime() >= bDate.getTime();
    var message = isValid ? "" :  `Time Out cannot less than Rest In! <b style="color:red">(${date})</b> `;

    return {isValid:isValid,message:message};
  }

  private isValidResOutRestIn(date, a:BaseForm, b:BaseForm):{isValid:boolean,message:string}{
    var aDate = new Date("2018-01-01T"+a.value);
    var bDate = new Date("2018-01-01T"+b.value);

    var isValid = aDate.getTime() <= bDate.getTime();
    var message = isValid ? "" :  `Rest In cannot less than Rest Out!  <b style="color:red">(${date})</b> `;

    return {isValid:isValid,message:message};
  }


  private isValidRestOutTimeIn(date, a:BaseForm, b:BaseForm):{isValid:boolean,message:string}{
    var aDate = new Date("2018-01-01T"+a.value);
    var bDate = new Date("2018-01-01T"+b.value);

    var isValid = aDate.getTime() >= bDate.getTime();
    var message = isValid ? "" :  `Rest Out cannot less than Time In!  <b style="color:red">(${date})</b> `;

    return {isValid:isValid,message:message};
  }



}


export interface WorkoutsideApplyParam extends ApplyBaseInterface<WorkoutsideListDataInterface> {
  dateFrom?:Date;

}



