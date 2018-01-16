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
import {HeaderColor} from "@ionic-native/header-color";
import { UserProvider } from '../providers/user/user';
import {HttpClientModule} from "@angular/common/http";
import { ApiProvider } from '../providers/api/api';
import {DatePicker} from "@ionic-native/date-picker";
import {SearchBarPage} from "../pages/search-bar/search-bar";
import {shim} from "promise.prototype.finally";
import {VisitationDetailPage} from "../pages/visitation-detail/visitation-detail";
import {PipesModule} from "../pipes/pipes.module";
import {ContainerInPage} from "../pages/container-in/container-in";
import {LoginPage} from "../pages/login/login";
import { RootParamsProvider } from '../providers/root-params/root-params';
import {EmptyPage} from "../pages/empty/empty";

@NgModule({
  declarations: [
    ArrowOpenDirective,
    FormErrorMessageComponent,
    FloatingInputComponent,
    HomePage,
    ListPage,
    MyApp,
    SearchBarPage,
    VisitationDetailPage,
    VisitationApplicationPage,
    ContainerInPage,
    LoginPage,
    EmptyPage

  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    FormsModule,
    HttpClientModule,
    PipesModule,


  ],
  bootstrap: [IonicApp],
  entryComponents: [
    HomePage,
    ListPage,
    MyApp,
    SearchBarPage,
    VisitationApplicationPage,
    VisitationDetailPage,
    ContainerInPage,
    LoginPage,
    EmptyPage,

  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    HeaderColor,
    UserProvider,
    ApiProvider,
    DatePicker,
    RootParamsProvider
  ]
})
export class AppModule {}
