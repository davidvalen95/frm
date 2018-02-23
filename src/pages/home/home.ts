import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {NgForm} from "@angular/forms";
import {BaseForm, InputType} from "../../components/Forms/base-form";
import {UserProvider} from "../../providers/user/user";
import {LoginPage} from "../login/login";
import {MyHelper} from "../../app/MyHelper";
import {HttpClient} from "@angular/common/http";
import {ApiProvider} from "../../providers/api/api";
import {HelperProvider} from "../../providers/helper/helper";
import {AnnouncementListInterface} from "../announcement/AnnouncementApi";
import {AnnouncementHomePage} from "../announcement/announcement-home/announcement-home";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  public circleMenus:CircleMenuInterface[] = [];
  public announcement: AnnouncementListInterface;
  public announcementHomePage = AnnouncementHomePage;
  constructor(public navCtrl: NavController, public userProvider:UserProvider, public httpClient:HttpClient, public helperProvider:HelperProvider) {
    this.setupCircleMenu()

    this.apiExecuteGetAnnouncement();

    console.log('afterAnouncement')
  }

  logout(){
    this.userProvider.logout()
    this.navCtrl.setRoot(LoginPage)
  }


  test(event){
    console.log(event)

    MyHelper.readFile(event.target,(result)=>{
      console.log(result);
    })
  }


  private setupCircleMenu(){

    var application:CircleMenuInterface = {
      image: "assets/imgs/home/application.png",
      title: "Application",
      badge: "application",
    };

    var attendanceRecord:CircleMenuInterface = {
      image: "assets/imgs/home/attendance-record.png",
      title: "Attendance Record",
      badge: "attendanceRecord",

    };

    var calender:CircleMenuInterface = {
      image: "assets/imgs/home/calender.png",
      title: "Calender",
      badge: "calender",
    };

    var leaveApproval:CircleMenuInterface = {
      image: "assets/imgs/home/leave-approval.png",
      title: "Leave Approval",
      badge: "leaveApproval",
    };


    var overtime:CircleMenuInterface = {
      image: "assets/imgs/home/overtime-approval.png",
      title: "Overtime Approval",

      badge: "overtimeApproval",
    };


    var otherApproval:CircleMenuInterface = {
      image: "assets/imgs/home/other-approval.png",
      title: "Other Approval",

      badge: "otherApproval",
    };





    this.circleMenus.push(application,attendanceRecord,calender,leaveApproval,overtime,otherApproval);

  }



  private async apiExecuteGetAnnouncement(){
    // http://10.26.5.74:8080/hrm2/s/AnnouncementMobile?act=list&_dc=1519279881848&mobile=true&userid=MY080127&adate_from=01%20Jan%202018&adate_to=14%20Feb%202018&limit=3000&page=1&start=0


    try{
      var url = `${ApiProvider.HRM_URL}s/AnnouncementMobile`;

      var params = {
        act: "list",
        mobile: "true",
        userid: this.userProvider.userSession.empId,
        adate_from: this.helperProvider.getServerDateFormat(BaseForm.getAdvanceDate(-60,new Date())),
        adate_to: this.helperProvider.getServerDateFormat(BaseForm.getAdvanceDate(0,new Date())),
        limit: "3000",
        page:"1",
        start: "0",
      }


      var result = await this.httpClient.get<AnnouncementListInterface>(url,{withCredentials:true, params:params}).toPromise();

      this.announcement = result;

      console.log('aanouncement', result);

    }catch(err){
      console.log(err);
    }



  }



}







interface CircleMenuInterface{
  image:string,
  title:string,
  badge: string,

};
