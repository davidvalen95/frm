import {Component, ViewChild} from '@angular/core';
import {Alert, IonicPage, Navbar, NavController, NavParams, Platform, ToastController} from 'ionic-angular';
import {NgForm} from "@angular/forms";
import {ApiProvider, SuccessMessageInterface} from "../../../providers/api/api";
import {HelperProvider} from "../../../providers/helper/helper";
import {UserProvider} from "../../../providers/user/user";
import {RootParamsProvider} from "../../../providers/root-params/root-params";
import {BaseForm, InputType} from "../../../components/Forms/base-form";
import {HomePage} from "../../home/home";

/**
 * Generated class for the ChangeMyPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-change-my-password',
  templateUrl: 'change-my-password.html',
})
export class ChangeMyPasswordPage {


  @ViewChild(Navbar) navbar;
  public baseForms: BaseForm[] = [];
  public currentAlert:Alert;

  constructor(public platform:Platform, public navCtrl: NavController, public navParams: NavParams, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {

    this.setHardwareBackButton();

    this.setupBaseForm();
  }


  ionViewDidLoad() {
    // console.log('ionViewDidLoad ChangeMyPasswordPage');
    // this.navbar.backButtonClick = (e: UIEvent) => {
    //   this.leavePage();
    // }

  }


  public setupBaseForm() {


    var currentPassword = new BaseForm("Current Password", "oldpassword");
    currentPassword.setInputTypePassword();

    var newPassword = new BaseForm("new Password", "newpassword");
    newPassword.setInputTypePassword();

    var confirmPassword = new BaseForm("confirm Password", "conpassword");
    confirmPassword.setInputTypePassword();

    this.baseForms.push(currentPassword, newPassword, confirmPassword);

  }


  public formSubmit(form: NgForm) {


    if (form.valid) {

      var json = this.helperProvider.convertToJson(form);


      this.apiSubmitForm(json);

    } else {
      this.currentAlert = this.helperProvider.showAlert("Please check field(s) mark in red", "");
    }
  }



  public leavePage() {
    this.navCtrl.setRoot(HomePage);
  }


  public setHardwareBackButton(){
    this.platform.ready().then(() => {

      this.platform.registerBackButtonAction(() => {
        try{
          this.currentAlert.dismiss();          return;
        }catch(exception){
          console.log(exception);
        }
        this.leavePage();

      });
    });
  }


  public apiSubmitForm(json: any) {

    // http://10.26.5.74:8080/hrm2/s/com.ssoft.hrm.LoginMobile?username=MY080127&password=asd&oldpassword=asd&conpassword=asdd&newpassword=asdd&act=changepassword&callback=Ext.data.JsonP.callback101&_dc=1519637490423


    var url    = `${ ApiProvider.HRM_URL}s/com.ssoft.hrm.LoginMobile`;
    var params = {
      username: this.userProvider.userSession.empId,
      password: this.userProvider.userSession.password,
      act: "changepassword",
    }

    params = this.helperProvider.mergeObject(params, json);


    this.currentAlert = this.helperProvider.showConfirmAlert("Submit form?", () => {
      this.apiProvider.submitGet<SuccessMessageInterface>(url, params, (data) => {

        if (data.status == 'ok') {
          this.navCtrl.pop();
        }
        this.currentAlert = this.helperProvider.showAlert(data.message);


      })
    });


  }


}
