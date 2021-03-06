import {Component, ViewChild} from '@angular/core';
import {
  Alert,
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams, Platform,
  ToastController
} from 'ionic-angular';
import {AnnouncementListDataInterface, AnnouncementListInterface} from "../AnnouncementApi";
import {ApiGetConfigInterface, ApiProvider, BadgeApiInterface, VisitationFilterApi} from "../../../providers/api/api";
import {HttpClient} from "@angular/common/http";
import {AlertStatusInterface, HelperProvider} from "../../../providers/helper/helper";
import {UserProvider} from "../../../providers/user/user";
import {RootParamsProvider} from "../../../providers/root-params/root-params";
import {HomeBaseInterface} from "../../../app/app.component";
import {AnnouncementApplyPage, AnnouncementApplyParamInterface} from "../announcement-apply/announcement-apply";
import {BaseForm} from "../../../components/Forms/base-form";
import {HomePage} from "../../home/home";

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
  public filter:{adate_from,adate_to} = {
    adate_from: BaseForm.getAdvanceDate(-30 , new Date).toISOString(),
    adate_to: new Date().toISOString(),
  };
  public isInfiniteEnable: boolean = true;

  public pageParam: AnnouncementHomeParamInterface = {isApproval: false};
  public badge: BadgeApiInterface;


  public listData: AnnouncementListInterface;

  public filterRule: VisitationFilterApi = {};
  public eventBroadcaster
  public currentAlert:AlertStatusInterface;
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;

  constructor(public platform:Platform, public httpClient: HttpClient, public navCtrl:NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    console.log("visitationApplicationBadge", this.rootParam.visitationApplicationParam);

    this.setHardwareBackButton();
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


    var param: AnnouncementApplyParamInterface = {
      isEditing:true,isApply:false,
      isApproval: this.pageParam.isApproval,
      list: currentList,
      title: this.title,
      onDidLeave: ()=>{
        // this.getList();
      }
    }
    this.navCtrl.push(AnnouncementApplyPage, param);

    // this.helperProvider.showAlert(currentList.content, currentList.subject);
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
      adate_from: this.helperProvider.getServerDateFormat(new Date(this.filter.adate_from)),
      adate_to:  this.helperProvider.getServerDateFormat(new Date(this.filter.adate_to)),
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
      params: params,
      isHideLoader: true,
    }
    this.apiProvider.get<VisitationFilterApi>(config,(data:VisitationFilterApi)=>{
      this.filterRule = data;
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


export interface AnnouncementHomeParamInterface extends HomeBaseInterface{

}
