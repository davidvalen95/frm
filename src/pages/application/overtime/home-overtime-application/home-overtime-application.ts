import {Component, ViewChild} from '@angular/core';
import {
  Alert,
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams, Platform, Refresher, Segment,
  Slides, ToastController,
} from 'ionic-angular';
import {
  ApiGetConfigInterface,
  ApiProvider, BadgeApiInterface, TextValueInterface, VisitationDataApiInterface,
  VisitationDataRecordsInterface,
  VisitationFilterApi
} from "../../../../providers/api/api";
import {UserProvider} from "../../../../providers/user/user";
import {BroadcastType, RootParamsProvider} from "../../../../providers/root-params/root-params";
import {Subscription} from "rxjs/Subscription";
import {HelperProvider} from "../../../../providers/helper/helper";

import {HttpClient, HttpParams} from "@angular/common/http";
import {isString} from "ionic-angular/util/util";
import {Observable} from "rxjs/Observable";
import {
  ApplyOvertimeApplicationPage,
  ApplyOvertimeApplicationParam
} from "../apply-overtime-application/apply-overtime-application";
import {OvertimeDataInterface, OvertimeListDataInterface, OvertimeListInterface} from "../ApiInterface";
import {HomeBaseInterface} from "../../../../app/app.component";
import {HomePage} from "../../../home/home";

/**
 * Generated class for the HomeOvertimeApplicationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home-overtime-application',
  templateUrl: 'home-overtime-application.html',
})
export class HomeOvertimeApplicationPage {



  public title: string = "Overtime Application";
  public visitationData: VisitationDataApiInterface[] = [];

  public segmentValue: string = "list";
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isInfiniteEnable: boolean = true;

  public pageParam: HomeOvertimeApplicationParam = {isApproval: false};
  public badge: BadgeApiInterface;


  public listData: OvertimeListInterface;

  public filterRule: VisitationFilterApi = {};
  public eventBroadcaster
  public currentAlert:Alert;
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;

  constructor(public platform:Platform, public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    this.setHardwareBackButton();
    console.log("visitationApplicationBadge", this.rootParam.visitationApplicationParam);

    this.pageParam = this.rootParam.homeOvertimeApplicationParam;
    this.title = this.pageParam.isApproval ? "Overtime Approval" : "Overtime Application";

    this.getList();
    this.getFilter();


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


  public leavePage() {
    this.navCtrl.setRoot(HomePage);
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


  ionViewDidEnter() {//didleave


  }


  ionViewDidLeave() {//didenter

  }

  ionViewDidLoad() {


  }

  pushDetailPage(currentList: OvertimeListDataInterface) {

    if(this.pageParam.isApproval){
      currentList.id = currentList.tid;
    }
    var param: ApplyOvertimeApplicationParam = {
      isEditing:true,isApply:false,
      isApproval: this.pageParam.isApproval,
      list: currentList,
      title: this.title,
      onDidLeave: ()=>{
        this.getList();
      }
    }
    this.navCtrl.push(ApplyOvertimeApplicationPage, param);
  }


  public ionSegmentChange() {
    if (this.segmentValue == 'list') {
      // this.visitationData = [];
      //get data
    } else if (this.segmentValue == "apply") {
      // this.setUpForms();
      this.newApply();
      setTimeout(() => {
        this.segmentValue = 'list';

      }, 100);
    }

  }


  doRefresh(refresher:Refresher){
    refresher.complete();
    this.getList();
  }


  public getList() {

    //# api
    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_active?_dc=1518061538463&mobile=true&cmbEmployee=MY080127&cmbYear=2018&cmbMonth=0&cmbStatus=&page=1&start=0&limit=25&callback=Ext.data.JsonP.callback65



    var url = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/OvertimeApplicationApproval_active" :"s/OvertimeApplication_active"}`;

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
    this.apiProvider.get<OvertimeListInterface>(config,(data:OvertimeListInterface)=>{
      this.listData = data;
      this.listData.data.forEach((currentLeaveList:OvertimeListDataInterface)=>{
        currentLeaveList.isOpen = true;
      })
    });
  }

  public newApply() {

    var param: ApplyOvertimeApplicationParam = {
      isApply: true,isEditing: false,
      isApproval:this.pageParam.isApproval,
      title: this.title,
      onDidLeave: ()=>{
        this.getList();
      }

    };
    this.navCtrl.push(ApplyOvertimeApplicationPage, param)
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


    var url = `${ ApiProvider.HRM_URL }${this.pageParam.isApproval ? "s/OvertimeApplicationApproval_top" : "s/OvertimeApplication_top"}`;


    if(this.pageParam.isApproval){
      this.filter.cmbStatus = "PA";
      this.filter.cmbSearch = "c.name"
    }


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
    })


  }

}


export interface HomeOvertimeApplicationParam extends HomeBaseInterface{

}
