import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import {VisitationApplicationPage} from "../pages/application/visitation-application/visitation-application";
import {HeaderColor} from "@ionic-native/header-color";
import {MenusApiInterface} from "../providers/api/api";
import {UserProvider} from "../providers/user/user";
import {DatePicker} from "@ionic-native/date-picker";
import { shim } from 'promise.prototype.finally';
import {ContainerInPage} from "../pages/container-in/container-in";
import {LoginPage} from "../pages/login/login";
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;
  homeMenu:MenusApiInterface[] = [];

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private headerColor:HeaderColor, public userProvider:UserProvider) {
    shim();
    this.initializeApp();
    this.headerColor.tint('#112244');
    // used for an example of ngFor and navigation
    this.homeMenu = userProvider.homeMenu;

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

    var ionicPage = null;
    switch(pageString){
      case "login":
        ionicPage = HomePage;
        break;
      case "profile":
        break;
      case "visitationApplication":
      case "visitation":
        ionicPage = VisitationApplicationPage;
        break;
      case "containerIn":
        ionicPage = ContainerInPage
        break;
      case "containerOut":
        break;
    }
    if(ionicPage){
      // this.nav.push(page);
      // this.nav.setRoot(page.component);

      this.rootPage = ionicPage;
    }else{
      this.rootPage = HomePage;
    }

  }
}
