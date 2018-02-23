import {Component, ViewChild} from '@angular/core';
import {AlertController, Nav, NavController, Platform, ToastController} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {HomePage} from '../pages/home/home';
import {ListPage} from '../pages/list/list';
import {
    VisitationApplicationPage,
    VisitationApplicationParam
} from "../pages/application/visitation-application/visitation-application";
import {HeaderColor} from "@ionic-native/header-color";
import {ApiProvider, MenusApiInterface} from "../providers/api/api";
import {UserProvider} from "../providers/user/user";
import {DatePicker} from "@ionic-native/date-picker";
import {shim} from 'promise.prototype.finally';
import {LoginPage} from "../pages/login/login";
import {RootParamsProvider} from "../providers/root-params/root-params";
import {EmptyPage} from "../pages/empty/empty";
import {AndroidPermissions} from "@ionic-native/android-permissions";
import {HomeLeaveApplicationPage} from "../pages/application/leave/home-leave-application/home-leave-application";
import {HomeExchangeApplicationPage} from "../pages/application/exchange/home-exchange-application/home-exchange-application";
import {AppVersion} from "@ionic-native/app-version";
import {HttpClient} from "@angular/common/http";
import {HelperProvider} from "../providers/helper/helper";
import {ApplyOvertimeApplicationPage} from "../pages/application/overtime/apply-overtime-application/apply-overtime-application";
import {HomeOvertimeApplicationPage} from "../pages/application/overtime/home-overtime-application/home-overtime-application";
import {WorkoutsideHomePage} from "../pages/application/workoutside/workoutside-home/workoutside-home";
import {
  ContainerInHomePage,
  ContainerInHomeParam
} from "../pages/application/containerIn/container-in-home/container-in-home";
import {AbsenceRecordHomePage} from "../pages/myAttendance/absenceRecord/absence-record-home/absence-record-home";
import {CalenderPage} from "../pages/calender/calender";
import {IncompleteRecordHomePage} from "../pages/myAttendance/incompleteRecord/incomplete-record-home/incomplete-record-home";
import {Badge} from "@ionic-native/badge";
import {AnnouncementHomePage} from "../pages/announcement/announcement-home/announcement-home";
@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;
    rootPage: any = LoginPage;

  constructor(public badge:Badge, public alertController: AlertController, public helperProvider: HelperProvider, public httpClient: HttpClient, public appVersion: AppVersion, public platform: Platform, private androidPermissions: AndroidPermissions, public statusBar: StatusBar, public splashScreen: SplashScreen, private headerColor: HeaderColor, public userProvider: UserProvider, public rootParams: RootParamsProvider, public toastController: ToastController) {
        shim();





        this.initializeApp();
        this.headerColor.tint('#112244');
        // used for an example of ngFor and navigation
        this.checkPermission();


        // if(localStorage.getItem("test")){
        //   console.log('localStorageKept');
        // }else{
        //   console.log("localstorageNOTkept");
        //   localStorage.setItem("test","bebek");
        // }

        //
        // this.toastController.create({
        //   duration: 4000,
        //   message: `version: ${this.rootParams.version}, isPartial: ${this.rootParams.isPartial}`
        // }).present();

        if (this.rootParams.isPartial) {


            var room = localStorage.getItem(StorageKey.ROOM_ID) || "logout";
            this.openPage(room);


        } else {
            this.rootPage = LoginPage;
        }
        this.apiExecuteCheckVersion();

    }
    ngOnInit() {
        console.log('tes2');
        console.log('tes');

    }
    ngAfterInit() {

    }
    ionViewDidLoad() {

    }
    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }

    openPage(pageString: string) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario

      console.log('theId',pageString);
        this.rootPage = EmptyPage;

        setTimeout(() => {
            switch (pageString) {




                case "profile":
                    break;
                case "logout":
                    // this.userProvider.logout()
                    this.logout();
                    break;
                case "home":
                    this.rootPage = HomePage
                    break;
                case "announcement":
                  this.rootParams.announcementParam = {isApproval: false};
                  this.rootPage = AnnouncementHomePage;
                  // this.nav.push(AnnouncementHomePage, this.rootParams.announcementParam )
                  break;

                case "myCalender":
                    this.rootPage = CalenderPage
                    break;

                //# ==========================================APPLICATION

                case "leaveApplication":
                    this.rootPage = HomeLeaveApplicationPage;
                    this.rootParams.homeLeaveApplicationParam = {isApproval: false};
                    break;
                case "overtimeApplication":
                    this.rootPage = HomeOvertimeApplicationPage;
                    this.rootParams.homeOvertimeApplicationParam = {isApproval: false};
                    break;
                case "workoutsideOffice":
                    this.rootPage                        = WorkoutsideHomePage;
                    this.rootParams.workoutsideHomeParam = {isApproval: false};
                    break;
                case "exchangeAltOff":
                    this.rootPage = HomeExchangeApplicationPage;
                  this.rootParams.workoutsideHomeParam = {isApproval: false};

                  break;

                case "visitationApplication":
                case "visitation":
                    var params: VisitationApplicationParam = {isApprover: false, title: "Visitation Application", isProvider: true, isApply: false}
                    this.rootParams.visitationApplicationParam = params;
                    this.rootPage = VisitationApplicationPage;
                    break;
                case "containerInApplication":
                    this.rootParams.containerInHomeParam = {isApproval:false, isContainerIn:true};
                    this.rootPage = ContainerInHomePage;
                    break;
                case "containerOutApplication":
                    this.rootParams.containerInHomeParam = {isApproval:false, isContainerIn:false};
                    this.rootPage = ContainerInHomePage;
                    break;
                //==============================================






                //# =========================================== MYATTENDANCE

                case "incompleteRecord":
                  this.rootParams.absenceRecordHomeParam = {isApproval:false};
                  this.rootPage = IncompleteRecordHomePage;
                    break;
                case "absenceRecord":
                    this.rootParams.absenceRecordHomeParam = {isApproval:false};
                    this.rootPage = AbsenceRecordHomePage;

                    break;


                //-============================================







                //# ============================================= APPROVAL
                case "leaveApproval":
                    this.rootPage = HomeLeaveApplicationPage;
                    this.rootParams.homeLeaveApplicationParam = {isApproval: true}
                    break;
                case "overtimeApproval":
                    this.rootPage = HomeOvertimeApplicationPage;
                    this.rootParams.homeOvertimeApplicationParam = {isApproval: true};
                    break;
                case "workoutsideApproval":
                    this.rootPage                        = WorkoutsideHomePage;
                    this.rootParams.workoutsideHomeParam = {isApproval: true};
                    break;
                case "exchangeAltOffApproval":
                    this.rootPage = HomeExchangeApplicationPage;
                    this.rootParams.homeExchangeApplicationParam = {isApproval: true};
                    break;
                case "visitation_approval":
                case "visitationApproval":
                case "approvalVisitation":
                    var params: VisitationApplicationParam = {isApprover: true, title: "Visitation Approval", isProvider: true, isApply: false}
                    this.rootParams.visitationApplicationParam = params;
                    this.rootPage = VisitationApplicationPage
                    break;
                case "containerApproval":
                    this.rootParams.containerInHomeParam = {isApproval:true,isContainerIn:true};
                    this.rootPage = ContainerInHomePage;
                    break;
                //===============================================






                default:
                    this.rootPage = HomePage;
                    break;
            }
        }, 100)



    }
    logout() {
        setTimeout(() => {
            this.userProvider.logout();

        }, 300)
        this.rootPage = LoginPage;



    }


    private checkPermission() {

        if (!this.rootParams.isLive) {
            // return;
        }
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(result => {
            console.log('Has permission?', result.hasPermission)

            if (!result.hasPermission) {
                this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE, this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE]).then(data => {

                    if (!data.hasPermission) {
                        this.checkPermission();
                    }
                    console.log('permission', data)
                }).catch(rejected => {
                    this.checkPermission();
                });
            }
        }).catch(err => {
        });


        this.badge.hasPermission().then(granted=>{
          console.log('badgePermission',granted)
          if(!granted){
            this.badge.registerPermission().then(granted=>{
              if(!granted){
                this.checkPermission();
              }
            })
          }
        }).catch(rejected =>{
          console.log("badgePermissionRejected",rejected)
        })
    }


    apiExecuteCheckVersion() {
        var loader = this.helperProvider.presentLoadingV2("Checking version")
        this.appVersion.getVersionNumber().then((data) => {
            console.log('apiExecuteCheckVersion', data);

            var url = `${ApiProvider.PHP_IONIC_URL}check-version.php`;
            var params = {
                version: data
            };
            return this.httpClient.get<CheckVersionApiResopnseInterface>(url, {withCredentials: true, params: params}).toPromise();
        }).then((data: CheckVersionApiResopnseInterface) => {

            var message = data.data.message || "Cannot retrieve version message";
            if (data.data.isLatest) {
                this.helperProvider.presentToast(message)
            } else {
                // this.helperProvider.showAlert(message);

                this.alertController.create({
                    title: "Outdated",
                    message: message,
                    enableBackdropDismiss: false,
                }).present();
            }

        }).catch((rejected) => {
            console.log('apiExecuteCheckVersionRejected', rejected);

        }).finally(() => {
            loader.dismiss();
        });

    }

    public menuOpened(){
      console.log('menuOpened')

      this.userProvider.getBadge();

    }




}

export class StorageKey {
    public static USER_ID = "userId-Rumah0123asdfqwer";
    public static ROOM_ID = "roomId-Rumah0123asdfqwer";
    public static USER_PASSWORD = "userPassword--Rumah0123asdfqwer";

}


interface CheckVersionApiResopnseInterface {

    success: boolean;
    data: CheckVersionDataInterface

}
interface CheckVersionDataInterface {
    message: string;
    isLatest: boolean;
}


export interface ApplyBaseInterface<T> {
    onDidLeave?: () => void;
    isEditing: boolean;
    isApply: boolean;
    isApproval: boolean;
    list?: T;
    title?: string;
    isFromAbsenceRecord? :boolean;
}

export interface HomeBaseInterface {
    isApproval: boolean;
}


