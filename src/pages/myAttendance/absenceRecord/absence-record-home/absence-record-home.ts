import {Component, ViewChild} from '@angular/core';
import {
  Alert,
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams, Platform, Refresher,
  ToastController
} from 'ionic-angular';
import {
  ApiGetConfigInterface,
  ApiProvider, BadgeApiInterface, VisitationDataApiInterface,
  VisitationFilterApi
} from "../../../../providers/api/api";
import {HomeBaseInterface} from "../../../../app/app.component";
import {AbsenceRecordListDataInterface, AbsenceRecordListInterface} from "../AbsenceRecordApiInterface2";
import {HttpClient} from "@angular/common/http";
import {AlertStatusInterface, HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {RootParamsProvider} from "../../../../providers/root-params/root-params";
import {AbsenceRecordApplyInterface, AbsenceRecordApplyPage} from "../absence-record-apply/absence-record-apply";
import {BaseForm} from "../../../../components/Forms/base-form";
import {HomePage} from "../../../home/home";
import {ApplyLeaveApplicationPage} from "../../../application/leave/apply-leave-application/apply-leave-application";
import {ApplyExchangeApplicationPage} from "../../../application/exchange/apply-exchange-application/apply-exchange-application";
import {WorkoutsideApplyPage} from "../../../application/workoutside/workoutside-apply/workoutside-apply";

/**
 * Generated class for the AbsenceRecordHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-absence-record-home',
  templateUrl: 'absence-record-home.html',
})
export class AbsenceRecordHomePage {




  public title: string = "Absence Record";
  public visitationData: VisitationDataApiInterface[] = [];

  public segmentValue: string = "list";
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isInfiniteEnable: boolean = true;

  public pageParam: AbsenceRecordHomeInterface = {isApproval: false};
  public badge: BadgeApiInterface;


  public listData: AbsenceRecordListInterface;

  public filterRule: VisitationFilterApi = {};
  public eventBroadcaster
  public currentAlert:AlertStatusInterface;
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;

  constructor(public platform:Platform, public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    console.log("visitationApplicationBadge", this.rootParam.visitationApplicationParam);
    this.setHardwareBackButton();
    this.pageParam = this.rootParam.homeOvertimeApplicationParam;
    this.title = this.pageParam.isApproval ? "Absence Record" : "Absence Record";
    this.getFilter();
    //# ada di getfilter ketika done
    // this.getList();


  }



  doInfinite(infinite: InfiniteScroll) {
    if (!this.visitationData || !this.visitationData[0]) {
      return;
    }
    if (this.visitationData.length >= (this.visitationData[0].maxpage)) {
      this.isInfiniteEnable = false

    } else {

      this.isInfiniteEnable = true;
    }
  }





  ionViewDidEnter() {//didleave


  }


  ionViewDidLeave() {//didenter

  }

  ionViewDidLoad() {


  }

  pushDetailPage(currentList: AbsenceRecordListDataInterface) {

    if(this.pageParam.isApproval){
    }
    var param: AbsenceRecordApplyInterface = {
      isEditing:true,isApply:false,
      isApproval: this.pageParam.isApproval,
      list: currentList,
      onDidLeave: ()=>{
        this.getList();
      }
    }
    this.navCtrl.push(AbsenceRecordApplyPage, param);
  }


  public ionSegmentChange() {
    // if (this.segmentValue == 'list') {
    //   // this.visitationData = [];
    //   //get data
    // } else if (this.segmentValue == "apply") {
    //   // this.setUpForms();
    //   this.newApply();
    //   setTimeout(() => {
    //     this.segmentValue = 'list';
    //
    //   }, 100);
    // }

  }



  doRefresh(refresher:Refresher){
    refresher.complete();
    this.getList();
  }

  public getList() {

    //# api
    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_active?_dc=1518061538463&mobile=true&cmbEmployee=MY080127&cmbYear=2018&cmbMonth=0&cmbStatus=&page=1&start=0&limit=25&callback=Ext.data.JsonP.callback65



    var url = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/AbsenceRecord_active" :"s/AbsenceRecord_active"}`;

    var params: any = {
      mobile: "true",
      cmbEmployee: this.userProvider.userSession.empId,
      page: "1",
      start: "0",
      limit: "500",
      user_id: this.userProvider.userSession.empId,

    };

    params = this.helperProvider.mergeObject(params, this.filter);
    params["cmbMonth"] = params["cmbMonth"] == "" ? "0" : params["cmbMonth"];

    if(this.pageParam.isApproval){
      params['cmbStatus'] = 'PA';
      params['searchBy'] = this.filter.cmbSearch;
    }

    var config:ApiGetConfigInterface = {
      url: url,
      params:params,
    };
    this.apiProvider.get<AbsenceRecordListInterface>(config,(data:AbsenceRecordListInterface)=>{
      this.listData = data;
      this.listData.data.forEach((currentLeaveList:AbsenceRecordListDataInterface)=>{
        currentLeaveList.isOpen = true;
      })
      this.listData.data = this.listData.data.filter((dataFilter)=>{
        return dataFilter.remark.toLowerCase().indexOf('absent') <= -1;
      })
    });
  }

  public newApply(pageString:string, record:AbsenceRecordListDataInterface) {
    var page = null;
    var title = "";
    switch(pageString){
      case "leave":
        page = ApplyLeaveApplicationPage
        title = "Apply Leave - Absence Record";
        break;
      case "exchange":
        page = ApplyExchangeApplicationPage
        title = "Apply Exchange - Absence Record";

        break;
      case "workoutside":
        title = "Apply Work Outside - Absence Record";
        page = WorkoutsideApplyPage
        break;
    }
    var param: AbsenceRecordApplyInterface = {
      isApply: true,isEditing: false,
      isApproval:this.pageParam.isApproval,
      title: title,
      isFromAbsenceRecord: true,
      onDidLeave: ()=>{
        this.getList();
      }
    };

    param["dateFrom"] = BaseForm.getAdvanceDate(1,new Date(record.absence_date));
    this.navCtrl.push(page, param)
  }

  // private apiGetApplicationActive(): Observable<LeaveApplicationActiveInterface> {
  //
  //   // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_active&mobile=true&cmbEmployee=MY080127&cmbYear=2018&cmbMonth=0&cmbStatus=&page=1&start=0&limit=25&callback=Ext.data.JsonP.callback65
  //
  //   var url = `${ApiProvider.HRM_URL}s/OvertimeApplication_active`;
  //
  //
  //   var params: any = {
  //     mobile: "true",
  //     cmbEmployee: this.userProvider.userSession.empId,
  //     page: "1",
  //     start: "0",
  //     limit: "50",
  //   };
  //
  //   params = this.helperProvider.mergeObject(params, this.filter);
  //
  //   params["cmbMonth"] = params["cmbMonth"] == "" ? "0" : params["cmbMonth"];
  //
  //   return this.httpClient.get<LeaveApplicationActiveInterface>(url, {params: params, withCredentials: true});
  //
  //
  // }

  public getFilter() {

    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_top?mobile=true&cmd=filter&user_id=MY080127&callback=Ext.data.JsonP


    this.filter.cmbStatus = "PE";

    var url = `${ ApiProvider.HRM_URL }${this.pageParam.isApproval ? "s/IncompletedRecord_top" : "s/IncompletedRecord_top"}`;



    var params = {
      mobile: "true",
      cmd: "filter",
      user_id: this.userProvider.userSession.empId
    }

    var config:ApiGetConfigInterface = {
      url: url,
      params: params
    }
    this.apiProvider.get<VisitationFilterApi>(config,(data:VisitationFilterApi)=>{
      this.filterRule = data;
      this.getList();

    })


  }



  public leavePage() {
    this.navCtrl.setRoot(HomePage);
  }

  ionViewWillEnter(){
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

}


export interface AbsenceRecordHomeInterface extends HomeBaseInterface{

}


