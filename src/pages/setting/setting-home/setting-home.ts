import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {RootParamsProvider} from "../../../providers/root-params/root-params";
import {UserProvider} from "../../../providers/user/user";
import {LoginPage} from "../../login/login";
import {AppVersion} from "@ionic-native/app-version";
import {HelperProvider} from "../../../providers/helper/helper";

/**
 * Generated class for the SettingHomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-setting-home',
  templateUrl: 'setting-home.html',
})
export class SettingHomePage {

  public title:string;
  public versionNumber:string = "";
  constructor(public helperProvider:HelperProvider, public appVersion: AppVersion, public navCtrl: NavController, public navParams: NavParams, public rootParam:RootParamsProvider, public userProvider:UserProvider) {
    this.title = "Setting";

    this.appVersion.getVersionNumber().then((data)=>{
      this.versionNumber = data;
    }).catch(rej=>{
      console.log(rej);
    })


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingHomePage');
  }







  logout(){
    setTimeout(() => {
      this.navCtrl.setRoot(LoginPage);

    }, 500)
    this.userProvider.logout();

  }
}
