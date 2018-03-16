import {Component, ViewChild} from '@angular/core';
import {
  Alert,
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams, Platform,
  ToastController, ViewController
} from 'ionic-angular';
import {
  ApiGetConfigInterface, ApiProvider, BadgeApiInterface, VisitationDataApiInterface,
  VisitationFilterApi
} from "../../providers/api/api";
import {HomeBaseInterface} from "../../app/app.component";
import {CalenderListInterface} from "./CalenderApiInterface";
import {HttpClient} from "@angular/common/http";
import {AlertStatusInterface, HelperProvider} from "../../providers/helper/helper";
import {UserProvider} from "../../providers/user/user";
import {RootParamsProvider} from "../../providers/root-params/root-params";
import {WorkoutsideListInterface} from "../application/workoutside/WorkoutsideApiInterface";
import {CalenderEventInterface} from "../../components/calender/calender";
import {BaseForm, DateSettingInterface} from "../../components/Forms/base-form";
import {HomePage} from "../home/home";
import {DatePickerProvider} from "ionic2-date-picker";

/**
 * Generated class for the CalenderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-calender',
  templateUrl: 'calender.html',
})
export class CalenderPage {


  public title: string                                = "Overtime Application";
  public visitationData: VisitationDataApiInterface[] = [];

  public segmentValue: string        = "list";
  public filter: CalenderFilter = new CalenderFilter();
  public isInfiniteEnable: boolean   = true;

  public pageParam: CalenderParamInterface = {isApproval: false};
  public badge: BadgeApiInterface;


  public listData: CalenderListInterface;

  public filterRule: CalenderFilter          = new CalenderFilter();
  public calenderEvents: CalenderEventInterface[] = [];
  public eventBroadcaster
  public currentAlert:AlertStatusInterface;

  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;


  public nextButton = (onFinish:()=>void)=>{
    this.getArrowCalender(1,onFinish);

  }

  public previousButton = (onFinish:()=>void)=>{
    this.getArrowCalender(-1,onFinish);

  }

  // public selectDay = (dayNumber:number)=>{
  //   // this.filter.selectedDay = dayNumber;
  // }

  constructor(public viewController:ViewController, public platform:Platform, public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {

    this.pageParam = this.navParams.data;
    console.log("visitationApplicationBadge", this.pageParam);

    this.setHardwareBackButton();



    this.title     = this.pageParam.pickerSetting ? "Select Date" : "Calendar";
    this.getFilter();
    this.getList(()=>{});


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

    setTimeout(()=>{
      // BaseForm.closeDatetimeIonicPicker();
    },200);
  }


  ionViewDidLeave() {//didenter

  }

  ionViewDidLoad() {


  }

  //
  // pushDetailPage(currentList: OvertimeListDataInterface) {
  //
  //   if(this.pageParam.isApproval){
  //     currentList.id = currentList.tid;
  //   }
  //   var param: ApplyOvertimeApplicationParam = {
  //     isEditing:true,isApply:false,
  //     isApproval: this.pageParam.isApproval,
  //     list: currentList,
  //     onDidLeave: ()=>{
  //       this.getList();
  //     }
  //   }
  //   this.navCtrl.push(ApplyOvertimeApplicationPage, param);
  // }
  //

  public ionSegmentChange() {
    if (this.segmentValue == 'list') {
      // this.visitationData = [];
      //get data
    } else if (this.segmentValue == "apply") {
      // this.setUpForms();
      // this.newApply();
      setTimeout(() => {
        this.segmentValue = 'list';

      }, 100);
    }

  }

  public getList(onFinish?:()=>void) {

    // st2/s/DXNCalendarAjax?reqtype=calendar&month=2&year=2018&seltype=0&user_id=MY040001

    var url = `${ApiProvider.HRM_URL}s/DXNCalendarAjax`;

    var params: any = {
      mobile: "true",
      cmbEmployee: this.userProvider.userSession.empId,
      page: "1",
      start: "0",
      limit: "500",
      user_id: this.userProvider.userSession.empId,
      reqtype: "calendar",
      seltype: 0

    };

    params             = this.helperProvider.mergeObject(params, this.filter);
    params["cmbMonth"] = params["cmbMonth"] == "" ? "0" : params["cmbMonth"];
    params['month']    = params['cmbMonth'];
    params['year']     = params['cmbYear'];
    if (this.pageParam.isApproval) {
      params['cmbStatus'] = 'PA';
      params['searchBy']  = this.filter.cmbSearch;
    }

    var isHideLoader = false;

    if(this.pageParam.pickerSetting){
      isHideLoader = true;
    }

    var config: ApiGetConfigInterface = {
      url: url,
      params: params,
      isHideLoader: isHideLoader
    };


    this.apiProvider.get<CalenderListInterface>(config, (data: CalenderListInterface) => {

      this.calenderEvents = null;
      this.listData = data;

      var calenderEvents: CalenderEventInterface[] = []
      data.leaves = data.leavenames;
      for (var key in data) {
        //# key:alternateoffdays: [],[],[],['deescroption text']
        if(
          key.toLowerCase() != "weeks" &&
          key.toLowerCase() != "leavenames" &&
          key.toLowerCase().indexOf("tid")==-1 &&
          key.toLowerCase().indexOf("_id") == -1
        ){


          var currentList: string[][]               = data[key];
          var calenderEvent: CalenderEventInterface = {
            legend: key,
            description: []
          }

          //# add to description per index
          currentList.forEach((arrayText, index) => {
            if (arrayText && arrayText.length != 0) {
              calenderEvent.description.push({
                dateIndex: index,
                text: arrayText,
                color: '#000',
              })
            }
          });
          calenderEvents.push((calenderEvent));
        }



      }

      this.calenderEvents = calenderEvents;
      if(onFinish){
        setTimeout(()=>{
          onFinish();
        },50)
      }
    });
  }

  public leavePage(){

    if(this.pageParam.pickerSetting){
      this.viewController.dismiss();
      return;
    }

    if(this.navCtrl.canGoBack()){
      this.navCtrl.pop();
    }else{
      this.navCtrl.setRoot(HomePage);
    }

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

  // public newApply() {
  //
  //   var param: ApplyOvertimeApplicationParam = {
  //     isApply: true,isEditing: false,
  //     isApproval:this.pageParam.isApproval,
  //     onDidLeave: ()=>{
  //       this.getList();
  //     }
  //   };
  //   this.navCtrl.push(ApplyOvertimeApplicationPage, param)
  // }

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


    var date:Date =  this.pageParam.pickerSetting ? new Date(this.pageParam.pickerSetting.baseForm.value) : new Date();

    this.filter.cmbMonth = "" + (date.getMonth() + 1);



    this.filter.selectedDay = date.getDate();

    this.filter.cmbYear = "" +  date.getFullYear();


  }




  public getArrowCalender(advanceMonth:number = 0,onFinish:()=>void){

    var mmm = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



    var filterDate = new Date();
    filterDate.setMonth(+this.filter.cmbMonth -1);
    filterDate.setFullYear(+this.filter.cmbYear);
    filterDate.setDate(this.filter.selectedDay);

    console.log('getArrowCalenderBefore', filterDate,this.filter.cmbMonth);
    filterDate = BaseForm.getAdvanceDate(advanceMonth * 30, filterDate);
    console.log('getArrowCalenderAfter', filterDate);

    this.filter.cmbMonth = ""+(filterDate.getMonth() + 1);
    this.filter.cmbYear = ""+filterDate.getFullYear();


    //# tanpa nunggu list
    if(this.pageParam.pickerSetting){
      if(onFinish){
        setTimeout(()=>{
          this.calenderEvents = [];
          onFinish();
        },50);
      }
    }
    this.getList();

  }

  public selectDatePicker(){


    if(this.pageParam.pickerSetting){
      var filterDate = new Date();
      filterDate.setMonth(+this.filter.cmbMonth -1);
      filterDate.setFullYear(+this.filter.cmbYear);
      filterDate.setDate(this.filter.selectedDay);
      console.log('selectedDayPage',filterDate, this.filter.selectedDay);

      this.pageParam.pickerSetting.onActivityResult(filterDate);
    }
    this.viewController.dismiss();

  }

  public cancelDatePicker(){
    // this.pageParam.pickerSetting.onActivityResult(null);

  }
}


export interface CalenderParamInterface extends HomeBaseInterface {

  pickerSetting?:CalenderPickerSettingInterface;

}


export interface CalenderPickerSettingInterface{
  baseForm?: BaseForm;
  onActivityResult: (date:Date)=>void;
}


export class CalenderFilter extends VisitationFilterApi{

  selectedDay:number = new Date().getDate();

  public constructor(){
    super();
  }
}
