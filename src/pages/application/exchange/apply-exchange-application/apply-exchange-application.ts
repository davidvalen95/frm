import {Component} from '@angular/core';
import {Alert, AlertController, IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import {BaseForm, InputType} from "../../../../components/Forms/base-form";
import {NgForm} from "@angular/forms";
import {ApiProvider} from "../../../../providers/api/api";
import {HelperProvider} from "../../../../providers/helper/helper";
import {UserProvider} from "../../../../providers/user/user";
import {RootParamsProvider} from "../../../../providers/root-params/root-params";

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
    public pageParam: ApplyExchangeApplicationParam;
    public baseForms: BaseForm[] = [];

    constructor(public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public helperProvider: HelperProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
        this.pageParam = navParams.data;

        this.setupForms();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ApplyExchangeApplicationPage');

    }

    setupForms() {


        var name: BaseForm = new BaseForm("Employee", "empName");
        name.value = `${this.userProvider.userSession.empId} ${this.userProvider.userSession.name}`;
        name.isReadOnly = true;


        var dateFrom = new BaseForm("Date From", "dateFrom");
        dateFrom.setInputTypeDate({min: new Date()});

        var dateTo = new BaseForm("Date To", "dateTo");
        dateTo.setInputTypeDate({min: new Date()});

        var type = new BaseForm("Type", "type");
        type.setInputTypeSelect([{key: "Annual", value: "annual"}]);

        var remark = new BaseForm("Remark", "remark");
        remark.setInputTypeText();

        var notifiedTo = new BaseForm("Notified to", "notifiedTo");
        notifiedTo.rules.isRequired = false;



        this.baseForms.push(name, dateFrom, dateTo, type, remark, notifiedTo);
    }

    formSubmit(form: NgForm) {

    }


    public leavePage() {

        this.helperProvider.showConfirmAlert("leave this page", () => {
            this.navCtrl.pop({}, () => {

            });

        })
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


}

export interface ApplyExchangeApplicationParam {

}