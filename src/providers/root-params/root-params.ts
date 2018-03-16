import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {VisitationApplicationParam} from "../../pages/application/visitation-application/visitation-application";
import {BaseForm} from "../../components/Forms/base-form";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {HomeLeaveApplicationParam} from "../../pages/application/leave/home-leave-application/home-leave-application";
import {HomeExchangeApplicationParam} from "../../pages/application/exchange/home-exchange-application/home-exchange-application";
import {HomeOvertimeApplicationParam} from "../../pages/application/overtime/home-overtime-application/home-overtime-application";
import {WorkoutsideHomeParam} from "../../pages/application/workoutside/workoutside-home/workoutside-home";
import {ContainerInHomeParam} from "../../pages/application/containerIn/container-in-home/container-in-home";
import {AbsenceRecordHomeInterface} from "../../pages/myAttendance/absenceRecord/absence-record-home/absence-record-home";
import {IncompleteRecordHomeInterface} from "../../pages/myAttendance/incompleteRecord/incomplete-record-home/incomplete-record-home";
import {AnnouncementHomeParamInterface} from "../../pages/announcement/announcement-home/announcement-home";
import {CalenderParamInterface} from "../../pages/calender/calender";

/*
  Generated class for the RootParamsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RootParamsProvider {


    /*
        - set partial to true
        - set correct version
        - set url to live
        - copy index html
        - sencha set global live ip
        - sencha app build
        - sencha app build native
        - cordova build android --release
     */

    public isPartial: boolean = false;
    public version: string = "1.5.23";
    public isLive: boolean = false;



    public announcementParam? : AnnouncementHomeParamInterface = {isApproval:false};
    public visitationApplicationParam?: VisitationApplicationParam = {isProvider: true};

    public homeLeaveApplicationParam?: HomeLeaveApplicationParam       = {isApproval:false};
    public homeExchangeApplicationParam?: HomeExchangeApplicationParam = {isApproval: false};

    public workoutsideHomeParam?: WorkoutsideHomeParam                 = {isApproval: false};
    public homeOvertimeApplicationParam: HomeOvertimeApplicationParam  = {isApproval: false};
    public containerInHomeParam?: ContainerInHomeParam                 = {isApproval:false, isContainerIn:true};
    public broadcast: ReplaySubject<BroadcastType>                     = new ReplaySubject(0);
    public absenceRecordHomeParam:AbsenceRecordHomeInterface = {isApproval:false}
    public incompleteRecordHomeParam:IncompleteRecordHomeInterface = {isApproval:false}

    constructor(public http: HttpClient) {
        console.log('Hello RootParamsProvider Provider');
        if (this.isPartial) {
            console.log('version', this.version)
        }

    }
    ////

}


interface PageForm {
    title: string,
    isOpen: boolean,
    baseForms: BaseForm[]
    isHidden: boolean
}

export enum BroadcastType {
    visitationPageOnResume,
    homeLeaveApplicationOnResume,
    homeExchangeApplicationOnResume

}

