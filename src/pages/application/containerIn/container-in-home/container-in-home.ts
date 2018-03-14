import {Component, ViewChild} from '@angular/core';
import {
  Alert,
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams, Platform, Refresher,
  ToastController
} from 'ionic-angular';
import {HomeBaseInterface} from "../../../../app/app.component";
import {
  ContainerInDataInterface, ContainerInListDataInterface,
  ContainerInListInterface
} from "../ContainerInApiInterface";
import {
  ApiGetConfigInterface, ApiProvider, BadgeApiInterface,
  VisitationFilterApi
} from "../../../../providers/api/api";
import {HttpClient} from "@angular/common/http";
import {HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {RootParamsProvider} from "../../../../providers/root-params/root-params";
import {ContainerInApplyPage, ContainerInApplyParam} from "../container-in-apply/container-in-apply";
import {HomePage} from "../../../home/home";

/**
 * Generated class for the ContainerInHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-container-in-home',
  templateUrl: 'container-in-home.html',
})
export class ContainerInHomePage {




  public title: string = "Container Application";
  public visitationData: ContainerInDataInterface[] = [];

  public segmentValue: string = "list";
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isInfiniteEnable: boolean = true;

  public pageParam: ContainerInHomeParam = {isApproval: false, isContainerIn :true};



  public listData: ContainerInListInterface;

  public filterRule: VisitationFilterApi = {};
  public eventBroadcaster
  public currentAlert:AlertStatusInterface;
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;

  constructor(public platform:Platform, public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    this.setHardwareBackButton();
    console.log("visitationApplicationBadge", this.rootParam.visitationApplicationParam);

    this.pageParam = this.rootParam.containerInHomeParam;

    var inOut = this.pageParam.isContainerIn ? "In" : "Out";
    this.title = this.pageParam.isApproval ? `Container Approval` : `Container ${inOut} Application`;

    this.getFilter();
    this.getList();



  }

  private normaliseApi(){

  }

  //
  // doInfinite(infinite: InfiniteScroll) {
  //   if (!this.visitationData || !this.visitationData[0]) {
  //     return;
  //   }
  //   if (this.visitationData.length >= (this.visitationData[0].maxpage)) {
  //     this.isInfiniteEnable = false
  //
  //   } else {
  //
  //     this.isInfiniteEnable = true;
  //   }
  // }
  //




  ionViewDidEnter() {//didleave


  }


  ionViewDidLeave() {//didenter
    // this.userProvider.getBadge(true);
  }

  ionViewDidLoad() {


  }

  pushDetailPage(currentList: ContainerInListDataInterface) {

    if(this.pageParam.isApproval){
      // currentList.id = currentList.tid;
    }
    var param: ContainerInApplyParam = {
      isEditing:true,isApply:false,
      isApproval: this.pageParam.isApproval,
      list: currentList,
      title: this.title,
      isContainerIn: this.pageParam.isApproval ? currentList.container_out != 't' : this.pageParam.isContainerIn,
      onDidLeave: ()=>{
        this.getList();
      }
    }
    this.navCtrl.push(ContainerInApplyPage, param);
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


    var url = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/VisitationApplicationApproval_active" : (this.pageParam.isContainerIn ? "s/VisitationApplication_active" : "s/VisitationApplicationContainerout_active")}`;

    var params: any = {
      mobile: "true",
      cmbEmployee: this.userProvider.userSession.empId,
      page: "1",
      start: "0",
      limit: "500",
      user_id: this.userProvider.userSession.empId,
      container: "true",
      activepage: [1,100],
      inactivepage: [1,1]

    };

    this.filter["keyword"] = this.filter.keyWord;
    params = this.helperProvider.mergeObject(params, this.filter);

    if(this.pageParam.isApproval){
      params['cmbStatus'] = 'PA';
      params['searchBy'] = this.filter.cmbSearch;
    }

    var config:ApiGetConfigInterface = {
      url: url,
      params:params,
    };



    this.apiProvider.get<ContainerInListInterface>(config,(data:ContainerInListInterface)=>{
      this.listData = data;

      //# yang lama pake "data" yang baru pake "records" jadi di copy aj ake "data"
      this.listData.data = this.listData.records;
      this.listData.data.forEach((currentLeaveList:ContainerInListDataInterface)=>{
        currentLeaveList.isOpen = true;
      })
    });
  }

  public newApply() {

    var param: ContainerInApplyParam = {
      isApply: true,isEditing: false,
      isApproval:this.pageParam.isApproval,
      title: this.title,
      isContainerIn: this.pageParam.isContainerIn,

      onDidLeave: ()=>{
        this.getList();
      }
    };
    this.navCtrl.push(ContainerInApplyPage, param)
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


    this.filter.cmbStatus = "";
    var url = `${ ApiProvider.HRM_URL }${this.pageParam.isApproval ? "s/VisitationApplication_top" : "s/VisitationApplication_top"}`;

    if(this.pageParam.isApproval){
      this.filter.cmbStatus = "PA";
      this.filter.cmbSearch = "emp_name";
    }

    var params = {
      mobile: "true",
      cmd: "filter",
      container: true,
      user_id: this.userProvider.userSession.empId,
      approval: this.pageParam.isApproval,
    }

    var config:ApiGetConfigInterface = {
      url: url,
      params: params
    }
    this.apiProvider.get<VisitationFilterApi>(config,(data:VisitationFilterApi)=>{
      this.filterRule = data;
    })


  }

  public leavePage() {
    this.navCtrl.setRoot(HomePage);
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

export interface ContainerInHomeParam extends  HomeBaseInterface{

  isContainerIn:boolean;
}
