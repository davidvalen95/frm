import {HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Alert, AlertController, LoadingController, ToastController, ToastOptions} from "ionic-angular";
import {HomeNotificationInterface, UserProvider} from "../user/user";
import {Observable} from "rxjs/Observable";
import {Http} from "@angular/http";
import {BaseForm} from "../../components/Forms/base-form";
import {HelperProvider} from "../helper/helper";

/*
  Generated class for the ApiProvider provider.

  See https?://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

@Injectable()
export class ApiProvider {

  // // # TEST URL
  public static BASE_URL: string      = "http://hrms.dxn2u.com:8888";
  public static HRM_URL: string       = "http://hrms.dxn2u.com:8888/hrm_test2/";
  public static PHP_URL: string       = "http://hrms.dxn2u.com/hrmsphptest/";
  public static IS_API_LIVE: boolean  = false;
  public static PHP_IONIC_URL: string = "http://hrms.dxn2u.com/hrmsionicphp/test/";


  //# LOCAL URL
  // public static BASE_URL: string = "http://localhost:8080";
  // public static HRM_URL: string = "http://localhost:8080/hrm2/";
  // public static IS_API_LIVE: boolean = false;
  // public static PHP_IONIC_URL: string = "http://hrms.dxn2u.com/hrmsionicphp/test/";


  //# LIVE URL
  // public static BASE_URL: string = "http://hrms.dxn2u.com:8888";
  // public static HRM_URL: string = "http://hrms.dxn2u.com:8888/hrm_live/";
  // public static PHP_URL: string = "http://hrms.dxn2u.com/hrmsphplive/";
  // public static IS_API_LIVE: boolean = true;
  // public static PHP_IONIC_URL: string = "http://hrms.dxn2u.com/hrmsionicphp/live/"


  //# LOCAL IP URL
  //   public static BASE_URL: string = "http://10.26.5.74:8080";
  //   public static HRM_URL: string = "http://10.26.5.74:8080/hrm2/";
  //   public static IS_API_LIVE: boolean = false;
  //   public static PHP_IONIC_URL: string = "http://hrms.dxn2u.com/hrmsionicphp/test/";
  //   public static PHP_URL: string = "http://hrms.dxn2u.com/hrmsphptest/";


  public baseUrl: string = ApiProvider.HRM_URL;
  public phpUrl: string  = ApiProvider.HRM_URL;


  constructor(public httpClient: HttpClient, private loadingController: LoadingController, public toastController: ToastController, public alertController: AlertController, public helperProvider: HelperProvider) {
  }

  /**
   * get menu samping per tipe user, di chain dengan login
   * @returns {Promise<MenuInterface[]>}
   */
  getMenu(userId: string): Promise<MenuInterface[]> {
    var menuUrl = ApiProvider.HRM_URL + "s/com.ssoft.hrm.EmployeeMenu?mobile=true";
    var params  = {
      user_id: userId,
    };
    console.log(params);
    return this.httpClient.get<MenuInterface[]>(menuUrl, {withCredentials: true, params: params}).toPromise();
  }

  /**
   * login
   * @param {string} username
   * @param {string} password
   * @returns {Promise<UserSessionApiInterface>}
   */
  login(username: string, password: string): Promise<any> {
    var loginUrl = ApiProvider.HRM_URL + "s/com.ssoft.hrm.LoginMobile";

    var body = {
      username: username,
      password: password,
    };

    var header: HttpHeaders = new HttpHeaders().set("Cookie", "23746378564");
    return this.httpClient.get<any>(loginUrl, {
      headers: header,
      observe: "response",
      withCredentials: true,
      params: body
    }).toPromise();
  }


  getEmployeeInformation(id: string, isFnF?: boolean): Promise<EmployeeInformationInterface> {
    // s/VisitationRulesList?reqtype=emp_scan&keyword=MY08012734
    // this.presentLoading("Fetching information");
    var httpParams: HttpParams = new HttpParams().set("reqtype", "emp_scan").set("keyword", id);
    if (isFnF) {
      httpParams = httpParams.set("loc_id", 'FnF');

    }

    return this.httpClient.get<EmployeeInformationInterface>(ApiProvider.HRM_URL + "s/VisitationRulesList", {
      withCredentials: true,
      params: httpParams
    }).toPromise();
  }


  //region ============= VisitationApplication ================
  getVisitationDetail(user: UserSessionApiInterface, tid: string): Promise<any> {

    var httpParams: HttpParams = new HttpParams().set('user_id', user.empId).set('cmd', 'edit').set('tid', tid).set("container", "false").set("requisition_type", 'appointment');
    // this.httpClient.get(ApiProvider.HRM_URL + "s/VisitationApplication_top",{params:httpParams}).subscribe((data:any)=>{
    //   data["data"]
    //   console.log('visitationDetailKeyValue',data)
    //   console.log('tid',tid)
    // })

    return this.httpClient.get(ApiProvider.HRM_URL + "s/VisitationApplication_top", {
      withCredentials: true,
      params: httpParams
    }).toPromise()
  }

  getVisitationFormRules(ctId: string, visitorCategoryCode: string, isVisitation: boolean = true): Observable<any> {
    var httpParams: HttpParams = new HttpParams().set('requisition_type', isVisitation ? 'appointment' : 'container')
      .set('reqtype', 'visitation_rules')
      .set('ct_id', ctId)
      .set('visitorcategory_code', visitorCategoryCode);


    console.log('rulesParam', httpParams);
    return this.httpClient.get(ApiProvider.HRM_URL + "s/VisitationRulesList", {params: httpParams})
  }

  getCompanyInformation(outsiderCode: string): Promise<CompanyInformation> {
    // http://hrms.dxn2u.com:8888/hrm_test2/s/VisitationRulesList?reqtype=outsider&outsider_code=C001
    var httpParams: HttpParams = new HttpParams().set('reqtype', 'outsider').set('outsider_code', outsiderCode);
    return this.httpClient.get<CompanyInformation>(ApiProvider.HRM_URL + 's/VisitationRulesList', {
      withCredentials: true,
      params: httpParams
    }).toPromise();
  }

  submitVisitationAplyForm(originalPost: object, url: string): Promise<any> {
    var post                     = {...originalPost};
    post                         = this.preprocessingDate(post, ["visitor_birth_date", "visitation_date", "until_date"]);
    post                         = this.preprocessingTime(post, ["visitation_time"]);
    post["mobile"]               = true;
    var httpHeaders: HttpHeaders = new HttpHeaders();
    var formData: FormData       = new FormData();
    for (var key in post) {
      formData.append(key, post[key])

    }
    console.log('submitFormdata', formData, post);
    // httpHeaders.set("Content-Type", 'multipart/form-data').set("Access-Control-Allow-Origin","* always");
    httpHeaders.set("Content-Type", 'multipart/form-data');
    httpHeaders.append("Origin", "null");
    return this.httpClient.post(url, formData,
      {withCredentials: true, headers: httpHeaders},
    ).toPromise()
  }

  /**
   * get the that
   * @param {{year; month; acknowledge; status}} filters
   * @returns {Promise<Object>}
   */
  getVisitationContainer(filters: VisitationFilterApi, userSession: UserSessionApiInterface, isContainer: boolean = false, page: number = 1, isContainerOut: boolean = false, isBadge: boolean = false): Promise<VisitationDataApiInterface> {

    var visitationUrl: string = ApiProvider.HRM_URL + 's/VisitationApplication_active';
    if (isContainerOut) {
      visitationUrl = ApiProvider.HRM_URL + 's/VisitationApplicationContainerout_active'
    }
    var body: any        = filters;
    body["activepage"]   = [page, 5];
    body["inactivepage"] = [1, 1];
    body["container"]    = isContainer;
    body["user_id"]      = userSession.empId;
    body["cmbYearList"]  = ["" + ((<number> new Date().getUTCFullYear()) - 1), (new Date().getUTCFullYear())];
    body["isBadge"]      = isBadge;
    body['container']    = isContainer;
    // body["isBadge"] = true
    console.log('filters', body);
    return this.httpClient.get<VisitationDataApiInterface>(visitationUrl, {
      withCredentials: true,
      params: body
    }).toPromise();
    // return this.httpClient.post<any>(visitationUrl,body).toPromise();
    // this.httpClient.get<any>(visitationUrl,{params:body, reportProgress:true}).subscribe(event=>{
    //   Ev
    //   console.log(event);
    // });

  }


  public get<T>(config: ApiGetConfigInterface, onFinished: (response: T) => void) {

    var url = `${config.url}`;


    var promise: Promise<T> = this.httpClient.get<T>(url, {
      withCredentials: true,
      params: config.params
    }).toPromise();


    var message = config.loaderMessage ? config.loaderMessage : "Loading data";
    var loader  = this.helperProvider.presentLoadingV2(message);

    promise.then((data: T) => {


      onFinished(data);

    }).catch(rejected => {
      console.log('apigetsummaryandlist', rejected);
      this.helperProvider.presentToast("Something error on loading data");
    }).finally(() => {
      loader.dismiss();
    })

  }


  public submitGet<T>(url: string, jsonParams: any, onFinished: (response: T) => void) {

    var loader = this.helperProvider.presentLoadingV2("Submitting ");

    this.httpClient.get<T>(url, {params: jsonParams, withCredentials: true,}).toPromise().then((response) => {


      console.log('submitFormWIthProgress,', response)

      onFinished(response);


    }).catch(rejected => {
      this.helperProvider.showAlert("Error");
      console.log('submitFormWithProgress rejected', rejected);
    }).finally(() => {
      loader.dismiss();

    });
  }

  public submitFormWithProgress<T>(url: string, jsonParams: object, onFinished: (response: T) => void) {


    var httpHeaders = new HttpHeaders()
    httpHeaders.set("Content-Type", 'multipart/form-data');


    var loader = this.helperProvider.presentLoadingV2("Submitting ");

    var formData: FormData = new FormData();
    for (var key in jsonParams) {
      formData.append(key, jsonParams[key])

    }
    // this.httpClient.post(url,formData,{headers:httpHeaders,withCredentials:true,reportProgress:true}).toPromise().then((response)=>{
    //
    //   console.log('submitFormWIthProgress,',response)
    //
    //
    //   if (response["type"] === HttpEventType.UploadProgress) {
    //     // This is an upload progress event. Compute and show the % done:
    //     const percentDone = Math.round(100 * response["loaded"] / response["total"]);
    //
    //     loader.setContent(`Submitting, ${percentDone}`);
    //     console.log(`File is ${percentDone}% uploaded.`);
    //   } else if (response instanceof HttpResponse) {
    //     console.log('File is completely uploaded!');
    //     onFinished(response);
    //
    //   }
    // }).catch((rejected)=>{
    //   this.helperProvider.presentToast(rejected.message || "Error");
    // }).finally(()=>{
    //   loader.dismiss();
    // });
    //
    // //
    //
    this.httpClient.post<T>(url, formData, {
      withCredentials: true,
      headers: httpHeaders,
    }).toPromise().then((response) => {


      console.log('submitFormWIthProgress,', response)

      onFinished(response);


    }).catch(rejected => {
      this.helperProvider.showAlert("Error on submiting");
      console.log('submitFormWithProgress rejected', rejected);
    }).finally(() => {
      loader.dismiss();

    });


  }


  getBadgeVisitationPendingAcknowledge(userSession: UserSessionApiInterface) {
    var visitationUrl: string = ApiProvider.HRM_URL + 's/VisitationApplication_active';
    var body: any             = {};
    body["activepage"]        = [1, 5];
    body["inactivepage"]      = [1, 1];
    body["user_id"]           = userSession.empId;
    body["cmbYearList"]       = ["" + ((<number> new Date().getUTCFullYear()) - 1), (new Date().getUTCFullYear())];
    body["isBadge"]           = true;


    return this.httpClient.get<BadgeApiInterface>(visitationUrl, {withCredentials: true, params: body}).toPromise();
  }

  getBadgeVisitationApproval(userSession: UserSessionApiInterface, setting: { isContainer: boolean } = {isContainer: false}) {
    var body: any         = {};
    body["activepage"]    = [1, 5];
    body["inactivepage"]  = [1, 1];
    // body["container"]     = setting.isContainer;
    body["user_id"]       = userSession.empId;
    body["filter_by"]     = "emp_name";
    body["keyword"]       = '';
    body['cmbStatus']     = "PA";
    body['cmbSection']    = "";
    body['cmbDepartment'] = "";
    body["cmbYearList"]   = ["" + ((<number> new Date().getUTCFullYear()) - 1), (new Date().getUTCFullYear())];
    body['container']     = setting.isContainer;
    body['isBadge']       = false;
    console.log('filters', body);
    var url = ApiProvider.HRM_URL + "s/VisitationApplicationApproval_active";
    return this.httpClient.get<VisitationDataApiInterface>(url, {withCredentials: true, params: body}).toPromise();
  }


  getApprovalVisitationContainer(filters: VisitationFilterApi, page, userSession: UserSessionApiInterface): Promise<VisitationDataApiInterface> {
    var body: any        = filters;
    body["activepage"]   = [page, 5];
    body["inactivepage"] = [1, 1];
    body["container"]    = false;
    body["user_id"]      = userSession.empId;
    body["cmbYearList"]  = ["" + ((<number> new Date().getUTCFullYear()) - 1), (new Date().getUTCFullYear())];
    body['isBadge']      = false;
    console.log('filters', body);
    var url = ApiProvider.HRM_URL + "s/VisitationApplicationApproval_active";


    return this.httpClient.get<VisitationDataApiInterface>(url, {withCredentials: true, params: body}).toPromise();

  }

  getSelectOptionsVisitation(userProvider: UserProvider): Observable<object[]> {
    console.log('obser');
    var params: any = {user_id: userProvider.userSession.empId, cmd: "add"};
    return this.httpClient.get<object[]>(ApiProvider.HRM_URL + "s/VisitationApplication_top",
      {withCredentials: true, params: params}
    );

  }

  acknowledge(tid: string, remark: string): Promise<any> {
    var httpParams: HttpParams = new HttpParams().set('tid', tid).set('requisition_type', 'appointment').set('acknowledge_remark', remark);
    return this.httpClient.get<any>(ApiProvider.HRM_URL + "s/VisitationApplicationAcknowledge_op", {
      withCredentials: true,
      params: httpParams
    }).toPromise()
  }

  visitationApproval(params: any): Promise<any> {

    var body: any = params;
    body["test"]  = "";
    console.log('visitationApproval,body', body);
    var url: string = ApiProvider.HRM_URL + "s/VisitationApplicationApproval_op";
    // var httpParams: HttpParams = new HttpParams().set('tid', tid).set('requisition_type', 'appointment');

    return this.httpClient.get(url, {params: body}).toPromise();

  }

  //endregion =


  private preprocessingDate(formValues: object, shouldProcess: string[]) {
    var mmm = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (var key in formValues) {
      if (typeof (formValues[key]) == "string") {
        try {
          var date = new Date(formValues[key]);
          if (!isNaN(date.getFullYear()) && shouldProcess.find((value: string) => {
              return value == key
            })) {
            console.log('preprocessed', formValues[key], date.getUTCDate());

            formValues[key] = ('0' + date.getUTCDate()).slice(-2) + ` ${mmm[date.getUTCMonth()]} ${date.getUTCFullYear()}`

          }
        } catch (e) {
          console.log('error', e.toString())
        }
      }

    }
    return formValues;
  }

  private preprocessingTime(formValues: object, shouldProcess: string[]) {
    for (var key in formValues) {
      if (typeof (formValues[key]) == "string") {
        try {
          var date = new Date(formValues[key]);
          if (!isNaN(date.getFullYear()) && shouldProcess.find((value: string) => {
              if (value == key) {
                console.log("preprocessingTime", date, formValues[key]);
              }

              return value == key
            })) {

            formValues[key] = `${date.getUTCHours()}:${date.getUTCMinutes()}`;

            // console.log('preprocessingTimeBefore',formValues[key],new Date(formValues[key]));
            //
            // // var timezoneDate = BaseForm.setDateTimezone(new Date(formValues[key]),8);
            // console.log('preprocessingTimeProcessed',timezoneDate);
            //
            // // formValues[key] = `${timezoneDate.getHours()}:${timezoneDate.getMinutes()}`;
            // console.log('preprocessingTimeAfter',formValues[key]);

          }
        } catch (e) {
          console.log('error', e.toString())
        }
      }

    }
    return formValues;
  }


}//class

