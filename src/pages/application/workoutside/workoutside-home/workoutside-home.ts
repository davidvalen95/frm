import {Component, ViewChild} from '@angular/core';
import {
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams, Refresher,
  ToastController
} from 'ionic-angular';
import {HomeBaseInterface} from "../../../../app/app.component";
import {
  ApiGetConfigInterface,
  ApiProvider, BadgeApiInterface, VisitationDataApiInterface,
  VisitationFilterApi
} from "../../../../providers/api/api";
import {HttpClient, HttpParams} from "@angular/common/http";
import {HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {RootParamsProvider} from "../../../../providers/root-params/root-params";
import {
  WorkoutsideListDataInterface, WorkoutsideListInterface,
  WorkoutsideRuleInterface
} from "../WorkoutsideApiInterface";
import {WorkoutsideApplyPage, WorkoutsideApplyParam} from "../workoutside-apply/workoutside-apply";
import {Observable} from "rxjs/Observable";

/**
 * Generated class for the WorkoutsideHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-workoutside-home',
  templateUrl: 'workoutside-home.html',
})
export class WorkoutsideHomePage {


  public title: string = "Workoutside Application";
  public visitationData: VisitationDataApiInterface[] = [];

  public segmentValue: string = "list";
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isInfiniteEnable: boolean = true;

  public pageParam: WorkoutsideHomeParam = {isApproval: false};
  public badge: BadgeApiInterface;


  public listData: WorkoutsideListInterface;

  public filterRule: VisitationFilterApi = {};
  public eventBroadcaster
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;

  constructor(public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    console.log("visitationApplicationBadge", this.rootParam.visitationApplicationParam);

    this.pageParam = this.rootParam.workoutsideHomeParam;
    this.title = this.pageParam.isApproval ? "Work Outside Approval" : "Work Outside Application";

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

  pushDetailPage(currentList: WorkoutsideListDataInterface) {

    if(this.pageParam.isApproval){
      currentList.id = currentList.tid;
    }
    var param: WorkoutsideApplyParam = {
      isEditing:true,isApply:false,
      isApproval: this.pageParam.isApproval,
      list: currentList,
      onDidLeave: ()=>{
        this.getList();
      },
      title: this.title,
    }
    this.navCtrl.push(WorkoutsideApplyPage, param);
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



    var url = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/WorkoutsideApplicationApproval_active" :"s/WorkoutsideApplication_active?"}`;

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
    this.apiProvider.get<WorkoutsideListInterface>(config,(data:WorkoutsideListInterface)=>{
      this.listData = data;
      this.listData.data.forEach((currentLeaveList:WorkoutsideListDataInterface)=>{
        currentLeaveList.isOpen = true;
      })
    });
  }

  public newApply() {

    var param: WorkoutsideApplyParam = {
      isApply: true,isEditing: false,
      isApproval:this.pageParam.isApproval,
      onDidLeave: ()=>{
        this.getList();
      },
      title: this.title,
    };
    this.navCtrl.push(WorkoutsideApplyPage, param)
  }



  public getFilter() {

    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_top?mobile=true&cmd=filter&user_id=MY080127&callback=Ext.data.JsonP


    var url = `${ ApiProvider.HRM_URL }${this.pageParam.isApproval ? "s/WorkoutsideApplicationApproval_top" : "s/WorkoutsideApplication_top"}`;


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


export interface WorkoutsideHomeParam extends HomeBaseInterface{
}
