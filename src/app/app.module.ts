import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, Injectable, Injector, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {ListPage} from '../pages/list/list';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {VisitationApplicationPage} from "../pages/application/visitation-application/visitation-application";
import {ArrowOpenDirective} from "../directives/arrow-open/arrow-open";
import {FloatingInputComponent} from "../components/Forms/floating-input/floating-input";
import {FormsModule} from "@angular/forms";
import {FormErrorMessageComponent} from "../components/Forms/form-error-message/form-error-message";
import {HeaderColor} from "@ionic-native/header-color";
import {UserProvider} from '../providers/user/user';
import {HttpClientModule} from "@angular/common/http";
import {ApiProvider} from '../providers/api/api';
import {DatePicker} from "@ionic-native/date-picker";
import {SearchBarPage} from "../pages/search-bar/search-bar";
import {shim} from "promise.prototype.finally";
import {VisitationDetailPage} from "../pages/visitation-detail/visitation-detail";
import {PipesModule} from "../pipes/pipes.module";
import {LoginPage} from "../pages/login/login";
import {RootParamsProvider} from '../providers/root-params/root-params';
import {EmptyPage} from "../pages/empty/empty";
import {AndroidPermissions} from "@ionic-native/android-permissions";
import {HomeLeaveApplicationPage} from "../pages/application/leave/home-leave-application/home-leave-application";
import {HomeExchangeApplicationPage} from "../pages/application/exchange/home-exchange-application/home-exchange-application";
import {HelperProvider} from '../providers/helper/helper';
import {ApplyLeaveApplicationPage} from "../pages/application/leave/apply-leave-application/apply-leave-application";
import {ApplyExchangeApplicationPage} from "../pages/application/exchange/apply-exchange-application/apply-exchange-application";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {HomeOvertimeApplicationPage} from "../pages/application/overtime/home-overtime-application/home-overtime-application";
import {ApplyOvertimeApplicationPage} from "../pages/application/overtime/apply-overtime-application/apply-overtime-application";
import {DetailKeyValueComponent} from "../components/detail-key-value/detail-key-value";
import {ComponentsModule} from "../components/components.module";
import {OpenUrlComponent} from "../components/open-url/open-url";
import {AppVersion} from "@ionic-native/app-version";
import {WorkoutsideHomePage} from "../pages/application/workoutside/workoutside-home/workoutside-home";
import {WorkoutsideApplyPage} from "../pages/application/workoutside/workoutside-apply/workoutside-apply";
import {SectionFloatingInputComponent} from "../components/Forms/section-floating-input/section-floating-input";
import {CalenderComponent} from "../components/calender/calender";
import {Calendar} from "@ionic-native/calendar";
import {ContainerInApplyPage} from "../pages/application/containerIn/container-in-apply/container-in-apply";
import {ContainerInHomePage} from "../pages/application/containerIn/container-in-home/container-in-home";
import {AbsenceRecordApplyPage} from "../pages/myAttendance/absenceRecord/absence-record-apply/absence-record-apply";
import {AbsenceRecordHomePage} from "../pages/myAttendance/absenceRecord/absence-record-home/absence-record-home";
import {IncompleteRecordApplyPage} from "../pages/myAttendance/incompleteRecord/incomplete-record-apply/incomplete-record-apply";
import {IncompleteRecordHomePage} from "../pages/myAttendance/incompleteRecord/incomplete-record-home/incomplete-record-home";
import {CalenderPage} from "../pages/calender/calender";
import {Badge} from "@ionic-native/badge";
import {AsyncPipe} from "@angular/common";
import {HostFormComponent} from "../components/host-form/host-form";
import {AnnouncementHomePage} from "../pages/announcement/announcement-home/announcement-home";
import {AnnouncementApplyPage} from "../pages/announcement/announcement-apply/announcement-apply";
import {Pro} from "@ionic/pro";

Pro.init('f4ce1597', {
  appVersion: '1.9.08'
})

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    Pro.monitoring.handleNewError(err);
    // Remove this if you want to disable Ionic's auto exception handling
    // in development mode.
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}


//tes
@NgModule({
    declarations: [
        ArrowOpenDirective,
        FormErrorMessageComponent,
        FloatingInputComponent,
        DetailKeyValueComponent,
        OpenUrlComponent,
        SectionFloatingInputComponent,
        CalenderComponent,
        HostFormComponent,



        HomePage,
        AnnouncementHomePage,
        AnnouncementApplyPage,
        ListPage,
        MyApp,
        SearchBarPage,

        LoginPage,
        EmptyPage,

        CalenderPage,


        VisitationDetailPage,
        VisitationApplicationPage,

        HomeLeaveApplicationPage,
        ApplyLeaveApplicationPage,

        HomeExchangeApplicationPage,
        ApplyExchangeApplicationPage,
        HomeOvertimeApplicationPage,
        ApplyOvertimeApplicationPage,

        WorkoutsideHomePage,
        WorkoutsideApplyPage,

        ContainerInApplyPage,
        ContainerInHomePage,




      //# myAttendance
        AbsenceRecordHomePage,
        AbsenceRecordApplyPage,

        IncompleteRecordHomePage,
        IncompleteRecordApplyPage,
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
      AnnouncementHomePage,
      AnnouncementApplyPage,
      ListPage,
      MyApp,
      SearchBarPage,

      LoginPage,
      EmptyPage,

      CalenderPage,


      VisitationDetailPage,
      VisitationApplicationPage,

      HomeLeaveApplicationPage,
      ApplyLeaveApplicationPage,

      HomeExchangeApplicationPage,
      ApplyExchangeApplicationPage,
      HomeOvertimeApplicationPage,
      ApplyOvertimeApplicationPage,

      WorkoutsideHomePage,
      WorkoutsideApplyPage,

      ContainerInApplyPage,
      ContainerInHomePage,




      //# myAttendance
      AbsenceRecordHomePage,
      AbsenceRecordApplyPage,

      IncompleteRecordHomePage,
      IncompleteRecordApplyPage,




    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        HeaderColor,
        UserProvider,
        ApiProvider,
        DatePicker,
        RootParamsProvider,
        AndroidPermissions,
        HelperProvider,
        InAppBrowser,
        AppVersion,
        Calendar,
        Badge

    ]
})
export class AppModule {}