export interface MenuInterface {
  hasSubmenu?: boolean;
  menu?: MenuInterface[];
  name;
  id;
  isOpen: boolean;
  image?: string;
  badge?: BadgeConfig;
  homeNotificationTarget?: string;
  apiId?: string;
  isHidden?: boolean;
}

export interface BadgeConfig {

  count?: number;
  url: string;
  params: any;

}

export interface UserSessionApiInterface {
  act?;
  ct_id?;//MY
  dept_id?;//211
  empId?;
  userId?;//MY080127
  name?;//JOYCE TOK YEOU SHUAN
  religion_code?;//BDH
  roleAccessId?;//194535
  roleId?;//2
  salutation?;//ms
  st_id?;//KDH
  user_type?;//E
  isLoggedIn: boolean;
  isFnF?: boolean;
  isFnFReady?: boolean;
  password?: string;
}

export class VisitationFilterApi {
  cmbYear?: string       = "2018";
  cmbMonth?: string      = "";
  cmbStatus?: string     = "";
  acknowledged?: string  = "";
  cmbDepartment?: string = "";//# for Approver
  cmbSection?: string    = "";//# for Approver
  filter_by?: string     = "emp_name";//# for Approver
  keyWord?: string       = "";//# for Approver
  isOpen?: boolean       = false;
  cmbType?: string       = "";
  cmbSearch?: string     = "c.name";


}


