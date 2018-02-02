import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {MyHelper} from "../../app/MyHelper";
import {Alert, AlertController, LoadingController, ToastController} from "ionic-angular";

/*
  Generated class for the HelperProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HelperProvider {

  constructor(public loadingController:LoadingController, public toastController:ToastController, public http: HttpClient, public alertController:AlertController) {
    console.log('Hello HelperProvider Provider');
  }


  public getYearRange() {
    var currentYear    = new Date().getFullYear();
    var year: string[] = [];
    for (var i = 1; i >= 0; i--) {
      year.push('' + (<number>currentYear - i))
    }
    return year;
  }


  public ucWord(target:string){
    return MyHelper.ucWord(target);
  }

  public showConfirmAlert(message: string, handler:()=>void){
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


  presentToast(message?: string) {
    if (message) {
      this.toastController.create({
        message: message,
        duration: 2000,
      }).present();
    }
  }

  presentLoadingV2(message?: string) {
    var loader = this.loadingController.create();
    loader.setContent(message);
    loader.present();

    return loader;
  }

  public getCurrentDate(isIso:boolean = true) {
    var currentTime = new Date();
// returns the month (from 0 to 11)
    var month       = ('0' + currentTime.getMonth()).slice(-2);
// returns the day of the month (from 1 to 31)
    var day         = ('0' + currentTime.getDate()).slice(-2);
// returns the year (four digits)
    var year        = currentTime.getFullYear();
    var mmm = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    console.log('max date', `${year}-${month}-${day}`)
    if(isIso){
      return currentTime.toISOString()
    }else{
      return `${day} - ${mmm[currentTime.getMonth()]} - ${year}`;
    }
  }


  public getDifferentDay(date1:Date | string, date2: Date | string){


    if( date1 !instanceof  Date){
      date1 = new Date(<string>date1);
    }
    if( date2 !instanceof  Date){
      date2 = new Date(<string>date2);
    }


    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds


    var diffDays = Math.round(Math.abs(((<Date>date1).getTime() - (<Date>date2).getTime())/(oneDay)));

    return diffDays;

  }

}
