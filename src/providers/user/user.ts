import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiProvider, MenusApiInterface, UserSessionApiInterface} from "../api/api";
import {Loading, NavController} from "ionic-angular";
import {LoginPage} from "../../pages/login/login";
import {RootParamsProvider} from "../root-params/root-params";
import {StorageKey} from "../../app/app.component";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {HelperProvider} from "../helper/helper";

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
    public watchFnF: ReplaySubject<any> = new ReplaySubject(5);
    constructor(public helperProvider: HelperProvider, public http: HttpClient, public api: ApiProvider, public rootParam: RootParamsProvider) {
        this.userSession.isFnF = false;
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
            console.log('loginRejected',rejected);
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
            menu: [
                {
                    name: "Leave Application",
                    id: "leaveApplication",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Overtime Application",
                    id: "overtimeApplication",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Work Outside Office",
                    id: "workOutsideOffice",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Exchange Alt. Off",
                    id: "exchangeAltOff",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Visitation",
                    id: "visitation",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Container",
                    id: "container",
                    menu: [],
                    isOpen: false,
                }],
            isOpen: false
        })


        this.homeMenu.push({
            name: "My Attendance",
            id: "",
            image: "assets/imgs/menu-attendance.png",
            menu: [{
                name: "Incomplete Record",
                id: "incompleteRecord",
                menu: [],
                isOpen: false,
            }, {
                name: "Absence Record",
                id: "absenceRecord",
                menu: [],
                isOpen: false,
            }],
            isOpen: false
        })


        this.homeMenu.push({
            name: "Approval",
            id: "approval",
            image: "assets/imgs/menu-approval.png",
            menu: [
                {
                    name: "Attendance Approval",
                    id: "attendanceApproval",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Leave Approval",
                    id: "leaveApproval",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Overtime Approval",
                    id: "overtimeAPproval",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Work Outside Approval",
                    id: "workOutsideApproval",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Exchange Alt. Off Approval",
                    id: "exchangeAltOffApproval",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Visitation Approval",
                    id: "visitation_approval",
                    menu: [],
                    isOpen: false,
                }, {
                    name: "Container Approval",
                    id: "containerApproval",
                    menu: [],
                    isOpen: false,
                },
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
        this.api.getSelectOptionsVisitation(this).subscribe((data) => {
            this.userSession.isFnF = (<string> data["loc_id"]).toLowerCase() == "fnf"
            this.userSession.isFnFReady = true;
            loading.dismiss();
            this.watchFnF.next(true);
        })
    }
}