export interface VisitationDataApiInterface {
  maxpage: number;
  minpage: number;
  page: number;
  records: VisitationDataRecordsInterface[];
  totalRecord: number;
  badgeContainerApproval?: number;//for Approval
  badgeAppointmentApproval?: number;//# for approval

}

export interface VisitationDataRecordsInterface {
  created_date: string;
  emp_name?: string;
  emp_id?: string;
  employee?: string; //# union from empid emp name but not always availagle
  id: string;
  port_name: string;
  purpose: string;
  status: string;
  status_str: string;
  visitation_date: string;
  visitation_time: string;
  visitor_id: string;
  visitor_name: string;
  visitorcategory_name: string;
  group_by: string;
  host_id: string;
  host_name: string;
  isOpen: boolean;
}

export interface VisitationDataDetailInterface {
  acknowledge_remark?: string;
  acknowledged?: boolean;
  add_other_host?: boolean;
  attachment1?: string;
  attachment2?: string;
  attachment3?: string;
  attachment4?: string;
  companion?: number;
  companion_remark?: string;
  created_date?: string;
  created_name?: string;
  created_user?: string;
  destination_id?: number;
  destination_specify?: string;
  emp_id?: string;
  host_ext?: string;
  host_id?: string;
  host_type?: string;
  other_host_id?: string;
  outsider_code?: string;
  outsider_specify?: string;
  purpose_id?: number;
  purpose_specify?: string;
  remark?: string;
  requisition_type?: string;
  skip_reason?: string;
  status?: string;
  status_str?: string;
  time_in?: string;
  time_out?: string;
  until_date?: string;
  vehicle_info?: string;
  vehicle_no?: string;
  vehicle_type?: string;
  visitation_date?: string;
  visitation_status?: string;
  visitation_time?: string;
  visitor_birth_date?: string;
  visitor_ct?: string;
  visitor_gender?: string;
  visitor_id?: string;
  visitor_name?: string;
  visitor_no?: string;
  visitor_pass?: string;
  mobile_no?: string;
  visitorcategory_code?: string;
}


