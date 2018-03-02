import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {HelperProvider} from "../helper/helper";

/*
  Generated class for the LocalStorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocalStorageProvider {



  private static USERNAME = "username_asdf1234";
  private static PASSWORD = "password_asdf1234";
  private static FORGOTME = "forgotme_asdf1234";


  constructor(public http: HttpClient, public helperProvider:HelperProvider) {
    console.log('Hello LocalStorageProvider Provider');
  }

  public setUsername(username:string){
    localStorage.setItem(LocalStorageProvider.USERNAME,username)
  }
  public getUsername(){
    return localStorage.getItem(LocalStorageProvider.USERNAME);
  }
  public removeUsername(){
    localStorage.removeItem(LocalStorageProvider.USERNAME);
  }

  public setPassword(password:string){
    localStorage.setItem(LocalStorageProvider.PASSWORD,password)
  }
  public getPassword(){
    return localStorage.getItem(LocalStorageProvider.PASSWORD);
  }
  public removePassword(){
    localStorage.removeItem(LocalStorageProvider.PASSWORD);
  }

  public setIsForgotMe(isForgotme:string){
    localStorage.setItem(LocalStorageProvider.FORGOTME,isForgotme)
  }
  public getIsForgotMe():boolean{
    var result = localStorage.getItem(LocalStorageProvider.FORGOTME);
    if(result){
      return this.helperProvider.parseBoolean(result);
    }
    return false;
  }
  public removeIsForgotMe(){
    localStorage.removeItem(LocalStorageProvider.FORGOTME);
  }









}
