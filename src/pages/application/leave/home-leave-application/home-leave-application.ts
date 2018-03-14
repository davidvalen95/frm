import {Component, ViewChild} from '@angular/core';
import {
  Alert,
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams, Platform, Refresher, Segment,
  Slides, ToastController,
} from 'ionic-angular';
import {
  ApiProvider, BadgeApiInterface, TextValueInterface, VisitationDataApiInterface,
  VisitationDataRecordsInterface,
  VisitationFilterApi
} from "../../../../providers/api/api";
import {UserProvider} from "../../../../providers/user/user";
import {BroadcastType, RootParamsProvider} from "../../../../providers/root-params/root-params";
import {Subscription} from "rxjs/Subscription";
import {AlertStatusInterface, HelperProvider} from "../../../../providers/helper/helper";
import {
  ApplyLeaveApplicationPage,
  ApplyLeaveApplicationParam
} from "../apply-leave-application/apply-leave-application";
import {HttpClient, HttpParams} from "@angular/common/http";
import {isString} from "ionic-angular/util/util";
import {Observable} from "rxjs/Observable";
import {
  LeaveApplicationActiveInterface, LeaveApplicationFilter, LeaveApplicationTopInterface,
  LeaveListInterface
} from "../ApiInterface";
import {HomeBaseInterface} from "../../../../app/app.component";
import {KeyValue} from "../../../../components/Forms/base-form";
import {IncompleteRecordFilterInterface} from "../../../myAttendance/incompleteRecord/IncompleteRecordApiInterface";
import {HomePage} from "../../../home/home";

