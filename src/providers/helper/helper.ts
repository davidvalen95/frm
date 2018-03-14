import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {MyHelper} from "../../app/MyHelper";
import {Alert, AlertController, LoadingController, ToastController} from "ionic-angular";
import {NgForm} from "@angular/forms";
import {TextValueInterface} from "../api/api";
import {KeyValue} from "../../components/Forms/base-form";

/*
  Generated class for the HelperProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HelperProvider {

  constructor(private loadingController:LoadingController, private toastController:ToastController, private http: HttpClient, private alertController:AlertController) {
    console.log('Hello HelperProvider Provider');
  }


  public getFilterYear(){

    return [(new Date().getFullYear()),(new Date().getFullYear() - 1)];
  }

  /**
   * Buat dapetin year sekarang sama taun lalu di apply filter
   * @returns {string[]}
   */
  public getCmbRule(filterJson:any, selector:string):TextValueInterface[] {


    // if()

    if(selector == "month"){
      var mmm = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      var textValueContainer:TextValueInterface[] = [];
      textValueContainer.push({text:"-- All --",value:""});
      for(var i =1 ; i <=12 ; i++){
        textValueContainer.push({text: mmm[i-1],value:""+i});
      }
      return textValueContainer;
    }

    if(filterJson){
      var cmbSelector:TextValueInterface[] = filterJson[selector];
      for(var key in  cmbSelector){
        cmbSelector[key].value = `${cmbSelector[key].value}`;
      }
    }



    return cmbSelector;
  }

  public getCmbStatus(apiTop:any){
    var status:string[] = [];
    var cmbYear:TextValueInterface[] = apiTop["cmbStatus"];

    for (var key in cmbYear){
      var value = cmbYear[key];
      status.push('' + value.value)
    }
  }


  /**
   * huruf capital pertama
   * @param {string} target
   * @returns {string}
   */
  public ucWord(target:string){
    return MyHelper.ucWord(target);
  }

  /**
   * Ada button cancel sama ok, kalo ok callback handler
   * @param {string} message
   * @param {() => void} handler
   * @returns {Alert}
   */
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
    var status:AlertStatusInterface = {
      alert: alert,
      isPresent: true,
    }
    alert.onDidDismiss(()=>{
      status.isPresent = false;
    });
    alert.present();
    return status;
  }

  public showConfirmRawAlert(message: string, handler:()=>void):AlertStatusInterface{
    var alert:Alert = this.alertController.create({
      title:"Confirmation",
      message: `${message}`,
      buttons:[
        {text:"no",role:"cancel"},
        {
          text:"yes",
          handler:handler
        }
      ]
    })
    alert.present();
    var status:AlertStatusInterface = {
      alert: alert,
      isPresent: true,
    }
    alert.onDidDismiss(()=>{
      status.isPresent = false;
    });
    alert.present();
    return status;
  }

  /**
   * satu tombol OK
   * @param {string} message
   * @param {string} title
   * @returns {Alert}
   */
  public showAlert(message:string, title:string = "Info"):AlertStatusInterface{

    var alert:Alert = this.alertController.create({
      title: title,
      message:message,
      buttons: [{text:"Ok",role:"cancel"}],
    });

    var status:AlertStatusInterface = {
      alert: alert,
      isPresent: true,
    }
    alert.onDidDismiss(()=>{
      status.isPresent = false;
    });
    alert.present();
    return status;
  }


  /**
   * yang ada pop up di bawah item2
   * @param {string} message
   */
  presentToast(message?: string) {
    if (message) {
      this.toastController.create({
        message: message,
        duration: 4000,
      }).present();
    }
  }

  /**
   * return Loader yang harus di dismiss()
   * @param {string} message
   * @returns {Loading}
   */
  presentLoadingV2(message?: string) {
    var loader = this.loadingController.create();
    loader.setContent(message);
    loader.present();

    return loader;
  }

  /**
   * dapeting tanggal hari ini
   * @param {boolean} isIso
   * @returns {string} 4 Feb 2018
   */
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


  /**
   * mendapatkan selisih dari 2 tanggal
   * @param {Date | any} date1 bisa ISO atau Date
   * @param {Date | any} date2
   * @returns {number}
   */

  public getDifferentDay(date1:Date | any, date2: Date | any){

      date1 = new Date(date1);
      date2 = new Date(date2);


    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds


    var diffDays = Math.round(Math.abs(((<Date>date1).getTime() - (<Date>date2).getTime())/(oneDay)));

    return diffDays;

  }


  /**
   * convert form to submitable value
   * @param {NgForm} form
   * @returns {Object}
   */
  public convertToJson(form:NgForm):object{

    var jsonValue:object = {};
    for (var key in form.value) {
      if(key.indexOf("attachment") <= -1){
        jsonValue[key] = form.value[key];

      }
    }

    console.log('convertToJson', jsonValue);

    return jsonValue;
  }


  /**
   * iso changed  server accepted date
   * @param {Object} formValues
   * @param {string[]} shouldProcess
   * @returns {Object}
   */
  public convertIsoToServerDate(formValues: object, shouldProcess: string[]) {
    var mmm = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (var key in formValues) {
      if (typeof (formValues[key]) == "string") {
        try {
          var date = new Date(formValues[key]);
          if (!isNaN(date.getFullYear()) && shouldProcess.find((value: string) => {
              return value == key
            })) {
            console.log('preprocessed', formValues[key], date.getUTCDate());

            formValues[key] = ('0' + date.getUTCDate()).slice(-2) + ` ${mmm[date.getUTCMonth()]} ${date.getUTCFullYear()}`

          }
        } catch (e) {
          console.log('error', e.toString())
        }
      }

    }

    console.log("convertIsoToServerDate", formValues);
    return formValues;
  }


  /**
   * convert single date to
   * @param {Date} date
   * @returns {string}
   */
  public getServerDateFormat(date: Date):string{
    var mmm = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    try {
      return ('0' + date.getUTCDate()).slice(-2) + ` ${mmm[date.getUTCMonth()]} ${date.getUTCFullYear()}`
    } catch (e) {
      console.log('error', e.toString())
    }

    return "";

  }

  /**
   * to server accepted time
   * @param {Object} formValues
   * @param {string[]} shouldProcess
   * @returns {Object}
   */
  public preprocessingTime(formValues: object, shouldProcess: string[]) {
    for (var key in formValues) {
      if (typeof (formValues[key]) == "string") {
        try {
          var date = new Date(formValues[key]);
          if (!isNaN(date.getFullYear()) && shouldProcess.find((value: string) => {
              if (value == key) {
                console.log("preprocessingTime", date, formValues[key]);
              }

              return value == key
            })) {

            formValues[key] = `${date.getUTCHours()}:${date.getUTCMinutes()}`;

            // console.log('preprocessingTimeBefore',formValues[key],new Date(formValues[key]));
            //
            // // var timezoneDate = BaseForm.setDateTimezone(new Date(formValues[key]),8);
            // console.log('preprocessingTimeProcessed',timezoneDate);
            //
            // // formValues[key] = `${timezoneDate.getHours()}:${timezoneDate.getMinutes()}`;
            // console.log('preprocessingTimeAfter',formValues[key]);

          }
        } catch (e) {
          console.log('error', e.toString())
        }
      }

    }
    return formValues;
  }


  /**
   * a di tumpuk sama b kalo kembar ~= b overides a
   * @param {Object} a
   * @param {Object} b
   * @returns {Object}
   */
  public mergeObject(a:object,b:object):any{
    Object.keys(b).forEach(function(key) { a[key] = b[key]; });

    return a;
  }

  public parseBoolean(value:any):boolean{
    if (typeof(value) === 'string'){
      value = value.trim().toLowerCase();
    }
    switch(value){
      case true:
      case "true":
      case 1:
      case "1":
      case "on":
      case "yes":
        return true;
      default:
        return false;
    }
  }

  /**
   * mau dapetin Key dari value AL
   * di iterate sampe dapet value AL
   * di return KEYValue / TextValue  itu
   * @param array
   * @param {string} targetSearch misal Generic Text Value, jadi target Search nya "value"
   * @param {string} search
   * @returns {T}
   */
  public getObjectInArray<T>(array: any, targetSearch:string, search: string):T {


    for (var key in array) {
      if (array[key][targetSearch] == search) {
        return <T>array[key]
      }
    }
    return null;
  }

  /**
   * 28 Mar 2018 -> ISOFORMAT
   * @param {string} serverDate
   */


  /**
   * swap a - b order g penting,
   * does not change origin
   * @param source
   * @param {string} a
   * @param {string} b
   *
   * must capture the return
   */
  public swapObject(source:any,a:string,b:string){
    var copySource = Object.assign({},source);
    var bankSwitch = {};
    Object.assign(bankSwitch,copySource[a]);
    Object.assign(copySource[a],copySource[b]);
    Object.assign(copySource[b],bankSwitch);

    return source;
  }


}


export interface AlertStatusInterface{
  alert: Alert,
  isPresent:boolean,
}

