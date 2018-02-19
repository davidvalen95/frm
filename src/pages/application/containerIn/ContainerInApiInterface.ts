import {ApproverBaseInterface, HistoryBaseInterface, TextValueInterface} from "../../../providers/api/api";
import {CodeDescriptionInterface} from "../overtime/ApiInterface";

export interface ContainerInListInterface {
  id: string;
  created_date: string;
  badge: string;
  total: string;
  data?: ContainerInListDataInterface[];
  records: ContainerInListDataInterface[];
  success: boolean;
  emp_id: string


}

export interface ContainerInListDataInterface {

  visitorcategory_name: string;
  purpose: string;
  visitor_id: string;
  emp_name: string;
  status_str: string;
  visitor_name: string;
  host_id: string;
  port_name: string;
  other_host_id: string;
  group_by: string;
  id: string;
  tid:string;
  created_date: string;
  visitation_date: string;
  visitation_time: string;
  host_name: string;
  emp_id: string;
  status: string;

  isOpen: boolean;

  // //# approval
  // data0: string; //# empName
  // data1: string; //# create
  // data2: string; //#
  // data3: string; //#
  // data4: string; //#
  // data5: string; //#
  // data6: string; //#
  // data7: string; //#
  // data8: string; //#
  // data9: string; //#
  // tid: string;
}


export interface ContainerInRuleInterface {

  visitorcategory: ContainerInVisitorCategoryInterface[];
  visitor_gender: CodeDescriptionInterface[];
  visitor_ct: ContainerInVisitorCountryInterface[];
  purpose: ContainerInPurposeInterface[];
  destination: ContainerInDestinationInterface[];

  cmbDeliveryType: TextValueInterface[];
  cmbContainerSize: TextValueInterface[];


  isFnf:boolean; // harus parse dari Loc_id
  isHost: boolean;
  loc_id: string; //FnF
  visitationStatus: string;
  currentStatus: string
  attachment1url: string;
  attachment2url: string;
  attachment3url: string;
  attachment4url: string;

  history?: ContainerInHistoryInterface[];

  datatmp: any;
  status?: string;
  allowEdit?: boolean;

  data: ContainerInDataInterface;
  approved: number;
  employee:string;
  created_date:string;



}

export interface ContainerInDestinationInterface {
  id: string;
  destination: string;
  specify: string;
}

export interface ContainerInVisitorCountryInterface {

  ct_id: string;
  ct_name: string;
}

export interface ContainerInVisitorCategoryInterface {
  visitorcategory_code: string;
  visitorcategory_name: string;
  only_fnf: boolean;
}

export interface ContainerInPurposeInterface {
  id: string;
  purpose: string;
  specify: boolean;
}

export interface ContainerInApprovalApplyRule {
  approve_remark: string;
  approver_remark: string;
  cancel_remark: string;
  id: string
  alert_employee: string
  status: string
}

export interface ContainerInHistoryInterface extends HistoryBaseInterface {

}

export interface ContainerInDataInterface extends ApproverBaseInterface {

  container_size: string;
  attachment1: string;
  attachment2: string;
  attachment3: string;
  attachment4: string;

  companion: string;
  destination_id: string;
  visitor_id: string;
  purpose_id: string;
  remark: string
  until_date: string
  add_other_host: string
  add_member: string
  host_ext: string
  outsider_code: string
  other_host_id: string
  delivery_type: string
  members: string
  visitation_date: string
  vehicle_info: string
  approver_id: string
  visitor_ct: string
  vehicle_no: string;
  vehicle_type: string;
  destination_specify: string;
  host_dept_name: string;
  purpose_specify: string;
  visitor_name: string;
  host_id: string;
  outsider_specify: string;
  container_sealno: string;
  visitor_gender: string;
  host_sec_name: string;
  visitor_no: string;
  visitorcategory_code: string;
  companion_remark: string;
  other_host_ext: string;
  acknowledge_remark: string;
  visitation_time: string;
  visitor_birth_date: string;
  host_name: string;
  emp_id: string;



  //#missing
  port_name:string;
}
