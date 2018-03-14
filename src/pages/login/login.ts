import {Component} from '@angular/core';
import {Alert, IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {NgForm} from "@angular/forms";
import {UserProvider} from "../../providers/user/user";
import {BaseForm, InputType, KeyValue} from "../../components/Forms/base-form";
import {HomePage} from "../home/home";
import {AppVersion} from "@ionic-native/app-version";
import {LocalStorageProvider} from "../../providers/local-storage/local-storage";
import {AlertStatusInterface, HelperProvider} from "../../providers/helper/helper";

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public loginForms: BaseForm[] = [];

  public version :KeyValue[] = [];

  public currentAlert:AlertStatusInterface;

  constructor(public helperProvider:HelperProvider, public platform:Platform, public navCtrl: NavController, public userProvider: UserProvider,public appVersion:AppVersion, public localStorageProvider:LocalStorageProvider) {

    this.setHardwareBackButton();
    // this.version.push({
    //   key: "App Name",
    //   value: this.appVersion.getAppName()
    // },{
    //   key: "Package Name",
    //   value: this.appVersion.getPackageName()
    // },{
    //   key: "Version Name",
    //   value: this.appVersion.getVersionCode()
    // },{
    //   key: "Version Number",
    //   value: this.appVersion.getVersionNumber()
    // })

    this.setupForm()
    setTimeout(()=>{

      if(this.localStorageProvider.getIsForgotMe()){
        return;
      }

      var username = this.localStorageProvider.getUsername();
      var password = this.localStorageProvider.getPassword();
      if( username && password ){

          this.login(username,password);
      }
    },500)
  }

  loginFormSubmit(form: NgForm) {
    if (form.valid) {
      this.login(form.value.username, form.value.password);

    }
  }

  private login(username:string, password:string){
    this.userProvider.login(username, password, ((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.navCtrl.setRoot(HomePage);
      }
    }));
  }

  setupForm() {
    var username: BaseForm = new BaseForm("", 'username');
    username.placeholder   = "Username"
    username.rules = {};
    username["image"] = "assets/imgs/login_username.png"
    username.changeListener.subscribe(data=>{
      data.value = data.value.toUpperCase();
    })
    var password: BaseForm = new BaseForm("", 'password');
    password.placeholder   = "Password"
    password["image"] = "assets/imgs/login_password.png"
    password.inputType     = InputType.password;
    password.rules = {};

    this.loginForms.push(username, password);
  }



  public leavePage() {

    this.currentAlert = this.helperProvider.showConfirmAlert("exit DxnHrms", () => {
      this.platform.exitApp();
    })
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
