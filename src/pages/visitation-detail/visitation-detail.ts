import {Component} from '@angular/core';
import {Alert, AlertController, IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import {
  ApiProvider, EmployeeInformationInterface, VisitationDataApiInterface, VisitationDataDetailInterface,
  VisitationDataRecordsInterface
} from "../../providers/api/api";
import {UserProvider} from "../../providers/user/user";
import {KeyValue} from "../../components/Forms/base-form";
import {isBoolean, isUndefined} from "ionic-angular/util/util";
import {RootParamsProvider} from "../../providers/root-params/root-params";
import {
  VisitationApplicationPage,
  VisitationApplicationParam
} from "../application/visitation-application/visitation-application";

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
  public keyValueContainer: KeyValueContainer[] = []
  public visitationDetailObject: VisitationDataDetailInterface = null;
  public isCanApprove = false;
  public title: string = ""
  public isApprover: boolean = false;
  public isCanAcknowledge = false;
  public isCanEdit = false;
  public pageParam:VisitationDetailPageParam;
  constructor(public navCtrl: NavController, public navParams: NavParams, public userProvider: UserProvider, public apiProvider: ApiProvider, public alertCtrl: AlertController, public toastCtrl: ToastController, public rootParam:RootParamsProvider) {
    this.isApprover = navParams.get("isApprover");
    this.visitationData = navParams.get("visitationData");

    this.pageParam = navParams.data;
    this.title = navParams.get("title");

    this.getVisitationDetail();
    console.log('visitationDetailApprover', this.isApprover)

    var isVisitation:boolean = navParams.get('isVisitation');
    if(isVisitation){
      this.keyValueContainer.push({
        name: "Form  Information",
          key: ["created_name", "created_date", "requisition_type"],
        value: [],
        isOpen: true,
      }, {
        name: "Visitor Information",
          key: ["visitor category", "member_id","visitor country", "visitor company","companion", "companion_remark","visitor_name","member_name","mobile_no","ic_no"],
          value: [],
          isOpen: true,
      }, {
        name: "Vechile Information",
          key: ["with_vehicle","vehicle_type", "vehicle_no"],
          value: [],
          isOpen: true,
      }, {
        name: "Host Information",
          key: ["host_ext", "host_id", "host_name"],
          value: [],
          isOpen: true,
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
    }else{

    }
    // acknowledgement && visitation_status.equals("in") && !acknowledged && isHost && status.equals("AP")
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VisitationDetailPage', this.navParams.get("title"));
  }



  private getVisitationDetail() {
    this.apiProvider.getVisitationDetail(this.userProvider.userSession, this.visitationData.id).then((data: any) => {
      console.log('rawvisitatildetail', data)
      var detail: VisitationDataDetailInterface = (data["data"] as VisitationDataDetailInterface);
      var otherHostId = (detail.other_host_id || "").split(';');
      var isIamOtherHost:boolean = false;
      otherHostId.map((value)=>{
        if(value == ''){
          return;
        }
        if(value == this.userProvider.userSession.userId){
          isIamOtherHost = true;
        }
      })
      var isMeTheHost = (detail.host_id == this.userProvider.userSession.empId || isIamOtherHost)


      var visitationStatus: boolean =  ( detail.visitation_status != null && detail.visitation_status.toLowerCase() == 'in');
      // this.isCanApprove         =
      //   !detail.acknowledged &&
      //   detail.host_id == this.userProvider.userSession.empId &&
      //   visitationStatus &&
      //   detailStatus
      // ;
      this.isCanApprove = (detail.status == null || (detail.status.toLowerCase() == 'pa' || detail.status.toLowerCase() == 'pe') && this.isApprover);
      this.isCanAcknowledge = !detail.acknowledged &&
         isMeTheHost &&
        visitationStatus;
      this.isCanEdit = detail.status != null &&  (detail.status.toLowerCase() == 'pa' || detail.status.toLowerCase() == 'pe' ) && (detail.emp_id == this.userProvider.userSession.empId || isMeTheHost);

      console.log('isCanAcknowledge', this.isCanAcknowledge, !detail.acknowledged , (detail.host_id == this.userProvider.userSession.empId || isIamOtherHost) ,visitationStatus )
      console.log('isCanEdit', this.isCanEdit, detail.status , detail.emp_id, this.userProvider.userSession.empId )
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
          if(key == "host_id" && result.value != null ){
            //# get the name of host name
            this.apiProvider.getEmployeeInformation(result.value).then((data:EmployeeInformationInterface)=>{
              this.insertIntoKeyValue({key:"host_name",value:data.emp_name})

            }).catch((rejected)=>{
              this.insertIntoKeyValue({key:"host_name",value:"No Information"})

            })
          }
          if(key == "other_host_id" && result.value != null){
            //# get all the id's name

            (<string>result.value).split(";").forEach((split,index,)=>{
              if(split == ""){
                return;
              }
              //# space to dinstinct name without being noticed

              var space = "";
              for(var i =0;i<index;i++){
                space+= " ";
              }
              // index+= 1;

              this.apiProvider.getEmployeeInformation(split).then((data:EmployeeInformationInterface)=>{

                this.keyValueContainer[3].key.push("other host(id/name)"+space);
                console.log("keyvaluecontainer",this.keyValueContainer);
                //# nambah value ke keyvaluecontainer[3]
                this.insertIntoKeyValue({key:"other host(id/name)"+space,value:split+" / "+ data.emp_name})

              }).catch((rejected)=>{
                this.insertIntoKeyValue({key:"other_host_name",value:"No Information"})

              })
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

    }).catch((rejected) => {
      console.log('getvisitaitondetailrejected', rejected);
    }).finally(() => {
      this.apiProvider.dismissLoader()
    });
  }

  acknowledge(visitationDetailObject: VisitationDataDetailInterface) {

    var message: string = "";



    let prompt = this.alertCtrl.create({
      title: 'Remark ' + status,
      message: "Enter remark",
      inputs: [
        {
          name: 'remark',
          placeholder: 'Remark'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Commit',
          handler: data => {
            if (!data.remark || data.remark == "") {
              this.toastCtrl.create({
                message: "Not commited, remark cannot be empty",
                position: "bottom",
                duration: 1500,
              }).present()
              return;
            }

            this.apiProvider.acknowledge(this.visitationData.id, data.remark).then((data) => {
              var isSuccess: boolean = data["success"];
              if (isSuccess) {
                this.getVisitationDetail();
                this.isCanApprove = false;
                message = data["message"];
                this.navCtrl.pop();

              }
            }).catch((rejected) => {
              message = rejected.toString();
              console.log("approve rejected",rejected);
            }).finally(() => {
              this.apiProvider.dismissLoader();
              // this.apiProvider.presentToast(message);
            })
          }
        }
      ]
    });
    prompt.present();




  }

  approval(visitationDetailObject: VisitationDataDetailInterface, status: string) {



    let prompt = this.alertCtrl.create({
      title: 'Remark ' + status,
      message: "Enter remark",
      inputs: [
        {
          name: 'remark',
          placeholder: 'Remark'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Commit',
          handler: data => {
            if (!data.remark || data.remark == "") {
              this.toastCtrl.create({
                message: "Not commited, remark cannot be empty",
                position: "bottom",
                duration: 1500,
              }).present()
              return;
            }

            console.log("visitationDtail.approval",data);
            var params = this.visitationDetailObject;
            params["visitation_application_id"] = this.visitationData.id;
            params["approver_id"] = this.userProvider.userSession.empId;
            params["approver_remark"] = data.remark
            params["status"] = status;
            params["requisition_type"] = this.visitationDetailObject.requisition_type;
            this.apiProvider.visitationApproval(params).then((data) => {
              console.log("visitationDetail.approval.apiprovider",data);
              this.pageParam.actionOnPop();
              this.navCtrl.pop();
            }).catch(e => {
              console.log(e)
            }).finally(() => {
              this.apiProvider.dismissLoader();

            })
          }
        }
      ]
    });
    prompt.present();


  }


  getObjectInArray(array: any, column: string, value: any) {

    //#
    // visitorcompany	[…]
    // 0	{…}
    // outsider_code	C001
    // company_name	COMPANY A
    // 1	{…}
    // outsider_code	C002
    // company_name	COMPANY B
    // 2	{…}
    // outsider_code	C003
    // company_name	COMPANY C
    // 3	{…}
    //

    //# cek for each json in visitorcompany if contains value
    //# if correct then return that json
    //# get any value from that json

    for (var key in array) {
      if (array[key][column] == value) {
        return array[key]
      }
    }
    return null;
  }


  selectForVisitation(key:string,value:any,data:any){
    var isStaff:boolean = (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "s002";
    var isMember: boolean = (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "m001" || (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "m002" || (<string>data["data"]["visitorcategory_code"] || "").toLowerCase() == "vip";

    if(isStaff){
      switch(key){
        case "visitor_no"://visitorCompany
        case "mobile_no":
        case "outsider_code":
          key = "x";
          break;
      }

    }

    if(isMember){
      switch(key){
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

    var afterFilter = this.selectForVisitation(key,value,data);
    key = afterFilter.key;


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
      if(isMember)
        key = "member_id";
      value = this.visitationDetailObject.visitor_id;


    }

    if (key == "vehicle_info") {
      // var tempValue = this.getObjectInArray(data["visitorcategory"], "visitorcategory_code", value);
      // if (tempValue) {
      //   value = tempValue["visitorcategory_name"];
      // }
      key = "with_vehicle";
      value = this.visitationDetailObject.vehicle_info ? "yes" : "no";


    }

    if (key == "visitor_name") {
      // var tempValue = this.getObjectInArray(data["visitorcategory"], "visitorcategory_code", value);
      // if (tempValue) {
      //   value = tempValue["visitorcategory_name"];
      // }
      if(isMember)
        key = "member_name";


    }

    if(key == "visitor_no"){
      key = "ic_no";
      value = this.visitationDetailObject.visitor_no;

    }
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

  public edit(){
    // var callback:(data:VisitationDataDetailInterface, tid:string)=>void = this.navParams.get("editCallback");
    // if(callback){
    //   callback(this.visitationDetailObject,this.visitationData.id);
    //   this.navCtrl.pop()
    // }
    var param:VisitationApplicationParam = {
      title: `Editing ${this.navParams.get("title")}`,
      editData: this.visitationDetailObject,
      editTid:this.visitationData.id,
      isEditing: true,
      isApprover: false,
    }
    this.navCtrl.push(VisitationApplicationPage,param);
    // this.navCtrl.pop({},()=>{
    //   this.navCtrl.push(VisitationApplicationPage,param)
    // });




  }


  delete(){
    var alert = this.alertCtrl.create({
      title: "Confirmation",
      message: "Are you sure to delete application?",
      buttons:[{text:"no",role:"cancel"},
        {text:"yes",
         handler:()=>{
          var post = this.visitationDetailObject;
          post["act"] = "delete"
          post["tid"] = this.visitationData.id;

           var message: string = "";

           this.apiProvider.submitVisitationAplyForm(post, "s/VisitationApplication_op").then((data) => {
             console.log('submit form response', data);

             message = data["message"]
             var isSuccess: boolean = data["success"];
             if (isSuccess) {

               setTimeout(() => {
                 // this.segmentValue = "list";
                 this.pageParam.actionOnPop();
                 this.navCtrl.pop();


               }, 1000)
             }

           }).catch(rejected => {
             message = rejected["message"]
             console.log('delete  rejected', rejected);
           }).finally(() => {
             this.apiProvider.dismissLoader();
             this.apiProvider.presentToast(message)

           })
         }
        }]
    })

    alert.present();
  }

  public showConfirmAlert(message:string, handler:()=>void):Alert{
    var alert:Alert = this.alertCtrl.create({
      title:"Confirmation",
      message: `Are you sure to ${message}?`,
      buttons:[
        {text:"no",role:"cancel"},
        {
          text:"yes",
          handler:handler
        }
      ]
    })
    alert.present();
    return alert;
  }
}


export interface VisitationDetailPageParam {
  visitationData: VisitationDataRecordsInterface;
  title: string;
  isVisitation?: boolean;
  isApprover?: boolean;
  editCallback?: (data:VisitationDataDetailInterface,tid:string)=>void;
  actionOnPop:()=>void;

}

interface KeyValueContainer {
  name: string;
  key: string[];
  value: KeyValue[];
  isOpen: boolean;
}

