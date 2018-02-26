
import {ApproverBaseInterface, HistoryBaseInterface, TextValueInterface} from "../../../providers/api/api";

export interface IncompleteRecordFilterInterface{

}


export interface IncompleteRecordListInterface{
  id:string;
  badge: string;
  total: string;
  data: IncompleteRecordListDataInterface[];
  success: boolean;
  emp_id:string
  // records: IncompleteRecordListDataInterface[];



  //#attendance approval
  data0?:string; //employee
  data1?:string; //date
  data2?:string; // record type
  data3?:string; //status
  data4?:string;// reason
  tid?:string;
}

export interface IncompleteRecordListDataInterface{


  status:string;
  isOpen?:boolean;
  tid:string;
  id:string;
  status_str: string;


  record_type_str:string;
  reason:string;
  att_date_str:string;


  data0:string; //# employee
  data1:string; //# createdDate
  data2:string; //#from date
  data3:string; //# to date
  data4:string; //$ reason
  data5:string; //# place
  data6:string; //#statys




}


export interface IncompleteRecordRuleInterface{
  approved: number;
  created_date: string;
  incomplete:string;


  attendance:IncompleteRecordAttendanceInterface;
  captured:string[];
  cmb_reason_type:TextValueInterface[];
  cmb_record_type:TextValueInterface[];


  data:IncompleteRecordDataInterface;
  history?: IncompleteRecordHistoryInterface[];
  detail:IncompleteRecordDataDetailInterface[];


  //# for approver
  datatmp:any;
  status?: string;
  allowEdit?: boolean;


  //attendance approval
  att_date:string;
  att_type:string;
  current_status:string;

}


export interface IncompleteRecordAttendanceInterface extends InOutFlowInterface{
  total_early_leaving: string;
  total_lateness:string;
}

interface InOutFlowInterface{
  rest_in:string;
  rest_out:string;
  time_in:string;
  time_out:string;
}


export interface IncompleteRecordDataInterface extends ApproverBaseInterface,InOutFlowInterface{

  att_date:string;
  detail_id:string;
  emp_id:string;
  id:string;
  is_exclude: string;
  reason:string;
  reason_type:string;
  record_type:string;
  year:string;
}

export interface IncompleteRecordDataDetailInterface{
  rest_in?: string;
  rest_out?: string;
  time_in?: string;
  time_out?: string;
  work_date?: string; // always server format
}


export interface IncompleteRecordHistoryInterface extends HistoryBaseInterface{

}


