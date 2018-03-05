import {ChangeDetectorRef, Component} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {RootParamsProvider} from "../../../providers/root-params/root-params";
import {UserProvider} from "../../../providers/user/user";
import {LoginPage} from "../../login/login";
import {AppVersion} from "@ionic-native/app-version";
import {HelperProvider} from "../../../providers/helper/helper";
import {LocalStorageProvider} from "../../../providers/local-storage/local-storage";
import {NgModel} from "@angular/forms";

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
  public isAutoLogin:boolean;
  constructor(private cdr: ChangeDetectorRef, public localStorageProvider:LocalStorageProvider, public helperProvider:HelperProvider, public appVersion: AppVersion, public navCtrl: NavController, public navParams: NavParams, public rootParam:RootParamsProvider, public userProvider:UserProvider) {
    this.title = "Setting";
    this.isAutoLogin = !this.localStorageProvider.getIsForgotMe();
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
    this.helperProvider.showConfirmAlert("Are you sure to logout?",()=>{
      setTimeout(() => {
        this.navCtrl.setRoot(LoginPage);

      }, 500)
      this.userProvider.logout();
    });
  }

  public commitLocalStorage(){
    this.localStorageProvider.setIsForgotMe(""+(!this.isAutoLogin));
  }
}
