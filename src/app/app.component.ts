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
import {ApiProvider, MenuInterface} from "../providers/api/api";
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
import {Pro} from "@ionic/pro";
import {ChangeMyPasswordPage} from "../pages/myProfile/change-my-password/change-my-password";
import {ProfileInformationPage} from "../pages/myProfile/profile-information/profile-information";
import {SettingHomePage} from "../pages/setting/setting-home/setting-home";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
                  rootPage: any = LoginPage;

  constructor(public badge: Badge, public alertController: AlertController, public helperProvider: HelperProvider, public httpClient: HttpClient, public appVersion: AppVersion, public platform: Platform, private androidPermissions: AndroidPermissions, public statusBar: StatusBar, public splashScreen: SplashScreen, private headerColor: HeaderColor, public userProvider: UserProvider, public rootParams: RootParamsProvider, public toastController: ToastController) {
    shim();


    // this.checkChannel();
    // this.performAutomaticUpdate();


    this.initializeApp();
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

      this.rootPage = LoginPage;

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

  ionViewDidEnter(){
    this.badge.clear().then((data)=>{}).catch((rejected)=>{console.log(rejected)});
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleLightContent();
      this.statusBar.backgroundColorByHexString('#255885');
      this.statusBar.overlaysWebView(false);
      // this.splashScreen.hide();


    });
  }

  openPage(pageString: string) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario

    console.log('theId', pageString);
    this.rootPage = EmptyPage;

    setTimeout(() => {
      switch (pageString) {


        case "profile":
          break;
        case "logout":
          // this.userProvider.logout()
          this.logout();
          break;
        case "setting":
          this.rootPage = SettingHomePage;
          break;
        case "home":
          this.rootPage = HomePage
          break;
        case "announcement":
          this.rootParams.announcementParam = {isApproval: false};
          this.rootPage                     = AnnouncementHomePage;
          // this.nav.push(AnnouncementHomePage, this.rootParams.announcementParam )
          break;

        case "myCalender":
          this.rootPage = CalenderPage
          break;

        //# ==========================================APPLICATION

        case "leaveApplication":
          this.rootPage                             = HomeLeaveApplicationPage;
          this.rootParams.homeLeaveApplicationParam = {isApproval: false};
          break;
        case "overtimeApplication":
          this.rootPage                                = HomeOvertimeApplicationPage;
          this.rootParams.homeOvertimeApplicationParam = {isApproval: false};
          break;
        case "workoutsideOffice":
          this.rootPage                        = WorkoutsideHomePage;
          this.rootParams.workoutsideHomeParam = {isApproval: false};
          break;
        case "exchangeAltOff":
          this.rootPage                        = HomeExchangeApplicationPage;
          this.rootParams.homeExchangeApplicationParam = {isApproval: false};

          break;

        case "visitationApplication":
        case "visitation":
          var params: VisitationApplicationParam     = {
            isApprover: false,
            title: "Visitation Application",
            isProvider: true,
            isApply: false
          }
          this.rootParams.visitationApplicationParam = params;
          this.rootPage                              = VisitationApplicationPage;
          break;
        case "containerInApplication":
          this.rootParams.containerInHomeParam = {isApproval: false, isContainerIn: true};
          this.rootPage                        = ContainerInHomePage;
          break;
        case "containerOutApplication":
          this.rootParams.containerInHomeParam = {isApproval: false, isContainerIn: false};
          this.rootPage                        = ContainerInHomePage;
          break;
        //==============================================


        //# =========================================== MYATTENDANCE

        case "incompleteRecord":
          this.rootParams.incompleteRecordHomeParam = {isApproval: false};
          this.rootPage                          = IncompleteRecordHomePage;
          break;
        case "absenceRecord":
          this.rootParams.absenceRecordHomeParam = {isApproval: false};
          this.rootPage                          = AbsenceRecordHomePage;

          break;


        //-============================================


        //# ============================================= APPROVAL
        case "attendanceApproval":
          this.rootPage                             = IncompleteRecordHomePage;
          this.rootParams.incompleteRecordHomeParam = {isApproval: true};
          break;
        case "leaveApproval":
          this.rootPage                             = HomeLeaveApplicationPage;
          this.rootParams.homeLeaveApplicationParam = {isApproval: true}
          break;
        case "overtimeApproval":
          this.rootPage                                = HomeOvertimeApplicationPage;
          this.rootParams.homeOvertimeApplicationParam = {isApproval: true};
          break;
        case "workoutsideApproval":
          this.rootPage                        = WorkoutsideHomePage;
          this.rootParams.workoutsideHomeParam = {isApproval: true};
          break;
        case "exchangeAltOffApproval":
          this.rootPage                                = HomeExchangeApplicationPage;
          this.rootParams.homeExchangeApplicationParam = {isApproval: true};
          break;
        case "visitation_approval":
        case "visitationApproval":
        case "approvalVisitation":
          var params: VisitationApplicationParam     = {
            isApprover: true,
            title: "Visitation Approval",
            isProvider: true,
            isApply: false
          }
          this.rootParams.visitationApplicationParam = params;
          this.rootPage                              = VisitationApplicationPage
          break;
        case "containerApproval":
          this.rootParams.containerInHomeParam = {isApproval: true, isContainerIn: true};
          this.rootPage                        = ContainerInHomePage;
          break;
        //===============================================


        //# ==============================================MyProfile

        case "changeMyPassword":
          this.rootPage = ChangeMyPasswordPage;
          // setTimeout(()=>{          this.nav.push(ChangeMyPasswordPage);},100);

          break;
        case "profileInformation":
          this.rootPage = ProfileInformationPage;
          break;


        //==============================================MyProfile


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


    this.badge.hasPermission().then(granted => {
      console.log('badgePermission', granted)
      if (!granted) {
        this.badge.registerPermission().then(granted => {
          if (!granted) {
            this.checkPermission();
          }
        })
      }
    }).catch(rejected => {
      console.log("badgePermissionRejected", rejected)
    })
  }


  apiExecuteCheckVersion() {
    var loader = this.helperProvider.presentLoadingV2("Checking version")
    this.appVersion.getVersionNumber().then((data) => {
      console.log('apiExecuteCheckVersion', data);

      var url    = `${ApiProvider.PHP_IONIC_URL}check-version.php`;
      var params = {
        version: data
      };
      return this.httpClient.get<CheckVersionApiResopnseInterface>(url, {
        withCredentials: true,
        params: params
      }).toPromise();
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

  public menuOpened() {
    console.log('menuOpened')

    this.userProvider.getBadge();

  }


  async checkChannel() {


    try {
      await this.platform.ready();

      const res = await Pro.deploy.info();

      // this.helperProvider.showAlert(res.binary_version);
      console.log('channelPro', res);
    } catch (err) {
      console.log(err);
      // We encountered an error.
      // Here's how we would log it to Ionic Pro Monitoring while also catching:

      Pro.monitoring.exception(err);
    }
  }


  async performAutomaticUpdate() {
    try {
      const resp = await Pro.deploy.checkAndApply(true, function (progress) {
        this.downloadProgress = progress;
      });

      if (resp.update) {
        // We found an update, and are in process of redirecting you since you put true!

        console.log('channel found update')
      } else {
        // No update available
      }
    } catch (err) {
      console.log('performAutomaticUpdateCatch', err);
      // We encountered an error.
      // Here's how we would log it to Ionic Pro Monitoring while also catching:

      Pro.monitoring.exception(err);
    }
  }

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
  isFromAbsenceRecord?: boolean;
}

export interface HomeBaseInterface {
  isApproval: boolean;
}


