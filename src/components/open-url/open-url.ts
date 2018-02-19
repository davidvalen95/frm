import {Component, Injectable, Input} from '@angular/core';
import {Loading} from "ionic-angular";
import {InAppBrowser, InAppBrowserObject} from "@ionic-native/in-app-browser";
import {HelperProvider} from "../../providers/helper/helper";

/**
 * Generated class for the OpenUrlComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'open-url',
  templateUrl: 'open-url.html'
})

@Injectable()
export class OpenUrlComponent {

  text: string;


  @Input() url: string = null;
  @Input() name:string = "Open this link";
  constructor(public helperProvider:HelperProvider, public inAppBrowser:InAppBrowser) {
    this.text = 'Hello World';
  }


  public  openUrl(){
    try{
      if(this.url!=null){
        var browser:InAppBrowserObject = this.inAppBrowser.create(this.url);

      }
    }catch(err) {
      this.helperProvider.presentToast("Cannot open url")
    }

  }

}

