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
import {AlertStatusInterface, HelperProvider} from "../../../../providers/helper/helper";
import {
  ApplyExchangeApplicationPage,
  ApplyExchangeApplicationParam
} from "../apply-exchange-application/apply-exchange-application";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {ExchangeApplicationActiveInterface, ExchangeApplicationFilter, ExchangeListInterface} from "../ApiInterface";
import {HomeBaseInterface} from "../../../../app/app.component";
import {HomePage} from "../../../home/home";

/**
 * Generated class for the HomeExchangeApplicationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home-exchange-application',
  templateUrl: 'home-exchange-application.html',
})
export class HomeExchangeApplicationPage {


  public title: string               = "Exchange Alternate Off Application";
  public segmentValue: string        = "list";
  public formSlides: Slides;
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isNeedHost: boolean         = true;
  public isInfiniteEnable: boolean   = true;

  public pageParam: HomeExchangeApplicationParam = {isApproval: false};

  public broadcast: Subscription = null;
  public badge: BadgeApiInterface;
  public exchangeApplicationTop: ExchangeApplicationFilter;
  public listData: ExchangeApplicationActiveInterface;

  public filterRule: VisitationFilterApi = {};
  public currentAlert:AlertStatusInterface;


  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;

  constructor(public platform:Platform, public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    this.setHardwareBackButton();
    this.apiGetSummary();


    //# jgn lupa yg ini
    this.pageParam = this.rootParam.homeExchangeApplicationParam;

    this.title = this.pageParam.isApproval ? " Exchange Approval" : "Exchange Application";
    // this.title = this.pageParam.isApproval ? "Leave Approval" : "Leave Application";


    //g pake broadcast lagi
    // this.rootParam.broadcast.subscribe((type: BroadcastType) => {
    //     if (type == BroadcastType.homeExchangeApplicationOnResume) {
    //         this.getList();
    //     }
    // });
    //
    // this.rootParam.broadcast.next(BroadcastType.homeExchangeApplicationOnResume);

    this.getFilter();


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
  }


  ngOnDestroy() {
    if (this.broadcast != null) {
      this.broadcast.unsubscribe();
      this.broadcast.remove(this.broadcast);
      this.broadcast = null;

    }
  }


  ionViewDidEnter() {//didleave

    this.getList();

  }


  ionViewDidLeave() {//didenter

  }

  ionViewDidLoad() {

    console.log('ionviewdidload');
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


  ionViewWillEnter(){
    this.setHardwareBackButton();
  }
  pushDetailPage(currentExchangeList: ExchangeListInterface) {
    if (this.pageParam.isApproval) {
      currentExchangeList.id = currentExchangeList.tid;
    }
    var param: ApplyExchangeApplicationParam = {
      isEditing: true,
      isApply: false,
      isApproval: this.pageParam.isApproval,
      title: this.title,
      list: currentExchangeList,
      onDidLeave: () => {
        this.getList();
      }
    }
    this.navCtrl.push(ApplyExchangeApplicationPage, param);
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
      }, 500)

    }

  }

  //
  // public showConfirmAlert(message:string, handler:()=>void):Alert{
  //
  //   //#alertconfirmation
  //   var alert:Alert = this.alertController.create({
  //     title:"Confirmation",
  //     message: `Are you sure to ${message}?`,
  //     buttons:[
  //       {text:"no",role:"cancel"},
  //       {
  //         text:"yes",
  //         handler:handler
  //       }
  //     ]
  //   })
  //   alert.present();
  //   return alert;
  // }


  public newApply() {
    var param: ApplyExchangeApplicationParam = {
      isEditing: false,
      isApproval: this.pageParam.isApproval,
      isApply: true,
      title: this.title,
      onDidLeave: () => {
        this.getList();
      },
    };
    this.navCtrl.push(ApplyExchangeApplicationPage, param)
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


  /**
   * pake api provider yang baru
   */


  public apiGetSummary() {
    var url = `${ApiProvider.HRM_URL}s/ExchangeApplication_top?mobile=true&cmd=filter&`;

    var params: HttpParams = new HttpParams().set("mobile", "true")
      .append("cmd", "filter")
      .append("user_id", this.userProvider.userSession.empId);

    var promise: Promise<ExchangeApplicationFilter> = this.httpClient.get<ExchangeApplicationFilter>(url, {
      withCredentials: true,
      params: params
    }).toPromise();


    promise.then((data: ExchangeApplicationFilter) => {
      this.exchangeApplicationTop = data;

    }).catch(rejected => {
      console.log('apigetsummaryandlist', rejected);
      this.helperProvider.presentToast("Something error on loading data");
    }).finally(() => {
    })

  }


  private apiGetApplicationActive(): Observable<ExchangeApplicationActiveInterface> {
    var url = this.pageParam.isApproval ? "s/ExchangeApplicationApproval_active" : "s/ExchangeApplication_active";


    var params: any = {
      mobile: "true",
      cmbEmployee: this.userProvider.userSession.empId,
      page: "1",
      start: "0",
      limit: "50",
      user_id: this.userProvider.userSession.empId,
    };

    params = this.helperProvider.mergeObject(params, this.filter);

    params["cmbMonth"] = params["cmbMonth"] == "" ? "0" : params["cmbMonth"];
    if (this.pageParam.isApproval) {
      params['cmbStatus'] = 'PA';
    }

    return this.httpClient.get<ExchangeApplicationActiveInterface>(`${ApiProvider.HRM_URL}${url}`, {
      params: params,
      withCredentials: true
    });


  }

  doRefresh(refresher: Refresher) {
    refresher.complete();
    this.getList();
  }


  public getFilter() {

    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_top?mobile=true&cmd=filter&user_id=MY080127&callback=Ext.data.JsonP


    this.filter.cmbStatus = "";
    var url               = `${ ApiProvider.HRM_URL }${this.pageParam.isApproval ? "s/ExchangeApplicationApproval_top" : "s/ExchangeApplication_top"}`;

    if(this.pageParam.isApproval){
      this.filter.cmbStatus = "PA";
      this.filter.cmbSearch = "c.name";
    }


    var params = {
      mobile: "true",
      cmd: "filter",
      container: true,
      user_id: this.userProvider.userSession.empId,
      approval: this.pageParam.isApproval,
    }

    var config: ApiGetConfigInterface = {
      url: url,
      params: params,
      isHideLoader: true,
    }
    this.apiProvider.get<VisitationFilterApi>(config, (data: VisitationFilterApi) => {
      this.filterRule = data;
    })


  }

  public getList() {
    var loader = this.helperProvider.presentLoadingV2("Retrieving exchange data");
    this.apiGetApplicationActive().toPromise().then((data: ExchangeApplicationActiveInterface) => {
      this.listData = data;
      this.listData.data.forEach((currentExchangeList: ExchangeListInterface) => {
        currentExchangeList.isOpen = true;
      })
    }).catch((rejected) => {
      console.log('leaveApplicationGetListRejected', rejected);
    }).finally(() => {
      loader.dismiss();

      console.log('getlist', this.listData);
    });


  }


}

export interface HomeExchangeApplicationParam extends HomeBaseInterface {

}
