import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ApiProvider, MenusApiInterface, UserSessionApiInterface} from "../api/api";
import {NavController} from "ionic-angular";
import {LoginPage} from "../../pages/login/login";
import {RootParamsProvider} from "../root-params/root-params";
import {StorageKey} from "../../app/app.component";
import {ReplaySubject} from "rxjs/ReplaySubject";

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

  public userSession:UserSessionApiInterface = {isLoggedIn:false,isFnFReady:false};
  public watchFnF:ReplaySubject<any> = new ReplaySubject(5);
  constructor(public http: HttpClient, public api:ApiProvider, public rootParam:RootParamsProvider) {
    this.userSession.isFnF = false;
    this.userSession.isFnFReady = false;
    console.log('Hello UserProvider Provider');
    // this.homeMenu.push({isOpen:false,menu_id:"test",menu_name:"re"})
    if(rootParam.isPartial){
      // this.userSession.empId = localStorage.getItem(StorageKey.USER_ID) || "MY080127";
      // this.userSession.userId = this.userSession.empId;

      var userid = localStorage.getItem(StorageKey.USER_ID);
      var password = localStorage.getItem(StorageKey.USER_PASSWORD);

      this.userSession.userId = this.userSession.empId =  userid;
      // this.login(userId,password);
      this.api.login(userid,password).then((userSession:UserSessionApiInterface)=>{
         // = userSession;
        this.userSession = userSession;
        this.userSession.isFnFReady = false;
        this.userSession.isLoggedIn = true;
        this.getFnf();

      }).catch(()=>{

      })

      console.log('localstorageUserProvider',this.userSession.empId);

    }
  }

  login(username:string, password:string, loginListener?:(isLoggedIn:boolean)=>void) {
    this.api.presentLoading("Logging in");

    this.api.login(username, password).then((data: UserSessionApiInterface) => {
      if(data["status"] =="ok"){
        this.concatArray(this.userSession,data);
        this.userSession.isLoggedIn = true;
        this.getFnf();
        console.log(this.userSession);
        return this.api.getMenu(this.userSession.empId);
      }
      return new Promise((resolve,reject)=>{
        reject("Wrong username or password");
      })
    }).then((data: MenusApiInterface[]) => {

      this.homeMenu.splice(0,this.homeMenu.length);
      // this.concatArray(this.homeMenu,data["parent_menu"]);
      // this.homeMenu[2].menu.push(
      //   {menu:[],menu_id:"containerIn",menu_name:"Container",isOpen:true},
      //
      // );
      // this.homeMenu[this.homeMenu.length - 1].menu.push({menu_id:"logout",menu_name:"Logout",isOpen:false});

      // console.log(data["parent_menu"]);

      this.hardCodeMenu();
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

  logout(){
    this.userSession = {isLoggedIn: false};
  }


  concatArray(target:any, source:any){
    for(var key in source){
      target[key] = (source[key]);
    }
  }

  hardCodeMenu(){

    this.homeMenu.push({
      menu_name:"Home",
      menu_id:"home",
      menu:[{
        menu_name:"Home",
        menu_id:"home",
        menu:[],
        isOpen:false,
      }],
      isOpen:false
    })

    this.homeMenu.push({
      menu_name:"Application",
      menu_id:"application",
      menu:[{
        menu_name:"Visitation",
        menu_id:"visitation",
        menu:[],
        isOpen:false,
      },{
        menu_name:"Container",
        menu_id:"container",
        menu:[],
        isOpen:false,
      }],
      isOpen:false
    })

    this.homeMenu.push({
      menu_name:"Approval",
      menu_id:"approval",
      menu:[{
        menu_name:"Visitation",
        menu_id:"visitation_approval",
        menu:[],
        isOpen:false,
      }],
      isOpen:false
    })

    this.homeMenu.push({
      menu_name:"Account",
      menu_id:"account",
      menu:[{
        menu_name:"Logout",
        menu_id:"logout",
        menu:[],
        isOpen:false,
      }],
      isOpen:false
    })
  }

  private getFnf(){
    this.api.getSelectOptionsVisitation(this).subscribe((data)=>{
      this.userSession.isFnF = (<string>data["loc_id"]).toLowerCase() == "fnf"
      this.userSession.isFnFReady = true;
      this.watchFnF.next(true);
    })
  }
}
