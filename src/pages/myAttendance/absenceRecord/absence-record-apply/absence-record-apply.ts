import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {ApplyBaseInterface} from "../../../../app/app.component";
import {AbsenceRecordListDataInterface} from "../AbsenceRecordApiInterface2";

/**
 * Generated class for the AbsenceRecordApplyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-absence-record-apply',
  templateUrl: 'absence-record-apply.html',
})
export class AbsenceRecordApplyPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AbsenceRecordApplyPage');
  }

}



export interface AbsenceRecordApplyInterface extends ApplyBaseInterface<AbsenceRecordListDataInterface>{

}
