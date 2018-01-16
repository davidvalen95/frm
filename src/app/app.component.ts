import { Component, ViewChild } from '@angular/core';
import {Nav, NavController, Platform, ToastController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import {
  VisitationApplicationPage,
  VisitationApplicationParam
} from "../pages/application/visitation-application/visitation-application";
import {HeaderColor} from "@ionic-native/header-color";
import {MenusApiInterface} from "../providers/api/api";
import {UserProvider} from "../providers/user/user";
import {DatePicker} from "@ionic-native/date-picker";
import { shim } from 'promise.prototype.finally';
import {ContainerInPage} from "../pages/container-in/container-in";
import {LoginPage} from "../pages/login/login";
import {RootParamsProvider} from "../providers/root-params/root-params";
import {EmptyPage} from "../pages/empty/empty";
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = LoginPage;
  homeMenu:MenusApiInterface[] = [];

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private headerColor:HeaderColor, public userProvider:UserProvider, public rootParams:RootParamsProvider, public toastController:ToastController) {
    shim();
    this.initializeApp();
    this.headerColor.tint('#112244');
    // used for an example of ngFor and navigation
    this.homeMenu = userProvider.homeMenu;

    this.toastController.create({
      duration: 4000,
      message: `version: ${this.rootParams.version}, isPartial: ${this.rootParams.isPartial}`
    }).present();

    if(this.rootParams.isPartial){


      var room = localStorage.getItem(StorageKey.ROOM_ID) || "logout";
      this.openPage(room);


    }else{
      this.rootPage = LoginPage;
    }
  }
  ngOnInit(){
    console.log('tes2');
    console.log('tes');

  }
  ngAfterInit(){

  }
  ionViewDidLoad(){

  }
  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(pageString:string) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario

    this.rootPage = EmptyPage;

    setTimeout(()=>{
      switch(pageString){
        case "login":
          this.rootPage = HomePage;
          break;
        case "profile":
          break;
        case "visitationApplication":
        case "visitation":
          var params:VisitationApplicationParam = {isApprover:false, title:"Visitation Application",isProvider:true,isApply:false}
          this.rootParams.visitationApplicationParam = params;
          this.rootPage = VisitationApplicationPage;
          break;
        case "containerIn":
        case "container":
          this.rootPage = ContainerInPage
          break;
        case "containerOut":
          break;
        case "visitation_approval":
        case "visitationApproval":
        case "approvalVisitation":
          var params:VisitationApplicationParam = {isApprover:true, title:"Visitation Approval",isProvider:true,isApply:false}
          this.rootParams.visitationApplicationParam = params;
          this.rootPage = VisitationApplicationPage
          break;
        case "logout":
          // this.userProvider.logout()
          this.logout();
          break;
        case "home":
          this.rootPage = HomePage
          break;
      }
    },100)



  }
  logout(){
    setTimeout(()=>{
      this.userProvider.logout()

    },300)
    this.rootPage = LoginPage;

  }

}

export class StorageKey{
  public static USER_ID = "userId";
  public static ROOM_ID = "roomId";
  public static USER_PASSWORD = "userPassword";

}