export interface EmployeeInformationInterface {
  ct_id: string;
  sec_name: string;
  birthdate: string;
  gender: string;
  emp_name: string;
  ident_no: string;
  mobile_no: string;
  dept_name: string;
  salutation: string;
  birthdate_str: string;
  emp_id: string;
}

export interface CompanyInformation {
  ct_id?: string;
  ic_no?: string;
  gender?: string;
  contact_person?: string;
  specify?: boolean;
}

export interface HistoryBaseInterface {
  date?: string;
  emp_name?: string;
  remark?: string;
  emp_id?: string;
  status?: string;
}

export interface BadgeApiInterface {
  //{"badgeVisitation":1,"badge":6,"badgeContainerOut":5,"badgeContainerIn":0}

  badgeVisitation?: number;
  badge?: number;
  badgeContainerOut?: number;
  badgeContainerIn?: number;
}


export interface TextValueInterface {
  text: string,
  value: string,
}

export interface SuccessMessageInterface {
  success: boolean;
  message: string;

  status?: string;
}


export interface ApiGetConfigInterface {
  url: string,
  params: any,
  loaderMessage?: string
}


export interface ApproverBaseInterface {
  approve_remark: string;
  approver_remark: string;
  cancel_remark: string;
  id: string;
  alert_employee: string; // "f" "t"
  status: string; // PA RE APP
}
