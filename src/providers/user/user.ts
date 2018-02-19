import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiProvider, MenusApiInterface, UserSessionApiInterface} from "../api/api";
import {Loading, NavController} from "ionic-angular";
import {LoginPage} from "../../pages/login/login";
import {RootParamsProvider} from "../root-params/root-params";
import {StorageKey} from "../../app/app.component";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {HelperProvider} from "../helper/helper";
import {Badge} from "@ionic-native/badge";

/*
  Generated class for the UserProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()

export class UserProvider {


  public homeMenu: MenusApiInterface[] = [{
    isOpen: false,
    id: "authorization",
    name: "Authorization",
    menu: [{
      isOpen: false,
      id: "home",
      name: "Home",
    }],

  }];


  public userSession: UserSessionApiInterface = {isLoggedIn: false, isFnFReady: false};
  public watchFnF: ReplaySubject<any>         = new ReplaySubject(5);

  private intervalMenu;

  constructor(public badge:Badge,public helperProvider: HelperProvider, public httpClient: HttpClient, public api: ApiProvider, public rootParam: RootParamsProvider) {
    this.userSession.isFnF      = false;
    this.userSession.isFnFReady = false;
    console.log('Hello UserProvider Provider');
    // this.homeMenu.push({isOpen:false,id:"test",name:"re"})
    // if (rootParam.isPartial) {
    //     // this.userSession.empId = localStorage.getItem(StorageKey.USER_ID) || "MY080127";
    //     // this.userSession.userId = this.userSession.empId;
    //
    //     var userid = localStorage.getItem(StorageKey.USER_ID);
    //     var password = localStorage.getItem(StorageKey.USER_PASSWORD);
    //
    //     this.userSession.userId = this.userSession.empId = userid;
    //     // this.login(userId,password);
    //     this.api.login(userid, password).then((userSession: UserSessionApiInterface) => {
    //         // = userSession;
    //         this.userSession = userSession;
    //         this.userSession.isFnFReady = false;
    //         this.userSession.isLoggedIn = true;
    //         this.getFnf();
    //
    //
    //
    //     }).catch(() => {
    //
    //     })
    //
    //     console.log('localstorageUserProvider', this.userSession.empId);
    //
    // }
  }

  login(username: string, password: string, loginListener?: (isLoggedIn: boolean) => void) {
    var loading = this.helperProvider.presentLoadingV2("Logging in");

    this.api.login(username, password).then((response) => {

      console.log('loginAPI', response);
      var data = <UserSessionApiInterface> response.body;
      if (data["status"] == "ok") {
        this.concatArray(this.userSession, data);
        this.userSession.isLoggedIn = true;
        this.getFnf();
        localStorage.setItem(StorageKey.USER_ID, username);
        localStorage.setItem(StorageKey.USER_PASSWORD, password);
        return this.api.getMenu(this.userSession.empId);
      }
      return new Promise((resolve, reject) => {
        reject("Wrong username or password");
      })
    }).then((data: MenusApiInterface[]) => {

      this.homeMenu.splice(0, this.homeMenu.length);
      // this.concatArray(this.homeMenu,data["parent_menu"]);
      // this.homeMenu[2].menu.push(
      //   {menu:[],id:"containerIn",name:"Container",isOpen:true},
      //
      // );
      // this.homeMenu[this.homeMenu.length - 1].menu.push({id:"logout",name:"Logout",isOpen:false});

      // console.log(data["parent_menu"]);

      this.hardCodeMenu();
      this.getBadge();
      loginListener(true);

      console.log('menu', data);
      // this.homeMenu.push({
      //   isOpen: false,
      //   id: "",
      //   name: "My Application",
      //   menu: [{
      //     isOpen:false,
      //     id:"visitationApplication",
      //     name:"Visitation Application"
      //   }]
      // });
    }).catch(rejected => {
      this.helperProvider.presentToast(rejected.toString());
      console.log('loginRejected', rejected);
    }).finally(() => {
      loading.dismiss();
    });

  }

  logout() {
    this.userSession = {isLoggedIn: false};
    localStorage.removeItem(StorageKey.USER_PASSWORD);
    localStorage.removeItem(StorageKey.USER_ID);
    // localStorage.clear();
  }


  concatArray(target: any, source: any) {
    for (var key in source) {
      target[key] = (source[key]);
    }
  }

  hardCodeMenu() {

    this.homeMenu.push({
      name: "Home",
      id: "home",
      menu: [],
      isOpen: false
    });

    this.homeMenu.push({
      name: "My Calender",
      id: "myCalender",
      image: "assets/imgs/menu-calendar.png",
      menu: [],
      isOpen: false
    });


    this.homeMenu.push({
      name: "Application",
      id: "application",
      image: "assets/imgs/menu-myapplication.png",
      badge:{
        params:null,
        url: null,
        count: 0,
      },
      menu: [
        {
          name: "Leave Application",
          id: "leaveApplication",
          menu: [],
          isOpen: false,
          badge:{
            url:`${ApiProvider.HRM_URL}s/LeaveApplication_active`,
            params: this.oldBadgeApplicationParam(),
          }
        }, {
          name: "Overtime Application",
          id: "overtimeApplication",
          menu: [],
          isOpen: false,
          badge:{
            url:`${ApiProvider.HRM_URL}s/OvertimeApplication_active`,
            params: this.oldBadgeApplicationParam(),
          }
        }, {
          name: "Work Outside Office",
          id: "workoutsideOffice",
          menu: [],
          isOpen: false,
          badge:{
            url:`${ApiProvider.HRM_URL}s/LeaveApplication_active`,
            params: this.oldBadgeApplicationParam(),
          }
        }, {
          name: "Exchange Alt. Off",
          id: "exchangeAltOff",
          menu: [],
          isOpen: false,
          badge:{
            url:`${ApiProvider.HRM_URL}s/ExchangeApplication_active`,
            params: this.oldBadgeApplicationParam(),
          }
        }, {
          name: "Visitation Application",
          id: "visitationApplication",
          menu: [],
          isOpen: false,
          badge:{
            url:`${ApiProvider.HRM_URL}s/VisitationApplication_active`,
            params:this.visitationApplicationBadge(),
          } ,
        }, {
          name: "Container In Application",
          id: "containerInApplication",
          menu: [],
          isOpen: false,
          badge:{
            url: `${ApiProvider.HRM_URL}s/VisitationApplication_active?`,
            params: this.visitationApplicationBadge(),
            count: 0,
          }
        },{
          name: "Container Out Application",
          id: "containerOutApplication",
          menu: [],
          isOpen: false,
          badge:{
            url: `${ApiProvider.HRM_URL}s/VisitationApplication_active?`,
            params: this.visitationApplicationBadge(),
            count: 0,
          }
        }],
      isOpen: false
    })


    this.homeMenu.push({
      name: "My Attendance",
      id: "",
      image: "assets/imgs/menu-attendance.png",
      badge:{
        params:null,
        url: null,
        count: 0,
      },
      menu: [{
        name: "Incomplete Record",
        id: "incompleteRecord",
        menu: [],
        isOpen: false,
        badge:{
          url:`${ApiProvider.HRM_URL}s/IncompletedRecord_active`,
          params:this.oldBadgeApplicationParam(),
        }
      }, {
        name: "Absence Record",
        id: "absenceRecord",
        menu: [],
        isOpen: false,
        badge:{
          url:`${ApiProvider.HRM_URL}s/AbsenceRecord_active`,
          params:this.oldBadgeApplicationParam(),
        }
      }],
      isOpen: false
    })


    this.homeMenu.push({
      name: "Approval",
      id: "approval",
      image: "assets/imgs/menu-approval.png",
      badge:{
        params:null,
        url: null,
        count: 0,
      },
      menu: [
        {
          name: "Attendance Approval",
          id: "attendanceApproval",
          menu: [],
          isOpen: false,
          badge:{
            url:`${ApiProvider.HRM_URL}s/AttendanceApproval_active`,
            params:this.oldBadgeApprovalParam(),
          }
        }, {
          name: "Leave Approval",
          id: "leaveApproval",
          menu: [],
          isOpen: false,
          badge:{
            url:`${ApiProvider.HRM_URL}s/LeaveApplicationApproval_active`,
            params:this.oldBadgeApprovalParam(),
          }
        }, {
          name: "Overtime Approval",
          id: "overtimeApproval",
          menu: [],
          isOpen: false,
          badge:{
            url:`${ApiProvider.HRM_URL}s/OvertimeApplicationApproval_active`,
            params:this.oldBadgeApprovalParam(),
          }
        }, {
          name: "Work Outside Approval",
          id: "workoutsideApproval",
          menu: [],
          isOpen: false,
          badge:{
            url:`${ApiProvider.HRM_URL}s/WorkoutsideApplicationApproval_active`,
            params:this.oldBadgeApprovalParam(),
          }
        }, {
          name: "Exchange Alt. Off Approval",
          id: "exchangeAltOffApproval",
          menu: [],
          isOpen: false,
          badge:{
            url:`${ApiProvider.HRM_URL}s/ExchangeApplicationApproval_active`,
            params:this.oldBadgeApprovalParam(),
          }
        }, {
          name: "Visitation Approval",
          id: "visitation_approval",
          menu: [],
          isOpen: false,
          badge:{
            url: `${ApiProvider.HRM_URL}s/VisitationApplicationApproval_active`,
            params: this.visitationApprovalBadge(),
          }
        },{
          name: "Container In Approval",
          id: "containerInApproval",
          menu: [],
          isOpen: false,
        },{
          name: "Container Out Approval",
          id: "containerOutApproval",
          menu: [],
          isOpen: false,
        }
      ],
      isOpen: false
    })

    this.homeMenu.push({
      name: "My Profile",
      id: "",
      image: "assets/imgs/menu-profile.png",
      menu: [
        {
          name: "Profile Information",
          id: "profileInformation",
          menu: [],
          isOpen: false
        }, {
          name: "Change My Password",
          id: "changeMyPassword",
          menu: [],
          isOpen: false
        },
      ],
      isOpen: false
    });


    this.homeMenu.push({
      name: "Logout",
      id: "logout",
      image: "assets/imgs/menu-logout.png",
      menu: [],
      isOpen: false
    });


  }

  private getFnf() {

    var loading: Loading = this.helperProvider.presentLoadingV2("Loading status");
    this.api.getSelectOptionsVisitation(this).toPromise().then((data) => {
      this.userSession.isFnF      = (<string> data["loc_id"]).toLowerCase() == "fnf"
      this.userSession.isFnFReady = true;
      this.watchFnF.next(true);
    }).catch(rejected => {
      console.log('fnfRejected', rejected);
    }).finally(() => {
      loading.dismiss();

    })
  }


  public getBadge(){



    // this.badge.clear();

    var bank: MenusApiInterface[] = this.homeMenu.slice();

    //# set interval buat BUG ionic (ionOpen) biar value ke refresh!

    if(!this.intervalMenu){
      this.intervalMenu = setInterval(()=>{
        this.homeMenu[3].badge.count += 0;
      },100);
    }





    bank.forEach((currentHomeMenu:MenusApiInterface)=>{

      this.recursiveScanMenu(currentHomeMenu,(lvl0Badge)=>{
        // this.badge.increase(+lvl0Badge);

          currentHomeMenu.badge.count += lvl0Badge;

        // currentHomeMenu.badge.count ++;
        console.log('bank',bank);
        console.log('bankHomeMenu',this.homeMenu);
        //
        // this.refreshMenu = false;
        // setTimeout(()=>{
        //   this.refreshMenu = true;
        // },1000)

        this.homeMenu = [];
        this.homeMenu = bank;
        // this.menuReplaySubject.next(bank);


      });
    })


  }
  private recursiveScanMenu(currentParent:MenusApiInterface,upperParentNotify?:(childBadge:number)=>void){

    //# anak menu di scan lagi punya anak apa ngga, nti di recursive lagi

    //# set biar bisa di plus
    if(currentParent.badge && currentParent.menu.length > 0){
      currentParent.badge.count = 0;
    }


    currentParent.menu.forEach((currentMenu)=>{
      this.recursiveScanMenu(currentMenu,upperParentNotify)
    })

    if(currentParent.badge && currentParent.badge.url != null){

      this.httpClient.get(currentParent.badge.url,{withCredentials:true,params:currentParent.badge.params}).subscribe((data)=>{
        data["badge"];
        currentParent.badge.count = data["badge"] || 0;


        //# untuk yg nama badge bya khusus
        switch(currentParent.id){
          case "visitationApplication":
            currentParent.badge.count = +data["badgeVisitation"] || 0;
            break;
          case "containerInApplication":
            currentParent.badge.count = +data["badgeContainerIn"] || 0;
            break;
          case "containerOutApplication":
            currentParent.badge.count = +data["badgeContainerOut"] || 0;
            break;
        }


        //#manggil parent di foreach
        upperParentNotify(+currentParent.badge.count);

        console.log('apiBadge',data,currentParent);

      })



    }

  }



  //# application
  private oldBadgeApplicationParam(){
    return {
      mobile: true,
      searchBy: "a.emp_id",
      keyWord: "",
      cmbYear: (new Date()).getFullYear(),
      cmbMonth: 0,
      cmbStatus: "PA",
      cmbType: '',
      cmbDepartment: "",
      user_id: this.userSession.empId,
      cmbEmployee: this.userSession.empId,
      page: 1,
      start: 0,
      limit: 1000
    }
  }

  private oldBadgeApprovalParam(){

    return {
      mobile: true,
      searchBy: "a.emp_id",
      keyWord: "",
      cmbYear: (new Date()).getFullYear(),
      cmbMonth: 0,
      cmbStatus: "PA",
      cmbType: '',
      cmbDepartment: "",
      user_id: this.userSession.empId,
      cmbEmployee: this.userSession.empId,
      page: 1,
      start: 0,
      limit: 1000
    }
  }


  private visitationApplicationBadge(){

    // return {tes:"test"}

    return {
      activepage: [1,5],
      inactivepage: [1,5],
      isBadge:true,
      user_id: this.userSession.empId,
    }


  }
  //# approval
  private visitationApprovalBadge(){
    return {
      activepage: [1,5],
      inactivepage: [1,5],
      filter_by: "emp_name",
      keyword: "",
      cmbStatus:"PA",
      cmbSection: "",
      cmbDepartment: "",
      isBadge:true,
      user_id: this.userSession.empId,
    }
  }


}
