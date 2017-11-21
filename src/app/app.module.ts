import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {VisitationApplicationPage} from "../pages/application/visitation-application/visitation-application";
import {ArrowOpenDirective} from "../directives/arrow-open/arrow-open";
import {FloatingInputComponent} from "../components/Forms/floating-input/floating-input";
import {FormsModule} from "@angular/forms";
import {FormErrorMessageComponent} from "../components/Forms/form-error-message/form-error-message";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    VisitationApplicationPage,
    ArrowOpenDirective,
    FloatingInputComponent,
    FormErrorMessageComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    FormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    VisitationApplicationPage,

  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
