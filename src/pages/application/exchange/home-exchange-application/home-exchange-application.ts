import {Component, ViewChild} from '@angular/core';
import {
  Alert,
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams, Segment,
  Slides, ToastController,
} from 'ionic-angular';
import {
  ApiProvider, BadgeApiInterface, TextValue, VisitationDataApiInterface,
  VisitationDataRecordsInterface,
  VisitationFilterApi
} from "../../../../providers/api/api";
import {UserProvider} from "../../../../providers/user/user";
import {BroadcastType, RootParamsProvider} from "../../../../providers/root-params/root-params";
import {Subscription} from "rxjs/Subscription";
import {HelperProvider} from "../../../../providers/helper/helper";
import {
  ApplyExchangeApplicationPage,
  ApplyExchangeApplicationParam
} from "../apply-exchange-application/apply-exchange-application";
import {HttpClient, HttpParams} from "@angular/common/http";
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


  public title: string;
  public visitationData: VisitationDataApiInterface[] = [];

  public segmentValue: string        = "summary";
  public formSlides: Slides;
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isNeedHost: boolean         = true;
  public isInfiniteEnable: boolean   = true;

  public pageParam: HomeExchangeApplicationParam = {};

  public broadcast:Subscription = null;
  public badge:BadgeApiInterface ;

  public exchangeApplicationTop:ExchangeApplicationTopInterface = {};
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar:Navbar;
  @ViewChild(Content) public content: Content;

  constructor(public httpClient:HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider:HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    console.log("visitationApplicationParam", this.rootParam.visitationApplicationParam);






    this.rootParam.broadcast.next(BroadcastType.homeExchangeApplicationOnResume);

    if(this.broadcast == null ){
      console.log('broadcastSubscrive');
      this.broadcast = this.rootParam.broadcast.subscribe((data:BroadcastType)=>{
        if(data == null){
          return;
        }

        if(data == BroadcastType.homeExchangeApplicationOnResume){

          //# Do Get Page Data here on broadcast
        }

      });
    }


    this.apiGetSummaryAndList();
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
    if(!this.visitationData || !this.visitationData[0]){
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


  ngOnDestroy(){
    if(this.broadcast != null){
      this.broadcast.unsubscribe();
      this.broadcast.remove(this.broadcast);
      this.broadcast = null;

    }
  }


  ionViewDidEnter(){//didleave


  }


  ionViewDidLeave(){//didenter

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

  pushDetailPage(visitationData: VisitationDataRecordsInterface) {

    // var param: VisitationDetailPageParam = {
    //   visitationData: visitationData,
    //   title: this.pageParam.isApprover ? "Visitation Approval" : "Visitation Detail",
    //   isVisitation: true,
    //   isApprover: this.pageParam.isApprover,
    //   actionOnPop: () => {
    //     // this.getVisitation();
    //   }
    // }
    // this.navCtrl.push(VisitationDetailPage, param)
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
    } else if(this.segmentValue == "apply") {
        // this.setUpForms();
        this.newApply();
        setTimeout(()=>{
          this.segmentValue = 'summary';

        },100);
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


  public newApply(){
    // var params:VisitationApplicationParam = {isApprover:false, title:"Visitation Application",isProvider:true,isApply:true}
    // this.navCtrl.push(VisitationApplicationPage,params);

    var param: ApplyExchangeApplicationParam = {};
    this.navCtrl.push(ApplyExchangeApplicationPage,param)
  }


  public leavePage(){

    this.helperProvider.showConfirmAlert("leave this page",()=>{
      this.navCtrl.pop({},()=>{

      });

    })
  }

  public  openUrl(url:string){
    // var browser = new InAppBrowser(url,"_blank");
    // browser.
  }


  public apiGetSummaryAndList(){

    var url = `${ ApiProvider.HRM_URL }s/ExchangeApplication_top?mobile=true&cmd=filter&user_id=MY080127`;

    var params:HttpParams = new HttpParams().set("mobile","true")
      .append("cmd","filter")
      .append("user_id",this.userProvider.userSession.empId);

    var promise:Promise <ExchangeApplicationTopInterface> = this.httpClient.get<ExchangeApplicationTopInterface>(url, {params:params}).toPromise();


    var loader = this.helperProvider.presentLoadingV2("Loading data");
    promise.then((data:ExchangeApplicationTopInterface)=>{

    }).catch(rejected=>{
      this.helperProvider.presentToast("Something error on loading data");
    }).finally(()=>{
      loader.dismiss();
    })

  }

}

export interface HomeExchangeApplicationParam{

}

//

interface ExchangeApplicationTopInterface{
  cmbType?:TextValue[];
  cmbStatus?:TextValue[];
  cmbYear?:TextValue[];
  info?:InfoInterface;
}
interface InfoInterface{
  taken_el?,
  available?,
  currentDate?,
  taken_ol?,
  taken_rl?,
  taken_sl?,
  total_exchange?,
  entitle?,
  taken_ul?,
  nextCarry?,
  forfeitBalance?,
  balance?,
  adjustment?,
  carry?,
  taken_al?,
  availableNext?,
  nextDate?,
}
