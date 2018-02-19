import {ApproverBaseInterface, HistoryBaseInterface, TextValueInterface} from "../../../providers/api/api";

export interface OvertimeListInterface{
  id:string;
  created_date:string;
  badge: string;
  total: string;
  data: OvertimeListDataInterface[];
  success: boolean;
  emp_id:string
}

export interface OvertimeListDataInterface{
  ot_time_from:string;
  ot_date: string;
  status_str: string;
  claim_type:string;
  ot_time_to: string;
  id:string;
  created_date: string;
  status:string;
  isOpen?:boolean;


  //# approval
  data0: string; //# empName
  data1: string; //# create
  data2: string; //#
  data3: string; //#
  data4: string; //#
  data5: string; //#
  data6: string; //#
  data7: string; //#
  data8: string; //#
  data9: string; //#
  tid: string;
}


export interface OvertimeRuleInterface{
  allowance: string; // 't' 'f'
  allowancetype: string // "N"
  approved: number;
  changeDate: boolean;
  cmb_ot_claim_type: TextValueInterface[];
  created_date:string;
  data:OvertimeDataInterface;

  history?: OvertimeHistoryInterface[];

  datatmp:any;
  status?: string;
  allowEdit?: boolean;

}

export interface OvertimeApprovalApplyRule{
  approve_remark: string;
  approver_remark: string;
  cancel_remark:string;
  id:string
  alert_employee:string
  status:string
}

export interface OvertimeHistoryInterface extends HistoryBaseInterface{

}

export interface OvertimeDataInterface extends ApproverBaseInterface{
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
