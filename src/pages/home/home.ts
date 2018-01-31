import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {NgForm} from "@angular/forms";
import {BaseForm, InputType} from "../../components/Forms/base-form";
import {UserProvider} from "../../providers/user/user";
import {LoginPage} from "../login/login";
import {MyHelper} from "../../app/MyHelper";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public userProvider:UserProvider) {
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



}
