import {Component, ViewChild} from '@angular/core';
import {
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams,
  ToastController
} from 'ionic-angular';
import {
  ApiGetConfigInterface,
  ApiProvider, BadgeApiInterface, VisitationDataApiInterface,
  VisitationFilterApi
} from "../../../../providers/api/api";
import {HomeBaseInterface} from "../../../../app/app.component";
import {IncompleteRecordListDataInterface, IncompleteRecordListInterface} from "../IncompleteRecordApiInterface";
import {HttpClient} from "@angular/common/http";
import {HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {RootParamsProvider} from "../../../../providers/root-params/root-params";
import {
  IncompleteRecordApplyInterface,
  IncompleteRecordApplyPage
} from "../incomplete-record-apply/incomplete-record-apply";

/**
 * Generated class for the IncompleteRecordHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-incomplete-record-home',
  templateUrl: 'incomplete-record-home.html',
})
export class IncompleteRecordHomePage {

  public title: string = "Incomplete Record";
  public visitationData: VisitationDataApiInterface[] = [];

  public segmentValue: string = "list";
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isInfiniteEnable: boolean = true;

  public pageParam: IncompleteRecordHomeInterface = {isApproval: false};
  public badge: BadgeApiInterface;


  public listData: IncompleteRecordListInterface;

  public filterRule: VisitationFilterApi = {};
  public eventBroadcaster
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;

  constructor(public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    console.log("visitationApplicationBadge", this.rootParam.visitationApplicationParam);

    this.pageParam = this.rootParam.incompleteRecordHomeParam;
    this.title = this.pageParam.isApproval ? "Attendance Approval" :  "Incomplete Record";

    this.getFilter();
    this.getList();


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

  pushDetailPage(currentList: IncompleteRecordListDataInterface) {

    if(this.pageParam.isApproval){
      currentList.id = currentList.tid;
    }
    var param: IncompleteRecordApplyInterface = {
      isEditing:true,isApply:false,
      isApproval: this.pageParam.isApproval,
      list: currentList,
      onDidLeave: ()=>{
        this.getList();
      },
      title: this.title,
    }
    this.navCtrl.push(IncompleteRecordApplyPage, param);
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

  public getList() {

    //# api
    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_active?_dc=1518061538463&mobile=true&cmbEmployee=MY080127&cmbYear=2018&cmbMonth=0&cmbStatus=&page=1&start=0&limit=25&callback=Ext.data.JsonP.callback65



    var url = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/AttendanceApproval_active?" :"s/IncompletedRecord_active??"}`;

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
    this.apiProvider.get<IncompleteRecordListInterface>(config,(data:IncompleteRecordListInterface)=>{
      this.listData = data;
      this.listData.data.forEach((currentLeaveList:IncompleteRecordListDataInterface)=>{
        currentLeaveList.isOpen = true;
      })
    });
  }

  public newApply() {
    //
    // var param: WorkoutsideApplyParam = {
    //   isApply: true,isEditing: false,
    //   isApproval:this.pageParam.isApproval,
    //   onDidLeave: ()=>{
    //     this.getList();
    //   },
    //   title: this.title,
    // };

    // this.navCtrl.push(WorkoutsideApplyPage, param)
  }



  public getFilter() {

    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_top?mobile=true&cmd=filter&user_id=MY080127&callback=Ext.data.JsonP

    this.filter.cmbStatus = this.pageParam.isApproval ? "PA" : "PE";
    this.filter.cmbSearch = "a.emp_id";
    this.filter.cmbType = "";
    var url = `${ ApiProvider.HRM_URL }${this.pageParam.isApproval ? "s/AttendanceApproval_top" : "s/IncompletedRecord_top"}`;


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

export interface IncompleteRecordHomeInterface extends HomeBaseInterface{

}
