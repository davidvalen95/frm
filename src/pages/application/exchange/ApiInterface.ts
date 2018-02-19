
import {HistoryBaseInterface, TextValueInterface} from "../../../providers/api/api";



//    var url = `${ ApiProvider.HRM_URL }s/LeaveApplication_top?mobile=true&cmd=filter&user_id=MY080127`;

export interface ExchangeApplicationFilter {
    cmbStatus?: TextValueInterface[];
    cmbYear?: TextValueInterface[];
}

export interface ExchangeApplicationActiveInterface {
    badge: string;
    emp_id: string;
    success: boolean;
    total: string;
    data: ExchangeListInterface[];
}

export interface ExchangeListInterface {
    created_date: string;
    id: string;
    exchange_date_from: string;
    exchange_date_to: string;
    status: string;
    status_str: string;
    reason: string;
    updated_date: string;
    isOpen: boolean;

    //# datalist approval
    data0: string; //emp name
    data1: string; //section
    data2: string; //created date
    data3: string;//last updated
    data4: string; //exchange date from
    data5: string; //exchange date to
    data6: string; //status
    tid: string;
}

export interface ExchangeApplicationTopInterface {
    data: DetailData;
    created_date: string;
    approved: number;
    changeDate: boolean;
    history?: ExchangeHistoryInterface[];

    //#approval
    datatmp?: any;
    status?: string;
    allowEdit?: boolean;
}

export interface DetailData {
    id: string;
    emp_id: string;
    backup_person: string;
    reason: string;
    exchange_date_from: string;
    exchange_date_to: string;

    //#approval bner nya di datatmp, jadi harus di helper.mergeobject
    alert_employee?: string;//# t f
    approve_remark?: string;
    approver_remark?: string;
    cancel_remark?: string;
    status?: string;
}

export interface ExchangeHistoryInterface extends HistoryBaseInterface {

}