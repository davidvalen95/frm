import {ApproverBaseInterface, HistoryBaseInterface, TextValueInterface} from "../../providers/api/api";

export interface CalenderFilterInterface {

}


export interface CalenderListInterface {
  alteroffdays: string[];
  attendances: string[];
  attendancesTid: string[];
  holidays: string[];
  leavenames: string[];
  leaves: string[];
  leaves_id: string[];
  offdays: string[];
  overtimes: string[];
  overtimes_id: string[];
  weeks: string[];

}

export interface CalenderListDataInterface {


  status: string;
  isOpen?: boolean;
  tid: string;
  id: string;
  status_str: string;
  created_date: string;


  work_date_from: string;
  work_date_to: string;
  work_location: string;
  reason: string;

  data0: string; //# employee
  data1: string; //# createdDate
  data2: string; //#from date
  data3: string; //# to date
  data4: string; //$ reason
  data5: string; //# place
  data6: string; //#statys


}


export interface CalenderRuleInterface {
  approved: number;
  changeDate: boolean;
  created_date: string;
  cmb_event_type: TextValueInterface[];


  data: CalenderDataInterface;
  history?: CalenderHistoryInterface[];
  detail: CalenderDataDetailInterface[];


  //# for approver
  datatmp: any;
  status?: string;
  allowEdit?: boolean;

}


export interface CalenderDataInterface extends ApproverBaseInterface {

  emp_id: string;
  event_type: string;
  id: string;
  reason: string;
  work_date_from: string;
  work_date_to: string;
  work_location: string;
}

export interface CalenderDataDetailInterface {
  rest_in?: string;
  rest_out?: string;
  time_in?: string;
  time_out?: string;
  work_date?: string; // always server format
}


export interface CalenderHistoryInterface extends HistoryBaseInterface {

}


