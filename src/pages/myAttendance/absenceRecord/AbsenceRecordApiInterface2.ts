import {ApproverBaseInterface, HistoryBaseInterface, TextValueInterface} from "../../../providers/api/api";

export interface AbsenceRecordListInterface{

  badge:string;
  emp_id:string;
  success:boolean;
  total:number;
  data:AbsenceRecordListDataInterface[];

}

export interface AbsenceRecordListDataInterface{
  absence_date:string;
  id:string;
  remark:string;
  status:string;
  year:string;

  isOpen:boolean;
}


export interface AbsenceRecordRuleInterface{
  allowance: string; // 't' 'f'
  allowancetype: string // "N"
  approved: number;
  changeDate: boolean;
  cmb_ot_claim_type: TextValueInterface[];
  created_date:string;
  data:AbsenceRecordDataInterface;

  history?: AbsenceRecordHistoryInterface[];

  datatmp:any;
  status?: string;
  allowEdit?: boolean;

}

export interface AbsenceRecordApprovalApplyRule{
  approve_remark: string;
  approver_remark: string;
  cancel_remark:string;
  id:string
  alert_employee:string
  status:string
}

export interface AbsenceRecordHistoryInterface extends HistoryBaseInterface{

}

export interface AbsenceRecordDataInterface extends ApproverBaseInterface{
  emp_id:string;
  id:string;
  ot_claim_type: string; //AL
  ot_date: string;
  ot_time_from: string;
  ot_time_to: string;
  reason: string;
  replacement: string // 't' 'f'
  //#approval
  status:string;
  approver_remark:string;
  alert_employee:string;

}


export interface CodeDescriptionInterface{
  code:string;
  description:string;
}
