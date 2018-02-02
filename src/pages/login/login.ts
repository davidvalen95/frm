import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {NgForm} from "@angular/forms";
import {UserProvider} from "../../providers/user/user";
import {BaseForm, InputType} from "../../components/Forms/base-form";
import {HomePage} from "../home/home";
import {StorageKey} from "../../app/app.component";

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public loginForms: BaseForm[] = [];

  constructor(public navCtrl: NavController, public userProvider: UserProvider) {
    this.setupForm()
    setTimeout(()=>{
      if(localStorage.getItem(StorageKey.USER_ID) && localStorage.getItem(StorageKey.USER_PASSWORD)){

          this.login(localStorage.getItem(StorageKey.USER_ID),localStorage.getItem(StorageKey.USER_PASSWORD));
          console.log('localStorageLogin')


      }
    },500)
  }

  loginFormSubmit(form: NgForm) {
    if (form.valid) {
      this.login(form.value.username, form.value.password);

    }
  }

  private login(username:string, password:string){
    this.userProvider.login(username, password, ((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.navCtrl.setRoot(HomePage);
      }
    }));
  }

  setupForm() {
    var username: BaseForm = new BaseForm("", 'username');
    username.placeholder   = "Username"
    username.rules = {};
    username["image"] = "assets/imgs/login_username.png"
    username.changeListener.subscribe(data=>{
      data.value = data.value.toUpperCase();
    })
    var password: BaseForm = new BaseForm("", 'password');
    password.placeholder   = "Password"
    password["image"] = "assets/imgs/login_password.png"
    password.inputType     = InputType.password;
    password.rules = {};

    this.loginForms.push(username, password);
  }

}
