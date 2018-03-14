import { Component } from '@angular/core';
import {Alert, AlertController, IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import {ApplyLeaveApplicationParam} from "../../application/leave/apply-leave-application/apply-leave-application";
import {BaseForm, InputType} from "../../../components/Forms/base-form";
import {ApiProvider} from "../../../providers/api/api";
import {AlertStatusInterface, HelperProvider} from "../../../providers/helper/helper";
import {RootParamsProvider} from "../../../providers/root-params/root-params";
import {UserProvider} from "../../../providers/user/user";
import {NgForm} from "@angular/forms";

/**
 * Generated class for the ApplicationFormSkeletonPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-application-form-skeleton',
  templateUrl: 'application-form-skeleton.html',
})
export class ApplicationFormSkeletonPage {

  public pageParam:ApplyLeaveApplicationParam;
  public baseForms:BaseForm[] = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider:HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    this.pageParam = navParams.data;

    this.setupForms();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ApplyLeaveApplicationPage');

  }

  setupForms(){


    var test = new BaseForm("Test Input","test");
    test.changeListener.subscribe((baseForm:BaseForm)=>{});
    test.inputType = InputType.file;





    this.baseForms.push(test);
  }

  formSubmit(form:NgForm){

  }


  public leavePage(){

    this.showConfirmAlert("leave this page",()=>{
      this.navCtrl.pop({},()=>{

      });

    })
  }


  public showConfirmAlert(message:string, handler:()=>void):Alert{

    //#alertconfirmation
    var alert:Alert = this.alertController.create({
      title:"Confirmation",
      message: `Are you sure to ${message}?`,
      buttons:[
        {text:"no",role:"cancel"},
        {
          text:"yes",
          handler:handler
        }
      ]
    })
    alert.present();
    return alert;
  }


}


export interface ApplicationFormSkeletonParam{

}
