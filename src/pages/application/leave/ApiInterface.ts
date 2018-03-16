
import {ApproverBaseInterface, HistoryBaseInterface, TextValueInterface} from "../../../providers/api/api";



//    var url = `${ ApiProvider.HRM_URL }s/LeaveApplication_top?mobile=true&cmd=filter&user_id=MY080127`;

export interface LeaveApplicationFilter {
  cmbType?: TextValueInterface[];
  cmbStatus?: TextValueInterface[];
  cmbYear?: TextValueInterface[];
  info?: InfoInterface;
}




/**
 *  var url    = `${ApiProvider.HRM_URL}s/LeaveApplication_top`;
    var params = {
        mobile: "true",
        cmd: "add",
        tid: this.userProvider.userSession.empId,
        user_id: this.userProvider.userSession.empId,
        leaveAvailable: this.pageParam.leaveApplicationTop.info.available || "18",
    }

 */
export interface InfoInterface {
  taken_el?,
  available?,
  currentDate?,
  taken_ol?,
  taken_rl?,
  taken_sl?,
  total_leave?,
  entitle?,
  taken_ul?,
  nextCarry?,
  forfeitBalance?,
  balance?,
  adjustment?,
  carry?,
  taken_al?,
  availableNext?,
  nextDate?,
}

/**
 *  var url = `${ApiProvider.HRM_URL}s/LeaveApplication_active`;


    var params: any = {
      mobile: "true",
      cmbEmployee: this.userProvider.userSession.empId,
      page: "1",
      start: "0",
      limit: "50",
    };
 */
export interface LeaveApplicationActiveInterface {
  badge: string;
  emp_id: string;
  success: boolean;
  total: string;
  data: LeaveListInterface[];
}
export interface LeaveListInterface {
  created_date: string;
  id: string;
  leave_date_from: string;
  leave_date_to: string;
  status: string;
  status_str: string;
  total_day: number;
  type: string;
  updated_date: string;
  isOpen:boolean;


  //# datalist approval
  data0:string; //emp name
  data1: string; //  created date
  data2: string; //total days
  data3: string;//from date
  data4: string; //to date
  data5: string; //leave type
  data6: string; //status
  tid: string;

}


/**
 *
 *
 var url    = `${ApiProvider.HRM_URL}s/LeaveApplication_top`;
 var params = {
        mobile: "true",
        cmd: "edit", / add
        tid: this.pageParam.tid,
        user_id: this.userProvider.userSession.empId,
      }
 */

export interface LeaveApplicationTopInterface {
  reqAttach1: boolean;
  reqAttach2: boolean;
  reqAttach3: boolean;
  reqAttach4: boolean;
  reqAttachDesc1?: string;
  reqAttachDesc2?: string;
  reqAttachDesc3?: string;
  reqAttachDesc4?: string;
  attachment1url: string;
  attachment2url: string;
  attachment3url: string;
  attachment4url: string;
  cmb_leave_type: TextValueInterface[];
  cmb_halfdayoff_morning: TextValueInterface[];
  total_available_rl: string;
  enableHalfday: boolean;
  approved: number;
  info: InfoInterface;
  data: DetailData;
  created_date:string;

  changeDate:boolean; //true false


  totalLeavePeriod:string;

  //# if edit
  total_day:number;
  history?: LeaveHistoryInterface[];

  //#approval
  datatmp?:any;
  allowEdit?: boolean;

  al_total_leave?:string; //totalLeave
  al_balance?:string; // leaveBalance
  el_taken?:string;// emergency leave taken
  sl_taken?:string;//medical leave taken
  ul_taken?:string;//unpaid leave taken
  al_taken?:string; // annual leave taken

  leaveDates?:LeaveDateInterface[];



}
export interface DetailData extends ApproverBaseInterface{
  attachment1: string;
  attachment2: string;
  attachment3: string;
  attachment4: string;
  notified_to: string;
  birth_date: string;
  leave_date_from: string;
  leave_date_to: string;
  halfdayoff_morning: string;// t f
  halfday_date: string;
  exclude_dt: string; //f t
  leave_type: string;
  id: string;
  emp_id: string;
  hospital_name: string;
  remark: string;
  leavePeriod;





}


/**
 *
 *     var url = `${ApiProvider.HRM_URL}s/LeaveApplicationAjax`;


    var param = {
      reqtype: "req_attach",
      ct_id: this.userProvider.userSession.ct_id,
      leave_type: `${leaveType}`,
    }
 */

export interface AttachmentRuleInterface{
  reqAttach1: boolean;
  reqAttach2: boolean;
  reqAttach3: boolean;
  reqAttach4: boolean;
  reqAttachDesc1: string;
  reqAttachDesc2: string;
  reqAttachDesc3: string;
  reqAttachDesc4: string;
  req_birth_days: boolean;
  enable_halfday:boolean;
}



export interface DayRuleInterface{
  enableHalfday: boolean;
  showUl: boolean;
  time_in_afternoon: string;
  time_in_morning: string;
  time_out_afternoon:string;
  time_out_morning:string;
  total_available_rl :number;
  totalLeavePeriod: number;


  leaveDates?:LeaveDateInterface[];
}

export interface LeaveDateInterface{
  time_in_afternoon:string;
  time_out_afternoon:string;
  leaveDate:string;
  time_in_morning: string;
  time_out_morning: string;
  leaveDateStr: string;
  leave_period;

}

export interface LeaveHistoryInterface extends HistoryBaseInterface{

}
