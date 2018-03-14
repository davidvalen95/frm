import {Component, ViewChild} from '@angular/core';
import {
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams,
  ToastController
} from 'ionic-angular';
import {
  ApiGetConfigInterface, ApiProvider, BadgeApiInterface, VisitationDataApiInterface,
  VisitationFilterApi
} from "../../providers/api/api";
import {HomeBaseInterface} from "../../app/app.component";
import {CalenderListInterface} from "./CalenderApiInterface";
import {HttpClient} from "@angular/common/http";
import {HelperProvider} from "../../providers/helper/helper";
import {UserProvider} from "../../providers/user/user";
import {RootParamsProvider} from "../../providers/root-params/root-params";
import {WorkoutsideListInterface} from "../application/workoutside/WorkoutsideApiInterface";
import {CalenderEventInterface} from "../../components/calender/calender";
import {BaseForm} from "../../components/Forms/base-form";

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
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isInfiniteEnable: boolean   = true;

  public pageParam: CalenderParamInterface = {isApproval: false};
  public badge: BadgeApiInterface;


  public listData: CalenderListInterface;

  public filterRule: VisitationFilterApi          = {};
  public calenderEvents: CalenderEventInterface[];
  public eventBroadcaster
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  @ViewChild("navbar") navbar: Navbar;
  @ViewChild(Content) public content: Content;


  public nextButton = (onFinish:()=>void)=>{
    this.getArrowCalender(1,onFinish);

  }

  public previousButton = (onFinish:()=>void)=>{
    this.getArrowCalender(-1,onFinish);

  }
  constructor(public httpClient: HttpClient, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    console.log("visitationApplicationBadge", this.rootParam.visitationApplicationParam);

    this.pageParam = this.rootParam.homeOvertimeApplicationParam;
    this.title     = "Calendar"
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

  public getList(onFinish:()=>void) {

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

    var config: ApiGetConfigInterface = {
      url: url,
      params: params,
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

        },500)
      }
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
    this.filter.cmbMonth = `${new Date().getMonth() + 1}`;


    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_top?mobile=true&cmd=filter&user_id=MY080127&callback=Ext.data.JsonP
    //
    //
    // var url = `${ ApiProvider.HRM_URL }${this.pageParam.isApproval ? "s/OvertimeApplicationApproval_top" : "s/OvertimeApplication_top"}`;
    //
    //
    // var params = {
    //   mobile: "true",
    //   cmd: "filter",
    //   user_id: this.userProvider.userSession.empId
    // }
    //
    // var config: ApiGetConfigInterface = {
    //   url: url,
    //   params: params
    // }
    // this.apiProvider.get<VisitationFilterApi>(config, (data: VisitationFilterApi) => {
    //   this.filterRule = data;
    // })

  }




  public getArrowCalender(advanceMonth:number = 0,onFinish:()=>void){

    var mmm = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



    var filterDate = new Date();
    filterDate.setMonth(+this.filter.cmbMonth -1);
    filterDate.setFullYear(+this.filter.cmbYear);
    filterDate.setDate(15);

    console.log('getArrowCalenderBefore', filterDate,this.filter.cmbMonth);
    filterDate = BaseForm.getAdvanceDate(advanceMonth * 30, filterDate);
    console.log('getArrowCalenderAfter', filterDate);

    this.filter.cmbMonth = ""+(filterDate.getMonth() + 1);
    this.filter.cmbYear = ""+filterDate.getFullYear();

    this.getList(onFinish);

  }
}


export interface CalenderParamInterface extends HomeBaseInterface {

}
