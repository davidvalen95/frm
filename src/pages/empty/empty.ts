import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {RootParamsProvider} from "../../providers/root-params/root-params";

/**
 * Generated class for the EmptyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-empty',
  templateUrl: 'empty.html',
})
export class EmptyPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,public rootParam:RootParamsProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EmptyPage');
  }

}
