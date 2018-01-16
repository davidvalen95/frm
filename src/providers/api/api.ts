import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LoadingController, ToastController, ToastOptions} from "ionic-angular";
import {UserProvider} from "../user/user";
import {Observable} from "rxjs/Observable";
import {Http} from "@angular/http";
import {BaseForm} from "../../components/Forms/base-form";

/*
  Generated class for the ApiProvider provider.

  See https?://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

@Injectable()
export class ApiProvider {

  public static BASE_URL: string = "http://hrms.dxn2u.com:8888/hrm_test2/";
  // public static BASE_URL: string = "http://10.26.5.74:8080/hrm2/";
  public loader                  = this.loadingController.create({});

  constructor(public httpClient: HttpClient, private loadingController: LoadingController, public toastController: ToastController,) {
  }

  /**
   * get menu samping per tipe user, di chain dengan login
   * @returns {Promise<MenusApiInterface[]>}
   */
  getMenu(userId: string): Promise<MenusApiInterface[]> {
    var menuUrl = ApiProvider.BASE_URL + "s/com.ssoft.hrm.EmployeeMenu?mobile=true";
    var params  = {
      user_id: userId,
    };
    console.log(params);
    return this.httpClient.get<MenusApiInterface[]>(menuUrl, {params: params}).toPromise();
  }

  /**
   * login
   * @param {string} username
   * @param {string} password
   * @returns {Promise<UserSessionApiInterface>}
   */
  login(username: string, password: string): Promise<UserSessionApiInterface> {
    var loginUrl = ApiProvider.BASE_URL + "s/com.ssoft.hrm.LoginMobile";

    var body = {
      username: username,
      password: password,
    };

    return this.httpClient.get<UserSessionApiInterface>(loginUrl, {params: body}).toPromise();
  }


  getEmployeeInformation(id: string, isFnF?: boolean): Promise<EmployeeInformationInterface> {
    // s/VisitationRulesList?reqtype=emp_scan&keyword=MY08012734
    // this.presentLoading("Fetching information");
    var httpParams: HttpParams = new HttpParams().set("reqtype", "emp_scan").set("keyword", id);
    if (isFnF) {
      httpParams = httpParams.set("loc_id", 'FnF');
    }
    return this.httpClient.get<EmployeeInformationInterface>(ApiProvider.BASE_URL + "s/VisitationRulesList", {params: httpParams}).toPromise();
  }


  //region ============= VisitationApplication ================
  getVisitationDetail(user: UserSessionApiInterface, tid: string): Promise<any> {

    this.presentLoading("Fetching Data");
    var httpParams: HttpParams = new HttpParams().set('user_id', user.empId).set('cmd', 'edit').set('tid', tid);
    // this.httpClient.get(ApiProvider.BASE_URL + "s/VisitationApplication_top",{params:httpParams}).subscribe((data:any)=>{
    //   data["data"]
    //   console.log('visitationDetailKeyValue',data)
    //   console.log('tid',tid)
    // })

    return this.httpClient.get(ApiProvider.BASE_URL + "s/VisitationApplication_top", {params: httpParams}).toPromise()
  }

  getVisitationFormRules(ctId: string, visitorCategoryCode: string): Observable<any> {
    var httpParams: HttpParams = new HttpParams().set('requisition_type', 'appointment')
                                                 .set('reqtype', 'visitation_rules')
                                                 .set('ct_id', ctId)
                                                 .set('visitorcategory_code', visitorCategoryCode);


    console.log('rulesParam', httpParams);
    return this.httpClient.get(ApiProvider.BASE_URL + "s/VisitationRulesList", {params: httpParams})
  }

  getCompanyInformation(outsiderCode:string):Promise<CompanyInformation>{
    // http://hrms.dxn2u.com:8888/hrm_test2/s/VisitationRulesList?reqtype=outsider&outsider_code=C001
    var httpParams:HttpParams = new HttpParams().set('reqtype','outsider').set('outsider_code',outsiderCode);
    return this.httpClient.get<CompanyInformation>(ApiProvider.BASE_URL + 's/VisitationRulesList',{params:httpParams}).toPromise();
  }

  submitVisitationAplyForm(post: object, url: string): Promise<any> {
    this.presentLoading("Submiting Form");
    post                         = this.preprocessingDate(post, ["visitor_birth_date", "visitation_date", "until_date"]);
    post = this.preprocessingTime(post,["visitation_time"]);
    post ["mobile"] = true;
    var httpHeaders: HttpHeaders = new HttpHeaders();
    var formData: FormData       = new FormData();
    for (var key in post) {
      formData.append(key, post[key])

    }
    console.log('submitFormdata', formData);
    httpHeaders.set("Content-Type", 'multipart/form-data');
    return this.httpClient.post(ApiProvider.BASE_URL + url, formData,
      {headers: httpHeaders},
    ).toPromise()
  }

  /**
   * get the that
   * @param {{year; month; acknowledge; status}} filters
   * @returns {Promise<Object>}
   */
  getVisitationContainer(filters: VisitationFilterApi, userSession: UserSessionApiInterface, isContainer: boolean = false, page: number = 1, isContainerOut: boolean = false): Promise<VisitationDataApiInterface> {

    var visitationUrl: string = ApiProvider.BASE_URL + 's/VisitationApplication_active';
    if(isContainerOut){
      visitationUrl = ApiProvider.BASE_URL + 's/VisitationApplicationContainerout_active'
    }
    var body: any             = filters;
    body["activepage"]        = [page, 5];
    body["inactivepage"]      = [1, 1];
    body["container"]         = isContainer;
    body["user_id"]           = userSession.empId;
    console.log('filters', body);
    return this.httpClient.get<VisitationDataApiInterface>(visitationUrl, {params: body}).toPromise();
    // return this.httpClient.post<any>(visitationUrl,body).toPromise();
    // this.httpClient.get<any>(visitationUrl,{params:body, reportProgress:true}).subscribe(event=>{
    //   Ev
    //   console.log(event);
    // });

  }

  getApprovalVisitationContainer(filters: VisitationFilterApi,page,userSession:UserSessionApiInterface):Promise<VisitationDataApiInterface>{
    var body: any             = filters;
    body["activepage"]        = [page, 5];
    body["inactivepage"]      = [1, 1];
    body["container"]         = false;
    body["user_id"]           = userSession.empId;
    console.log('filters', body);
    var url = ApiProvider.BASE_URL + "s/VisitationApplicationApproval_active";


    return  this.httpClient.get<VisitationDataApiInterface>(url,{params:body}).toPromise();

  }
  getSelectOptionsVisitation(userProvider:UserProvider): Observable<object[]> {
    console.log('obser');
    var params: any = {user_id: userProvider.userSession.empId, cmd: "add"};
    return this.httpClient.get<object[]>(ApiProvider.BASE_URL + "s/VisitationApplication_top",
      {params: params}
    );

  }

  acknowledge(tid: string, remark:string): Promise<any> {
    this.presentLoading("Acknowledging");
    var httpParams: HttpParams = new HttpParams().set('tid', tid).set('requisition_type', 'appointment').set('acknowledge_remark',remark);
    return this.httpClient.get<any>(ApiProvider.BASE_URL + "s/VisitationApplicationAcknowledge_op", {params: httpParams}).toPromise()
  }

  visitationApproval(params:any):Promise<any>{
    this.presentLoading("Updating Status");
    var body:any = params;
    body["test"] = "";
    console.log('visitationApproval,body',body);
    var url:string = ApiProvider.BASE_URL + "s/VisitationApplicationApproval_op";
    // var httpParams: HttpParams = new HttpParams().set('tid', tid).set('requisition_type', 'appointment');

    return this.httpClient.get(url,{params:body}).toPromise();

  }

  //endregion =


  presentLoading(message?: string) {
    if (message) {
      this.loader = this.loadingController.create();
      this.loader.setContent(message);
      this.loader.present();
    }
  }

  dismissLoader() {
    if (this.loader != null) {
      this.loader.dismiss();
      this.loader = null;
    }
  }

  presentToast(message?: string) {
    if (message) {
      this.toastController.create({
        message: message,
        duration: 2000,
      }).present();
    }
  }

  private preprocessingDate(formValues: object, shouldProcess: string[]) {
    var mmm = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (var key in formValues) {
      if (typeof(formValues[key]) == "string") {
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

  private preprocessingTime(formValues:object, shouldProcess:string[]){
    for (var key in formValues) {
      if (typeof(formValues[key]) == "string") {
        try {
          var date = new Date(formValues[key]);
          if (!isNaN(date.getFullYear()) && shouldProcess.find((value: string) => {
            if(value == key){
              console.log("preprocessingTime", date , formValues[key]);
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

export interface MenusApiInterface {
  menu?: MenusApiInterface[];
  menu_name;
  menu_id;
  isOpen: boolean;
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
  isFnF?:boolean;
  isFnFReady?:boolean;
}

export class VisitationFilterApi {
  cmbYear: string      = "" + new Date().getFullYear();
  cmbMonth: string     = "";
  cmbStatus: string    = "";
  acknowledged: string = "";
  cmbDepartment:string = "" ;//# for Approver
  cmbSection:string = "" ;//# for Approver
  filter_by:string = "emp_name" ;//# for Approver
  keyword:string = "" ;//# for Approver
  isOpen:boolean = false;


}


export interface VisitationDataApiInterface {
  maxpage: number;
  minpage: number;
  page: number;
  records: VisitationDataRecordsInterface[];
  totalRecord: number;
}

export interface VisitationDataRecordsInterface {
  created_date: string;
  id: string;
  port_name: string;
  status: string;
  status_str: string;
  visitation_date: string;
  visitation_time: string;
  visitor_id: string;
  visitorcategory_name: string;
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
  host_type?:string;
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
  vehicle_info?: boolean;
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
  mobile_no?:string;
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

export interface CompanyInformation{
  ct_id?:string;
  ic_no?:string;
  gender?:string;
  contact_person?:string;
  specify?:boolean;
}
