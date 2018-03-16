import { Component } from '@angular/core';
import {Alert, IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {ApplyBaseInterface} from "../../../app/app.component";
import {AnnouncementListDataInterface} from "../AnnouncementApi";
import {AlertStatusInterface, HelperProvider} from "../../../providers/helper/helper";

/**
 * Generated class for the AnnouncementApplyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-announcement-apply',
  templateUrl: 'announcement-apply.html',
})
export class AnnouncementApplyPage {

  public pageParam: AnnouncementApplyParamInterface
  public title;
  public currentAlert:AlertStatusInterface;
  constructor(public platform:Platform, public helperProvider:HelperProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.setHardwareBackButton();
    this.pageParam = this.navParams.data;

    this.title = this.pageParam.title;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AnnouncementApplyPage');
  }



  public leavePage() {

    this.currentAlert = this.helperProvider.showConfirmAlert("leave this page", () => {
      this.navCtrl.pop({}, () => {

      });
    })
  }
  ionViewWillEnter(){
    this.setHardwareBackButton();
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


export interface AnnouncementApplyParamInterface extends ApplyBaseInterface<AnnouncementListDataInterface>{

}
