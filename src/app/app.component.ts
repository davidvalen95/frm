import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import {VisitationApplicationPage} from "../pages/application/visitation-application/visitation-application";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  menus: object[] = [
    {
      title: 'My Application',
      isOpen: false,
      child: [
        {
          title: 'Leave Application',
        },
        {
          title: 'Overtime Application',
        },
        {
          title: 'Work Outside Office',
        },
        {
          title: 'Exchange Alt Off',
        },
        {
          title: 'Visitation Application',
          page: VisitationApplicationPage,
        },
        {
          title: 'Container In Application',
        },
        {
          title: 'Container Out Application',
        },
      ]
    },
    {
      title: 'My Approval',
      isOpen: false,
      child: [
        {
          title: 'Leave Application',
        },
        {
          title: 'Overtime Application',
        },

      ]
    },
    {
      title: 'Third option',
      isOpen: false,
      child: [
        {
          title: 'Leave Application',
        },
        {
          title: 'Overtime Application',
        },


      ]
    },
  ];

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    // used for an example of ngFor and navigation

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if(page){
      // this.nav.push(page);
      // this.nav.setRoot(page.component);

      this.rootPage = page;
    }

  }
}
