import {Component, ViewChild} from '@angular/core';
import {Alert, AlertController, IonicPage, Navbar, NavController, NavParams, ToastController} from 'ionic-angular';
import {BaseForm, InputType, KeyValue} from "../../../../components/Forms/base-form";
import {NgForm} from "@angular/forms";
import {ApiProvider, SuccessMessageInterface, TextValueInterface} from "../../../../providers/api/api";
import {HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {BroadcastType, RootParamsProvider} from "../../../../providers/root-params/root-params";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import 'rxjs/add/operator/map';
import {share} from "rxjs/operator/share";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {ApplyBaseInterface} from "../../../../app/app.component";
import {
    ExchangeApplicationFilter, ExchangeApplicationTopInterface,
    ExchangeHistoryInterface,
    ExchangeListInterface
} from "../ApiInterface";
import {MatureKeyValueContainer} from "../../../../components/detail-key-value/detail-key-value";

/**
 * Generated class for the ApplyExchangeApplicationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-apply-exchange-application',
    templateUrl: 'apply-exchange-application.html',
})
export class ApplyExchangeApplicationPage {
    public title: string = "";
    public pageParam: ApplyExchangeApplicationParam = {isEditing: false, isApproval: false, isApply: true};
    public baseForms: BaseForm[] = [];
    public approvalBaseForms: BaseForm[] = [];
    public apiReplaySubject: {[key: string]: ReplaySubject<any>} = {};
    public applyRule: ExchangeApplicationTopInterface;
    public isCanApprove: boolean = false;
    public isCanAcknowledge: boolean = false;
    public isCanDelete: boolean = false;
    public isCanSubmit: boolean = false;
    public approvalHistories: MatureKeyValueContainer[] = [];
    public segmentValue: string = "form";

    @ViewChild(Navbar) navbar: Navbar;

    constructor(public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController, public httpClient: HttpClient) {
        this.pageParam = navParams.data;
        var loader = this.helperProvider.presentLoadingV2("Loading");
        this.title = this.pageParam.title || "Exchange Alternate Off Application";


        this.apiGetApplyRule().toPromise().then((data: ExchangeApplicationTopInterface) => {

            this.applyRule = data;

            this.applyRule.data = this.helperProvider.mergeObject(this.applyRule.data, this.applyRule.datatmp || this.applyRule.data);

            this.setupButtonLogic();
            this.setupForms();

            if (!this.pageParam.isApply) {
                this.getHistory();
            }
            if (this.pageParam.isApproval) {
                this.setupApprovalForms();
            }
        }).catch((rejected) => {
            this.helperProvider.presentToast("Error");
        }).finally(() => {
            loader.dismiss();
        });
    }

    setupApprovalForms() {

        var status = new BaseForm("Status", "status")
            .setInputTypeSelect([
                {key: 'Approve', value: "AP"},
                {key: 'Reject', value: "RE"}
            ])
            .setValue(this.applyRule.data.status);

        var approverRemark = new BaseForm("Approver Remark", "approver_remark")
            .setInputTypeTextarea()
            .setValue(this.applyRule.data.approver_remark);

        var alertEmail = new BaseForm("trigger Alert Employee", "alert_employee")
            .setInputTypeSelect([
                {key: "Yes", value: "t"},
                {key: "No", value: "f"},
            ])
            .setValue(this.applyRule.data.alert_employee);

        alertEmail.infoBottom = "Trigger alert email notification with approver remark for employee";


        this.approvalBaseForms.push(status, approverRemark, alertEmail);


    }

    setupButtonLogic() {
        this.isCanDelete = this.pageParam.isEditing && this.applyRule.approved == 0;
        this.isCanSubmit = !this.pageParam.isEditing || (this.pageParam.isEditing && this.applyRule.approved == 0);
        this.isCanApprove = this.applyRule.allowEdit && this.applyRule.status != "CA";
    }

    ionViewDidLoad() {

        //#override back button
        this.navbar.backButtonClick = (e: UIEvent) => {
            this.leavePage();
        }
    }

    ionViewDidLeave() {
        if (this.pageParam.onDidLeave) {
            this.pageParam.onDidLeave();
        }
    }

    setupForms() {
        var name: BaseForm = new BaseForm("Employee", "empName");
        name.value = `${this.userProvider.userSession.empId} ${this.userProvider.userSession.name}`;
        name.isReadOnly = true;
        name.isDisabled = true;


        var exchange_date_from = new BaseForm("Exchange Date On", "exchange_date_from");
        exchange_date_from.setInputTypeDate({});
        exchange_date_from.value = (this.pageParam.dateFrom || BaseForm.getAdvanceDate(1, new Date(this.applyRule.data.exchange_date_from))).toISOString();
        // exchange_date_from.isReadOnly = this.pageParam.isFromAbsenceRecord;

        var exchange_date_to = new BaseForm("Exchange Date With", "exchange_date_to");
        exchange_date_to.setInputTypeDate({});
        exchange_date_to.value = (this.pageParam.dateFrom || BaseForm.getAdvanceDate(1, new Date(this.applyRule.data.exchange_date_to))).toISOString();
        exchange_date_to.isReadOnly = this.pageParam.isFromAbsenceRecord;

        var backup_person = new BaseForm("Backup Person on Exchange Date With", "backup_person");
        backup_person.setInputTypeText();
        backup_person.value = this.applyRule.data.backup_person;

        var reason = new BaseForm("Reason", "reason");
        reason.inputType = InputType.textarea;
        reason.value = this.applyRule.data.reason;

        this.baseForms.push(name, exchange_date_from, exchange_date_to, backup_person, reason);
        this.setNotEditable(this.baseForms);
    }

    private setNotEditable(baseForms: BaseForm[]) {
        baseForms.forEach((currentBaseForm: BaseForm) => {
            currentBaseForm.isReadOnly = (this.isCanSubmit && !this.pageParam.isApproval) ? currentBaseForm.isReadOnly : true;
        })
    }

    formDelete() {
        var json = [];
        json["sts"] = "delete";
        json["tid"] = this.pageParam.list.id;
        json["userid"] = this.userProvider.userSession.empId;
        json["mobile"] = true;
        this.helperProvider.showConfirmAlert("perform this action", () => {
            this.apiExecuteSubmitApplication(json);
        });
    }

    formSubmit(form: NgForm) {
        if (form.valid) {
            var json = this.helperProvider.convertToJson(form);
            json["employee"] = `${this.userProvider.userSession.empId} ${this.userProvider.userSession.name}`;
            json["created_date"] = this.helperProvider.getCurrentDate(true);

            json["emp_id"] = this.pageParam.isEditing ? this.applyRule.data.emp_id : this.userProvider.userSession.empId;
            json["sts"] = this.pageParam.isEditing ? "update" : "save";
            json["tid"] = this.pageParam.isEditing ? this.pageParam.list.id : -1;
            json["userid"] = this.userProvider.userSession.empId;
            json["mobile"] = true;
            json = this.helperProvider.convertIsoToServerDate(json, ["created_date", "exchange_date_from", "exchange_date_to",]);

            this.helperProvider.showConfirmAlert("perform this action", () => {
                this.apiExecuteSubmitApplication(json);
            });
        } else {
            this.helperProvider.showAlert("Please check field(s) mark in red", "");
        }
    }

    formSubmitApproval(form: NgForm) {

        if (form.valid) {
            var param = this.helperProvider.convertToJson(form);
            param["approve_remark"] = form.value.approver_remark;
            param["id"] = this.pageParam.list.id || this.pageParam.list.tid;
            param["sts"] = "update";
            param["tid"] = this.pageParam.list.id || this.pageParam.list.tid;
            param["userid"] = this.userProvider.userSession.empId;
            param["mobile"] = "true";

            var url = `${ApiProvider.HRM_URL}s/ExchangeApplicationApproval_op`;
            this.helperProvider.showConfirmAlert("Commit Approval", () => {
                this.apiProvider.submitGet<SuccessMessageInterface>(url, param, (data: SuccessMessageInterface) => {
                    this.navCtrl.pop();
                    this.helperProvider.presentToast(data.message || "");
                })
            })
        } else {
            this.helperProvider.showAlert("Please check field(s) mark in red", "");
        }
    }

    public leavePage() {

        this.helperProvider.showConfirmAlert("leave this page", () => {
            this.navCtrl.pop({}, () => {

            });

        })
    }

    public getHistory() {
        if (this.applyRule.history) {

            this.applyRule.history.forEach((data: ExchangeHistoryInterface, index) => {
                var keyValues: KeyValue[] = [];
                for (var key in data) {
                    var value = data[key];
                    keyValues.push({
                        key: key,
                        value: value,
                    });
                }


                this.approvalHistories.push({
                    isOpen: true,
                    name: `${index + 1}`,
                    keyValue: keyValues
                })
            })
        }
    }

    private apiGetApplyRule() {
        if (!this.apiReplaySubject.applyRule) {
            this.apiReplaySubject.applyRule = new ReplaySubject(0);

            var url = `${ApiProvider.HRM_URL}${this.pageParam.isApproval ? "s/ExchangeApplicationApproval_top" : "s/ExchangeApplication_top"}`;
            var params = {
                mobile: "true",
                cmd: this.pageParam.isEditing ? "edit" : "add",
                tid: this.pageParam.isEditing ? this.pageParam.list.id : "-1",
                user_id: this.userProvider.userSession.empId,
            }


            this.httpClient.get<ExchangeApplicationTopInterface>(url, {
                withCredentials: true,
                params: params
            }).subscribe(this.apiReplaySubject.applyRule);
        }


        return this.apiReplaySubject.applyRule;


    }


    public showConfirmAlert(message: string, handler: () => void): Alert {

        //#alertconfirmation
        var alert: Alert = this.alertController.create({
            title: "Confirmation",
            message: `Are you sure to ${message}?`,
            buttons: [
                {text: "no", role: "cancel"},
                {
                    text: "yes",
                    handler: handler
                }
            ]
        })
        alert.present();
        return alert;
    }

    private apiExecuteSubmitApplication(json: object): void {
        var url = `${ApiProvider.HRM_URL}s/ExchangeApplication_op`;

        this.apiProvider.submitGet<SuccessMessageInterface>(url, json, (response: SuccessMessageInterface) => {

            var message = response.message || "Cannot retrieve message";
            if (response.success) {
                this.helperProvider.presentToast(message);

                setTimeout(() => {
                    this.navCtrl.pop();

                }, 500)
            } else {
                this.helperProvider.showAlert(message);
            }

        });


    }


}

export interface ApplyExchangeApplicationParam extends ApplyBaseInterface<ExchangeListInterface> {

  dateFrom?:Date;
}
