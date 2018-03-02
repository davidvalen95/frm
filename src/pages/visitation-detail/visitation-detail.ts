import {Component, ViewChild} from '@angular/core';
import {Alert, AlertController, IonicPage, Loading, NavController, NavParams, ToastController} from 'ionic-angular';
import {
  ApiProvider, EmployeeInformationInterface, VisitationDataApiInterface, VisitationDataDetailInterface,
  VisitationDataRecordsInterface, HistoryBaseInterface
} from "../../providers/api/api";
import {UserProvider} from "../../providers/user/user";
import {BaseForm, InputType, KeyValue} from "../../components/Forms/base-form";
import {isBoolean, isUndefined} from "ionic-angular/util/util";
import {BroadcastType, RootParamsProvider} from "../../providers/root-params/root-params";
import {
  PageForm,
  VisitationApplicationPage,
  VisitationApplicationParam
} from "../application/visitation-application/visitation-application";
import {NgForm} from "@angular/forms";
import {HelperProvider} from "../../providers/helper/helper";

/**
 * Generated class for the VisitationDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-visitation-detail',
  templateUrl: 'visitation-detail.html',
})
export class VisitationDetailPage {

  public visitationData: VisitationDataRecordsInterface;
  public keyValueContainer: KeyValueContainer[]                = []
  public visitationDetailObject: VisitationDataDetailInterface = null;
  public isCanApprove                                          = false;
  public title: string                                         = ""
  public isApprover: boolean                                   = false;
  public isCanAcknowledge                                      = false;
  public isCanEdit                                             = false;
  public pageParam: VisitationDetailPageParam;
  public historyContainer: KeyValueContainerV2                 = {
    name: "History Approval",
    keyValue: [],
    isOpen: false,
  }
  public additionalForm: PageForm;

  @ViewChild('idAdditionalForm') idAdditionalForm:NgForm;

  constructor(public helperProvider:HelperProvider, public navCtrl: NavController, public navParams: NavParams, public userProvider: UserProvider, public apiProvider: ApiProvider, public alertCtrl: AlertController, public toastCtrl: ToastController, public rootParam: RootParamsProvider) {




    //# set form in getvisitationDetail
    this.additionalForm = {
      isHidden: false,
      baseForms: [],
      title: "Additional",
      id: 1,
      isOpen: true,
    }

    this.isApprover     = navParams.get("isApprover");
    this.visitationData = navParams.get("visitationData");


    this.pageParam = navParams.data;
    this.title     = navParams.get("title");

    console.log('visitationDetailApprover', this.isApprover)

    var isVisitation: boolean = navParams.get('isVisitation');
    if (isVisitation) {
      this.keyValueContainer.push({
        name: "Form  Information",
        key: ["created_user","created_name", "created_date", "requisition_type"],
        value: [],
        isOpen: true,
      }, {
        name: "Visitor Information",
        key: ["visitor category",  "visitor country", "visitor company",  "visitor_name", "visitor_gender","member_id","member_name",  "mobile_no", "IC_No. / Passport No.","tryial" , "companion", "companion_remark",],
        value: [],
        isOpen: true,
      }, {
        name: "Vehicle Information",
        key: ["with_vehicle", "vehicle_type", "vehicle_no"],
        value: [],
        isOpen: true,
      }, {
        name: "Host Information",
        key: ["host_ext", "host_id", "host_name__", "host_ext"],
        value: [],
        isOpen: true,
        isHidden: false,
      }, {
        name: "Visitation Detail",
        key: ["visitation_date", "visitation_time", "visitation", "purpose", "destination"],
        value: [],
        isOpen: true,
      }, {
        name: "Additional Information",
        key: ["remark"],
        value: [],
        isOpen: true,
      })
    } else {

    }
    this.getVisitationDetail();

    // acknowledgement && visitation_status.equals("in") && !acknowledged && isHost && status.equals("AP")
  }


  ionViewWillLeave() {
    if (this.pageParam.isVisitation) {
      //# in viewWillLeave to trigger before thepop

      // this.rootParam.broadcast.next(BroadcastType.visitationPageOnResume);
    }
  }

  ionViewDidLeave(){
    if(this.pageParam.visitationDetailDidLeave){
      this.pageParam.visitationDetailDidLeave();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VisitationDetailPage', this.navParams.get("title"));
  }


  private getVisitationDetail() {
    var loading:Loading = this.helperProvider.presentLoadingV2("Fetching Data");

    this.apiProvider.getVisitationDetail(this.userProvider.userSession, this.visitationData.id).then((data: any) => {
      console.log('rawvisitatildetail', data)
      var detail: VisitationDataDetailInterface = (data["data"] as VisitationDataDetailInterface);
      // detail.host
      this.keyValueContainer[3].isHidden = detail.host_id === null || detail.host_id == "";
      var otherHostId                           = (detail.other_host_id || "").split(';');
      var isIamOtherHost: boolean               = false;
      otherHostId.map((value) => {
        if (value == '') {
          return;
        }
        if (value == this.userProvider.userSession.userId) {
          isIamOtherHost = true;
        }
      })
      var isMeTheHost = (detail.host_id == this.userProvider.userSession.empId || isIamOtherHost)


      var visitationStatus: boolean = ( detail.visitation_status != null && detail.visitation_status.toLowerCase() == 'in');
      // this.isCanApprove         =
      //   !detail.acknowledged &&
      //   detail.host_id == this.userProvider.userSession.empId &&
      //   visitationStatus &&
      //   detailStatus
      // ;
      this.isCanApprove     = (detail.status == null || detail.status.toLowerCase() == 'pa' || detail.status.toLowerCase() == 'pe') && this.isApprover;
      this.isCanAcknowledge = !detail.acknowledged &&
        isMeTheHost &&
        visitationStatus;
      //# pa pending approval, pe sybmited, im the host or creator, and not approve ack
      this.isCanEdit        = !this.isCanApprove && !this.isCanAcknowledge && detail.status != null && (detail.status.toLowerCase() == 'pa' || detail.status.toLowerCase() == 'pe' ) && (detail.emp_id == this.userProvider.userSession.empId || isMeTheHost);


      //#setup form
      var remark: BaseForm    = new BaseForm("Remark", "remark");
      remark.inputType        = InputType.textarea;
      remark.rules.isRequired = false;
      remark.label            = this.isCanApprove ? "Approver Remark" : (this.isCanAcknowledge ? "Acknowledge Remark" : "Remark");
      remark.rules.isRequired = this.isCanApprove;

      var notifyEmail: BaseForm = new BaseForm("Trigger Alert", "alert_employee");
      notifyEmail.infoBottom    = "Trigger alert email notification with approver remark to employee";
      notifyEmail.setInputTypeSelect([{
        key: "Yes",
        value: "t"
      }, {
        key: "No",
        value: "f"
      }
      ])
      notifyEmail.value = "f";

      if (this.isCanApprove) {
        notifyEmail.isHidden = false;
      }
      if (this.isCanAcknowledge) {
        notifyEmail.isHidden = true;

      }


      this.additionalForm.isHidden = !this.isCanAcknowledge && !this.isCanApprove;


      this.additionalForm.baseForms.push(remark, notifyEmail);


      console.log('isCanAcknowledge', this.isCanAcknowledge, !detail.acknowledged, (detail.host_id == this.userProvider.userSession.empId || isIamOtherHost), visitationStatus)
      console.log('isCanEdit', this.isCanEdit, detail.status, detail.emp_id, this.userProvider.userSession.empId)
      this.visitationDetailObject = detail;

//ates
      for (var key in detail) {
        // var readableKey = key.replace(/_/g," ").toUpperCase();
        var value = detail[key];

        var result = this.convertForVisitation(key, value, data);
        if (key != "status" && result.value != null) {
          //# exclude status from the key value
          this.insertIntoKeyValue(result);
        }
        if (key == "host_id" && result.value != null) {
          //# get the name of host name
          this.apiProvider.getEmployeeInformation(result.value).then((data: EmployeeInformationInterface) => {
            console.log('host_name',data);
            this.insertIntoKeyValue({key: "host_name__", value: `${data.emp_name} (${data.dept_name})`})

          }).catch((rejected) => {
            this.insertIntoKeyValue({key: "host_name__", value: "No Information"})

          })
        }
        if (key == "other_host_id" && result.value != null) {
          //# get all the id's name


          var bankSplit:string[] = [];
          (<string>result.value).split(";").forEach((split, index,) => {
            if (split == "" &&  (<string>result.value).split(";").length == index) {
              return;
            }
            //# space to dinstinct name without being noticed

            var space = "";
            for (var i = 0; i < index; i++) {
              space += " ";
            }
            // index+= 1;

            if(bankSplit.indexOf(split) <=-1){
              bankSplit.push((split));
              setTimeout(()=>{
                this.apiProvider.getEmployeeInformation(split).then((data: EmployeeInformationInterface) => {

                  //# register to the keycontainer
                  console.log('other_host_name',split);

                  this.keyValueContainer[3].key.push("other host(id/name)" + space);
                  // this.keyValueContainer[3].key.concat(["other host(id/name)" + space]);
                  console.log("keyvaluecontainer", this.keyValueContainer);
                  //# nambah value ke keyvaluecontainer[3]
                  if(data.emp_name && data.emp_name != ""){
                    this.insertIntoKeyValue({key: "other host(id/name)" + space, value: split + " / " + `${data.emp_name} (${data.dept_name})`})

                  }


                }).catch((rejected) => {
                  this.insertIntoKeyValue({key: "other_host_name", value: "No Information"})

                })
              },1000)
            }




          })

        }

      }
      if (<boolean> this.navParams.get("isVisitation")) {
        this.keyValueContainer[this.keyValueContainer.length - 1].value.push({
          key: "Visitation Status",
          value: data["visitationStatus"]
        });
        this.keyValueContainer[this.keyValueContainer.length - 1].value.push({
          key: "Current Status",
          value: data["currentStatus"]
        });
      }

      // this.keyValueContainer.forEach((data)=>{
      //   data.value.sort((a: KeyValue, b: KeyValue)=>{
      //     if (a.key < b.key) {
      //       return -1
      //     } else {
      //       return 1
      //     }
      //
      //   })
      // })


      //# history
      // var indexOfHistory:number = this.keyValueContainer.findIndex((currentKeyValue)=>{
      //
      //   if(currentKeyValue.name.toLowerCase() == "history"){
      //     return true;
      //   }
      // })
      // var historyKeyValueContainer:KeyValueContainer = this.keyValueContainer[indexOfHistory];
      // // data[""';']
      // this.keyValueContainer[indexOfHistory];
      // var historyData:VisitationHistoryInterface[] = data["history"];
      // historyData.forEach((currentHistoryData:VisitationHistoryInterface)=>{
      //   history
      // });



      var history:HistoryBaseInterface[] = data["history"]
      history.forEach((currentHistory,index)=>{

        var keyValue:KeyValue[] = [];
        keyValue.push({key:"No. ",value: "" + (index+1)});
        for(var key in currentHistory){
          var value = currentHistory[key];

          //# edit emp id to have emp name
          if(key == "emp_id"){
            key = "Employee"
            value += ` - ${currentHistory.emp_name}`;
          }

          //#disalow empname
          if(key != "emp_name"){
            keyValue.push({key:key,value:value});

          }

        }

        this.historyContainer.keyValue.push(keyValue);


      });

      // this.historyContainer.keyValue = data["history"];

      this.sortKeyValueContainer();

    }).catch((rejected) => {
      console.log('getvisitaitondetailrejected', rejected);
    }).finally(() => {
      loading.dismiss();
    });



  }

  acknowledge(visitationDetailObject: VisitationDataDetailInterface) {

    if(this.idAdditionalForm.invalid){
      this.alert("Please check field(s) mark in red");
      return;
    }


    var message = "acknowledge this";

    var remark            = this.additionalForm.baseForms[0];
    var emailNotification = this.additionalForm.baseForms[1];
    this.helperProvider.showConfirmAlert(message, () => {

      var loader:Loading = this.helperProvider.presentLoadingV2("acknowledging")

      this.apiProvider.acknowledge(this.visitationData.id, remark.value).then((data) => {

        var isSuccess: boolean = data["success"];
        if (isSuccess) {
          this.getVisitationDetail();
          this.isCanApprove = false;
          message           = data["message"];


        }
      }).catch((rejected) => {
        message = rejected.toString();
        console.log("approve rejected", rejected);
      }).finally(() => {
        loader.dismiss();
        this.navCtrl.pop({}, () => {
          this.toastCtrl.create({
            message: `Application is acknowledged successfully`,
            position: "bottom",
            duration: 2000,
          }).present();
        });
        // this.helperProvider.presentToast(message);
      })
    });





  }

  alert(message: string, title?: string) {
    this.alertCtrl.create(
      {
        title: title || "",
        subTitle: message,
        buttons: ['Ok']
      }
    ).present();
  }

  approval(visitationDetailObject: VisitationDataDetailInterface, status: string) {


    if(this.idAdditionalForm.invalid){
      this.alert("Please check field(s) mark in red");
      return;
    }

    var message = status.toLowerCase() == "ap" ? "Approve" : "Reject";

    var remark            = this.additionalForm.baseForms[0];
    var emailNotification = this.additionalForm.baseForms[1];
    this.helperProvider.showConfirmAlert(message, () => {
      if (remark.value == "") {
        this.toastCtrl.create({
          message: "Not commited, remark cannot be empty",
          position: "bottom",
          duration: 2000,
        }).present();
        return;
      }

      var params                          = this.visitationDetailObject;
      params["visitation_application_id"] = this.visitationData.id;
      params["approver_id"]               = this.userProvider.userSession.empId;
      params["approver_remark"]           = remark.value
      params["status"]                    = status;
      params["requisition_type"]          = this.visitationDetailObject.requisition_type;
      params["alert_employee"]            = emailNotification.value
      var loading = this.helperProvider.presentLoadingV2("Submiting Form");

      this.apiProvider.visitationApproval(params).then((data) => {
        console.log("visitationDetail.approval.apiprovider", data);
        this.navCtrl.pop({}, () => {
          this.toastCtrl.create({
            message: `Application is ${message} successfully`,
            position: "bottom",
            duration: 2000,
          }).present();
        });
      }).catch(e => {
        console.log(e)
      }).finally(() => {
        loading.dismiss()

      });
    });


  }


  getObjectInArray(array: any, column: string, value: any) {


    for (var key in array) {
      if (array[key][column] == value) {
        return array[key]
      }
    }
    return null;
  }


  selectForVisitation(key: string, value: any, data: any) {
    var isStaff: boolean  = (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "s002";
    var isMember: boolean = (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "m001" || (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "m002" || (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "vip";

    if (isStaff) {
      switch (key) {
        case "visitor_no"://visitorCompany
        case "outsider_code":
          key = "x";
          break;
      }

    }

    if (isMember) {
      switch (key) {
        case "outsider_code":
          key = "x";
          break;
      }
    }

    // console.log('converforvisitation', key)
    return {key: key, value: value};
  }

  convertForVisitation(key: string, value: any, data: any) {
    var isMember: boolean = (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "m001" || (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "m002" || (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "vip";

    var afterFilter = this.selectForVisitation(key, value, data);
    key             = afterFilter.key;


    var oldKey = key;
    if (key == "destination_id") {
      var tempValue = this.getObjectInArray(data["destination"], "id", value);
      if (tempValue) {
        value = tempValue["destination"];
      }
      key = "destination";

    }


    if (key == "purpose_id") {
      var tempValue = this.getObjectInArray(data["purpose"], "id", value);
      if (tempValue) {
        value = tempValue["purpose"];
      }
      key = "purpose";

    }

    if (key == "outsider_code") {
      var tempValue = this.getObjectInArray(data["visitorcompany"], "outsider_code", value);
      if (tempValue) {
        value = tempValue["company_name"];
      }
      key = "visitor company";

    }

    if (key == "visitor_gender") {
      var tempValue = this.getObjectInArray(data["visitor_gender"], "code", value);
      if (tempValue) {
        value = tempValue["description"];
      }

    }

    if (key == "visitor_ct") {
      var tempValue = this.getObjectInArray(data["visitor_ct"], "ct_id", value);
      if (tempValue) {
        value = tempValue["ct_name"];
      }
      key = "visitor country";


    }

    if (key == "visitorcategory_code") {
      var tempValue = this.getObjectInArray(data["visitorcategory"], "visitorcategory_code", value);
      if (tempValue) {
        value = tempValue["visitorcategory_name"];
      }
      key = "visitor category";


    }

    if (key == "visitor_id") {
      // var tempValue = this.getObjectInArray(data["visitorcategory"], "visitorcategory_code", value);
      // if (tempValue) {
      //   value = tempValue["visitorcategory_name"];
      // }
      key = "employee_id";
      if (isMember)
        key = "member_id";
      value = this.visitationDetailObject.visitor_id;


    }

    if (key == "vehicle_info") {
      // var tempValue = this.getObjectInArray(data["visitorcategory"], "visitorcategory_code", value);
      // if (tempValue) {
      //   value = tempValue["visitorcategory_name"];
      // }
      key   = "with_vehicle";
      value = this.visitationDetailObject.vehicle_info.toLowerCase() == 't' ? "Yes" : "No";


    }

    if (key == "visitor_name") {
      // var tempValue = this.getObjectInArray(data["visitorcategory"], "visitorcategory_code", value);
      // if (tempValue) {
      //   value = tempValue["visitorcategory_name"];
      // }
      if (isMember)
        key = "member_name";


    }

    if (key == "visitor_no") {
      key   = "IC_No. / Passport No.";
      value = this.visitationDetailObject.visitor_no;

    }

    // if (key == "emp_name") {
    //   key   = "created_name";
    //   value = this.visitationDetailObject.emp;
    //
    // }
    if (isUndefined(key) || isUndefined(value)) {
      // alert(oldKey);
    }
    return {key: key, value: value};

  }

  public insertIntoKeyValue(currentKeyValue: { key, value }) {

    //# cek this.keyValueCOntainer punya key yang lagi dipush nda, kalo ada di insert di value nya


    //# dont want to show true/false
    if (isBoolean(currentKeyValue.value)) {
      return;
    }
    var isAdded = false;

    //# iterate sebanyak this.keyvaluelength
    for (var i in this.keyValueContainer) {
      if (this.keyValueContainer[i].key.indexOf(currentKeyValue.key) > -1) {
        isAdded = true;
        this.keyValueContainer[i].value.push(currentKeyValue)
      }
    }


  }

  public edit() {
    // var callback:(data:VisitationDataDetailInterface, tid:string)=>void = this.navParams.get("editCallback");
    // if(callback){
    //   callback(this.visitationDetailObject,this.visitationData.id);
    //   this.navCtrl.pop()
    // }
    var param: VisitationApplicationParam = {
      title: `Editing ${this.navParams.get("title")}`,
      editData: this.visitationDetailObject,
      editTid: this.visitationData.id,
      isEditing: true,
      isApprover: false,
    }
    this.navCtrl.push(VisitationApplicationPage, param);
    // this.navCtrl.pop({},()=>{
    //   this.navCtrl.push(VisitationApplicationPage,param)
    // });


  }


  delete() {
    var alert = this.alertCtrl.create({
      title: "Confirmation",
      message: "Are you sure to delete application?",
      buttons: [{text: "no", role: "cancel"},
        {
          text: "yes",
          handler: () => {
            var post    = this.visitationDetailObject;
            post["act"] = "delete"
            post["tid"] = this.visitationData.id;
            post["requisition_type"] = 'appointment';

            var message: string = "";

            var loading = this.helperProvider.presentLoadingV2("Submiting Form");

            this.apiProvider.submitVisitationAplyForm(post, ApiProvider.HRM_URL  + "s/VisitationApplication_op").then((data) => {
              console.log('submit form response', data);

              message                = data["message"]
              var isSuccess: boolean = data["success"];
              if (isSuccess) {

                setTimeout(() => {
                  // this.segmentValue = "list";
                  this.navCtrl.pop({}, () => {

                  });


                }, 1000)
              }

            }).catch(rejected => {
              message = rejected["message"]
              console.log('delete  rejected', rejected);
            }).finally(() => {
              loading.dismiss();
              this.helperProvider.presentToast(message)

            })
          }
        }]
    })

    alert.present();
  }

  // public showConfirmAlert(message: string, handler: () => void): Alert {
  //   var alert: Alert = this.alertCtrl.create({
  //     title: "Confirmation",
  //     message: `Are you sure to ${message}?`,
  //     buttons: [
  //       {text: "no", role: "cancel"},
  //       {
  //         text: "yes",
  //         handler: handler
  //       }
  //     ]
  //   })
  //   alert.present();
  //   return alert;
  // }


  public sortKeyValueContainer() {

    //# sort value's key to same as key[];

    //# all Container
    this.keyValueContainer.forEach((keyValueContainer: KeyValueContainer) => {




      keyValueContainer.value.sort((a, b) => {
        var indexA = keyValueContainer.key.indexOf(a.key)
        console.log('indexA', a, indexA);

        if (indexA <= -1) {
        }

        //if not found
        indexA     = indexA <= -1 ? keyValueContainer.value.length : indexA;
        var indexB = keyValueContainer.key.indexOf(b.key);
        console.log('indexB', b, indexB);

        if (indexB <= -1) {
        }

        indexB = indexB <= -1 ?  keyValueContainer.value.length :  indexB;

        //# -3 jadi -1 ,  3 jadi 1 , 0 = 0
        var normalize = indexA - indexB <= -1 ? -1 : indexA + indexB >= 1 ? 1 : 0;

        return  normalize;
        //
        // return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0);
      })
    })
  }


}


export interface VisitationDetailPageParam {
  visitationData: VisitationDataRecordsInterface;
  title: string;
  isVisitation?: boolean;
  isApprover?: boolean;
  editCallback?: (data: VisitationDataDetailInterface, tid: string) => void;
  visitationDetailDidLeave: () => void;

}


//# not good dont use this, doesnt match requirement
interface KeyValueContainer {
  name: string;
  key: string[];
  value: KeyValue[];
  isOpen: boolean;
  isHidden?:boolean;
}


//# not good dont use this, doesnt match requirement, use interface in detail-key-valueComponent
interface KeyValueContainerV2{

  name: string;
  isOpen: boolean;
  keyValue: KeyValue[][];

  //#[0]:[{keyValue},{keyValue},{eyValue}]

}

