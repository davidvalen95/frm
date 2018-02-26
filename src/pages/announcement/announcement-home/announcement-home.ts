import {Component, ViewChild} from '@angular/core';
import {
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams,
  ToastController
} from 'ionic-angular';
import {AnnouncementListDataInterface, AnnouncementListInterface} from "../AnnouncementApi";
import {ApiGetConfigInterface, ApiProvider, BadgeApiInterface, VisitationFilterApi} from "../../../providers/api/api";
import {HttpClient} from "@angular/common/http";
import {HelperProvider} from "../../../providers/helper/helper";
import {UserProvider} from "../../../providers/user/user";
import {RootParamsProvider} from "../../../providers/root-params/root-params";
import {HomeBaseInterface} from "../../../app/app.component";
import {AnnouncementApplyPage, AnnouncementApplyParamInterface} from "../announcement-apply/announcement-apply";
import {BaseForm} from "../../../components/Forms/base-form";

/**
 * Generated class for the AnnouncementHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-announcement-home',
  templateUrl: 'announcement-home.html',
})
export class AnnouncementHomePage {



  public title: string                                   = "Overtime Application";
  public visitationData: AnnouncementListDataInterface[] = [];

  public segmentValue: string = "list";
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isInfiniteEnable: boolean = true;

  public pageParam: AnnouncementHomeParamInterface = {isApproval: false};
  public badge: BadgeApiInterface;


  public listData: AnnouncementListInterface;

  public filterRule: VisitationFilterApi = {};
  public eventBroadcaster
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;

  constructor(public httpClient: HttpClient, public navCtrl:NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    console.log("visitationApplicationBadge", this.rootParam.visitationApplicationParam);

    this.pageParam = this.rootParam.announcementParam;
    this.title = "Announcement";

    this.getList();
    // this.getFilter();


  }








  ionViewDidEnter() {//didleave


  }


  ionViewDidLeave() {//didenter

  }

  ionViewDidLoad() {


  }

  pushDetailPage(currentList: AnnouncementListDataInterface) {

    //
    // var param: AnnouncementApplyParamInterface = {
    //   isEditing:true,isApply:false,
    //   isApproval: this.pageParam.isApproval,
    //   list: currentList,
    //   title: this.title,
    //   onDidLeave: ()=>{
    //     this.getList();
    //   }
    // }
    // this.navCtrl.push(AnnouncementApplyPage, param);

    this.helperProvider.showAlert(currentList.sortcont, currentList.subject);
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





    var url = `${ApiProvider.HRM_URL}s/AnnouncementMobile`;

    var params: any = {
      act: "list",
      mobile: "true",
      userid: this.userProvider.userSession.empId,
      adate_from: this.helperProvider.getServerDateFormat(BaseForm.getAdvanceDate(-60,new Date())),
      adate_to: this.helperProvider.getServerDateFormat(BaseForm.getAdvanceDate(0,new Date())),
      limit: "3000",
      page:"1",
      start: "0",
    };

    var config:ApiGetConfigInterface = {
      url: url,
      params:params,
    };
    this.apiProvider.get<AnnouncementListInterface>(config,(data:AnnouncementListInterface)=>{
      this.listData = data;

      if(this.listData.data){
        this.listData.data.forEach((currentLeaveList:AnnouncementListDataInterface)=>{
          currentLeaveList.isOpen = true;
        })
      }

    });
  }

  public newApply() {

    // var param: ApplyOvertimeApplicationParam = {
    //   isApply: true,isEditing: false,
    //   isApproval:this.pageParam.isApproval,
    //   title: this.title,
    //   onDidLeave: ()=>{
    //     this.getList();
    //   }
    //
    // };
    // this.navCtrl.push(ApplyOvertimeApplicationPage, param)
  }


  public getFilter() {

    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_top?mobile=true&cmd=filter&user_id=MY080127&callback=Ext.data.JsonP


    var url = `${ ApiProvider.HRM_URL }${this.pageParam.isApproval ? "s/OvertimeApplicationApproval_top" : "s/OvertimeApplication_top"}`;


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


export interface AnnouncementHomeParamInterface extends HomeBaseInterface{

}
