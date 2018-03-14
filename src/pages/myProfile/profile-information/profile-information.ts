import { Component } from '@angular/core';
import {Alert, IonicPage, NavController, NavParams, Platform, ToastController} from 'ionic-angular';
import {ApiProvider} from "../../../providers/api/api";
import {AlertStatusInterface, HelperProvider} from "../../../providers/helper/helper";
import {UserProvider} from "../../../providers/user/user";
import {RootParamsProvider} from "../../../providers/root-params/root-params";
import {HomePage} from "../../home/home";

/**
 * Generated class for the ProfileInformationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile-information',
  templateUrl: 'profile-information.html',
})
export class ProfileInformationPage {

  public profileInformation:ProfileInformationInterface = {profile:"",picture:""};
  public title;
  public currentAlert: Alert;
  constructor( public platform:Platform, public navCtrl: NavController, public navParams: NavParams,  public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    this.setHardwareBackButton();
    this.title="Profile Information";
    this.getData();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfileInformationPage');
  }


  public getData(){

    // /hrm2/s/com.ssoft.hrm.LoginMobile?act=profile&username=MY080127&password=MY080127&callback=Ext.data.JsonP.callback86&_dc=1519636459248
    var url = ApiProvider.HRM_URL + "s/com.ssoft.hrm.LoginMobile";
    var params = {
      act: "profile",
      username: this.userProvider.userSession.empId,
      password: this.userProvider.userSession.password
    };
    // this.userProvider.userSession.


    this.apiProvider.get<ProfileInformationInterface>({url:url,params:params},(data)=>{
      console.log('data',data);
      this.profileInformation = data;
      this.profileInformation.picture = this.profileInformation.picture && this.profileInformation.picture != '' ? this.apiProvider.hrmUrl + 'pub/' + this.profileInformation.picture : "assets/imgs/profile.png";
    })
  }


  public leavePage() {
    this.navCtrl.setRoot(HomePage);
  }


  public setHardwareBackButton(){
    this.platform.ready().then(() => {

      this.platform.registerBackButtonAction(() => {
        try{
          if(this.currentAlert.isPresent){this.currentAlert.alert.dismiss(); return;}
        }catch(exception){
          console.log(exception);
        }
        this.leavePage();

      });
    });
  }
}


interface ProfileInformationInterface{
  profile:string;
  picture:string;
}
