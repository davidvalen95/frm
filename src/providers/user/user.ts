import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ApiProvider, MenusApiInterface, UserSessionApiInterface} from "../api/api";

/*
  Generated class for the UserProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()

export class UserProvider {



  public homeMenu:MenusApiInterface[] = [{
    isOpen: false,
    menu_id: "authorization",
    menu_name: "Authorization",
    menu: [{
      isOpen:false,
      menu_id: "home",
      menu_name:"Home",
    }],

  }];

  public userSession:UserSessionApiInterface = {isLoggedIn:false};
  constructor(public http: HttpClient, public api:ApiProvider) {
    console.log('Hello UserProvider Provider');
    // this.homeMenu.push({isOpen:false,menu_id:"test",menu_name:"re"})
  }

  login(username:string, password:string, loginListener?:(isLoggedIn:boolean)=>void) {
    this.api.login(username, password).then((data: UserSessionApiInterface) => {
      if(data["status"] =="ok"){
        this.concatArray(this.userSession,data);
        this.userSession.isLoggedIn = true;
        console.log(this.userSession);
        return this.api.getMenu(this.userSession.userId);
      }
      return new Promise((resolve,reject)=>{
        reject("Wrong username or password");
      })
    }).then((data: MenusApiInterface[]) => {

      this.homeMenu.splice(0,this.homeMenu.length);
      this.concatArray(this.homeMenu,data["parent_menu"]);
      this.homeMenu[2].menu.push(
        {menu:[],menu_id:"containerIn",menu_name:"Container",isOpen:true},

      );
      loginListener(true);

      console.log('menu',data);
      // this.homeMenu.push({
      //   isOpen: false,
      //   menu_id: "",
      //   menu_name: "My Application",
      //   menu: [{
      //     isOpen:false,
      //     menu_id:"visitationApplication",
      //     menu_name:"Visitation Application"
      //   }]
      // });
    }).catch(rejected=>{
      this.api.presentToast(rejected.toString());
    }).finally(()=>{
      this.api.dismissLoader();
    });

  }



  concatArray(target:any, source:any){
    for(var key in source){
      target[key] = (source[key]);
    }
  }


}
