import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {ApplyBaseInterface} from "../../../app/app.component";
import {AnnouncementListDataInterface} from "../AnnouncementApi";

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
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.pageParam = this.navParams.data;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AnnouncementApplyPage');
  }

}


export interface AnnouncementApplyParamInterface extends ApplyBaseInterface<AnnouncementListDataInterface>{

}