/**
 * Generated class for the HomeLeaveApplicationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home-leave-application',
  templateUrl: 'home-leave-application.html',
})
export class HomeLeaveApplicationPage {


  public title: string = "Leave Application";
  public visitationData: VisitationDataApiInterface[] = [];

  public segmentValue: string = "summary";
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isInfiniteEnable: boolean = true;

  public pageParam: HomeLeaveApplicationParam = {isApproval:false};
  public badge: BadgeApiInterface;

  public leaveApplicationTop: LeaveApplicationFilter;

  public listData: LeaveApplicationActiveInterface;

  public summary:KeyValue[] = [];

  public filterRule = {};


  public eventBroadcaster
  public currentAlert:AlertStatusInterface;
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;

  constructor(public platform:Platform,public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    this.setHardwareBackButton();
    console.log("visitationApplicationBadge", this.rootParam.visitationApplicationParam);

    this.pageParam = this.rootParam.homeLeaveApplicationParam;
    this.segmentValue = this.pageParam.isApproval ? "list" : "summary";
    this.title = this.pageParam.isApproval ? "Leave Approval" : "Leave Application";

    //# for filter too
    this.apiExecuteGetSummary();

    this.getList();


  }


  public alert(message: string, title?: string) {
    this.alertController.create(
      {
        title: title || "",
        subTitle: message,
        buttons: ['Ok']
      }
    ).present();
  }

  doInfinite(infinite: InfiniteScroll) {
    if (!this.visitationData || !this.visitationData[0]) {
      return;
    }
    if (this.visitationData.length >= (this.visitationData[0].maxpage)) {
      // infinite.enable(false);
      this.isInfiniteEnable = false

    } else {
      // infinite.enable(true);

      this.isInfiniteEnable = true;
      // this.getList(this.visitationData.length + 1).then(data => {
      //   if (data) {
      //     infinite.complete();
      //
      //   }
      // });
    }
  }





  ionViewDidEnter() {//didleave


  }


  ionViewDidLeave() {//didenter

  }

  ionViewDidLoad() {


    //
    // //# overide back button
    // if(this.pageParam.isEditing || this.pageParam.isApply){
    //   this.navbar.backButtonClick = (e:UIEvent)=>{
    //
    //     if(this.formSlides.isBeginning()){
    //       this.leavePage();
    //     }
    //
    //
    //     this.slidePrevious();
    //
    //
    //   }
    // }

  }

  pushDetailPage(currentList: LeaveListInterface) {

    if(this.pageParam.isApproval){
      currentList.id = currentList.tid;
    }
    var param: ApplyLeaveApplicationParam = {
      isEditing: true,
      isApply: false,
      isApproval: this.pageParam.isApproval,
      list: currentList,
      title:this.title,
      onDidLeave: ()=>{
        this.getList();
      }
    }
    this.navCtrl.push(ApplyLeaveApplicationPage, param);
  }

  slideNext() {
    // if (this.formSlides && !this.slidingStatus.next && !this.formSlides.isEnd() ) {
    //   console.log('slidenext');
    //   this.slidingStatus.next = true;
    //   this.formSlides.lockSwipes(false);
    //   this.formSlides.slideNext(100);
    //   this.formSlides.lockSwipes(true);
    //   this.slidingStatus.position++;
    //   setTimeout(()=>{
    //     this.slidingStatus.next = false;
    //
    //   },400)
    // }
  }

  slidePrevious() {
    // if (this.formSlides && !    this.slidingStatus.previous && !this.formSlides.isBeginning()) {
    //   console.log('slideprevious');
    //
    //   this.slidingStatus.previous  = true;
    //
    //   this.formSlides.lockSwipes(false);
    //   this.formSlides.slidePrev(100);
    //   this.content.scrollToTop();
    //   this.formSlides.lockSwipes(true);
    //   setTimeout(()=>{
    //     this.slidingStatus.previous = false;
    //
    //   },400)
    //
    // }
  }

  setUpForms() {

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
    }else if (this.segmentValue == 'summary'){
      this.apiExecuteGetSummary();
    }

  }


  doRefresh(refresher:Refresher){
    refresher.complete();
    this.getList();
  }


  public getList() {
    // http://hrms.dxn2u.com:8888/hrm_test2/s/LeaveApplication_active?
    // http://hrms.dxn2u.com:8888/hrm_test2/s/LeaveApplicationApproval_active?_dc=1518086522349&mobile=true&searchBy=c.name&keyWord=&cmbYear=&cmbMonth=0&cmbStatus=PA&cmbDepartment=&user_id=MY040001&cmbType=&page=1&start=0&limit=25&callback=Ext.data.JsonP.callback86
    var loader = this.helperProvider.presentLoadingV2("Retrieving leave data");
    this.apiGetApplicationActive().toPromise().then((data: LeaveApplicationActiveInterface) => {

      this.listData = data;
      this.listData.data.forEach((currentLeaveList:LeaveListInterface)=>{
        currentLeaveList.isOpen = true;
      })
    }).catch((rejected) => {
      console.log('leaveApplicationGetListRejected', rejected);
    }).finally(() => {
      loader.dismiss();
    });


  }

  public newApply() {
    // var params:VisitationApplicationParam = {isApprover:false, title:"Visitation Application",isProvider:true,isApply:true}
    // this.navCtrl.push(VisitationApplicationPage,params);

    var param: ApplyLeaveApplicationParam = {
      leaveApplicationTop: this.leaveApplicationTop,
      isEditing: false,
      isApproval: this.pageParam.isApproval,
      isApply: true,
      title: this.title,
      onDidLeave: ()=>{
        this.getList();
      },
    };
    this.navCtrl.push(ApplyLeaveApplicationPage, param)
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
  public openUrl(url: string) {
    // var browser = new InAppBrowser(url,"_blank");
    // browser.
  }


  private apiGetApplicationActive(): Observable<LeaveApplicationActiveInterface> {
    //http://hrms.dxn2u.com:8888/hrm_test2/s/LeaveApplication_active?_dc=1517821711125&mobile=true&cmbEmployee=MY080127&cmbYear=2018&cmbMonth=0&cmbStatus=&cmbType=AL&page=1&start=0&limit=25&callback=Ext.data.JsonP.callback96
    // LeaveApplicationApproval_active


    var url = this.pageParam.isApproval ? "s/LeaveApplicationApproval_active" : "s/LeaveApplication_active";



    var params: any = {
      mobile: "true",
      cmbEmployee: this.userProvider.userSession.empId,
      page: "1",
      start: "0",
      limit: "50",
      user_id: this.userProvider.userSession.empId,
      emp_id: this.userProvider.userSession.empId,
    };

    params = this.helperProvider.mergeObject(params, this.filter);

    params["cmbMonth"] = params["cmbMonth"] == "" ? "0" : params["cmbMonth"];
    if(this.pageParam.isApproval){
      params['cmbStatus'] = 'PA';
    }

    return this.httpClient.get<LeaveApplicationActiveInterface>(`${ApiProvider.HRM_URL}${url}`, {params: params, withCredentials: true});


  }

  public apiExecuteGetSummary() {

    var url = `${this.pageParam.isApproval ? ApiProvider.HRM_URL+"s/LeaveApplicationApproval_top?mobile=true" :  ApiProvider.HRM_URL+"s/LeaveApplication_top?mobile=true" }`;

    var params: HttpParams = new HttpParams().set("mobile", "true")
      .append("cmd", "filter")
      .append("user_id", this.userProvider.userSession.empId);

    var promise: Promise<LeaveApplicationFilter> = this.httpClient.get<LeaveApplicationFilter>(url, {
      withCredentials: true,
      params: params
    }).toPromise();


    var loader = this.helperProvider.presentLoadingV2(this.pageParam.isApproval ? "Loading filter" : "Loading summary");
    promise.then((data: LeaveApplicationFilter) => {


      //# coonvert 5.0 -> 5

      for (var key in data.info) {
        // if (isString(data.info[key]))
          // data.info[key] = data.info[key].replace(".0", "");
      }

      this.leaveApplicationTop = data;
      this.setSummaryList(data);

      this.filterRule = data;

      this.filter.cmbSearch = 'c.name';





    }).catch(rejected => {
      console.log('apigetsummaryandlist', rejected);
      this.helperProvider.presentToast("Something error on loading data");
    }).finally(() => {
      loader.dismiss();
    })

  }


  public setSummaryList(applicationTop:LeaveApplicationFilter){

    if(!applicationTop.info){
      return;
    }


    this.summary.push({key:`Annual Leave Available as of ${this.helperProvider.getCurrentDate(false)}`,value:`${applicationTop.info.available}`});
    this.summary.push({key:`Annual Leave Available as of ${applicationTop.info.nextDate}`,value:`${applicationTop.info.availableNext}`});


    this.summary.push({key:`Annual Leave Entitlement (for the year)`,value:`${applicationTop.info.entitle}`});
    this.summary.push({key:`Annual Leave Carry Forward (last year)`,value:`${applicationTop.info.carry}`});
    this.summary.push({key:`Annual Leave Adjustment as of ${this.helperProvider.getCurrentDate(false)}`,value:`${applicationTop.info.adjustment}`});
    this.summary.push({key:`Total Leave (as at end of the year)`,value:`${applicationTop.info.total_leave}`});



    // if(applicationTop.info.taken_al > 0){
    if(true){
        this.summary.push({key:`Annual Leave Taken`,value:`${applicationTop.info.taken_al}`});
    }
    // if(applicationTop.info.taken_el > 0){
    if(true){
      this.summary.push({key:`Emergency Leave Taken`,value:`${applicationTop.info.taken_el}`});
    }
    this.summary.push({key:`Leave Balance (as at end of the year)`,value:`${applicationTop.info.balance}`});




    // if(applicationTop.info.taken_rl > 0){
    if(true){
      this.summary.push({key:`Replacement Leave Taken`,value:`${applicationTop.info.taken_rl}`});
    }


    this.summary.push({key:`Unpaid Leave Taken`,value:`${applicationTop.info.taken_ul}`});
    this.summary.push({key:`Special Paid Leave Taken`,value:`${applicationTop.info.taken_sl}`});
    this.summary.push({key:`Mecial Paid Leave Taken`,value:`${applicationTop.info.taken_ol}`});






  }

}

export interface HomeLeaveApplicationParam extends HomeBaseInterface{

}

//
