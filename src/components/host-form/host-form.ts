import {Component, Injectable, Input} from '@angular/core';
import {BaseForm, KeyValue} from "../Forms/base-form";
import {HttpParams} from "@angular/common/http";
import {UserProvider} from "../../providers/user/user";
import {ApiProvider, EmployeeInformationInterface} from "../../providers/api/api";
import {HelperProvider} from "../../providers/helper/helper";
import {Alert, AlertController} from "ionic-angular";
import {NgForm} from "@angular/forms";
import {SectionFloatingInputInterface} from "../Forms/section-floating-input/section-floating-input";

/**
 * Generated class for the HostFormComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'host-form',
  templateUrl: 'host-form.html'
})
@Injectable()
export class HostFormComponent {

  text: string;


  @Input('parentForm') parentForm:NgForm;
  @Input('isFnf') isFnf:boolean = false;
  @Input('isEditing') isEditing:boolean = false;

  @Input('hostData') hostData:HostFormDataInterface;

  public sectionBaseForm: SectionFloatingInputInterface             = {
    name: "Host Information",
    isOpen: false,
    isHidden: false,
    baseForms: []
  };
  public extraHost: BaseForm[]                 = [];


  constructor(public userProvider:UserProvider, public apiProvider:ApiProvider, public helperProvider:HelperProvider, public alertController:AlertController) {

  }

  ngAfterContentInit() {
    this.setupForm();

  }



  public setupForm(){
    var hostType: BaseForm = new BaseForm("Host Type", "host_type");
    hostType.value = "-"

    hostType.setInputTypeSelect([{
      key: "I am the host",
      value: 't'
    }, {key: "Other as the host", value: 'f'}])


    var hostIdSearch: BaseForm    = new BaseForm("Employee ID / Name", "");
    //# http://hrms.dxn2u.com:8888/hrm_test2/s/EmployeeList?autocomplete=true&loc_id=FnF&keyword=my&val=my
    hostIdSearch.rules.isRequired = false;
    var httpParams: HttpParams    = new HttpParams().set('autocomplete', 'true').set('loc_id', 'FnF');

    hostIdSearch.setInputTypeSearchBar("s/EmployeeList", httpParams, ["keyword", "val"], ((serverResponse: any) => {
      var selectOptions: KeyValue[] = [];
      for (var key in serverResponse) {
        selectOptions.push({key: serverResponse[key].label, value: serverResponse[key].value});
      }
      return selectOptions
    }));
    // hostIdSearch.isHidden = true;

    setTimeout(()=>{
      if(this.isEditing){
        if(hostType.value =='t'){
          hostId.value = this.hostData.hostId || "";
        }else{
          hostIdSearch.value = this.hostData.hostId || "";

        }
      }

    },3000)

    var hostId: BaseForm            = new BaseForm("Employee ID", "host_id");
    hostId.isReadOnly               = true;
    var hostName: BaseForm          = new BaseForm("Employee name", "host_name");
    hostName.isReadOnly             = true;
    hostName.isHidden               = true;
    hostName.rules.isRequired       = false;
    // hostName.value = this.applyRule.data.host
    var hostDepartment: BaseForm    = new BaseForm("Department", "host_department");
    hostDepartment.isReadOnly       = true;
    hostDepartment.isHidden         = true;
    hostDepartment.rules.isRequired = false;
    var hostSection: BaseForm       = new BaseForm("Section", "host_section");
    hostSection.isReadOnly          = true;
    hostSection.isHidden            = true;
    hostSection.rules.isRequired    = false;


    hostType.changeListener.subscribe((model: BaseForm) => {
      console.log("hostTypeListener",model);
      hostName.isHidden = hostDepartment.isHidden = hostSection.isHidden = true;
      hostIdSearch.isHidden = true;

      hostId.value = "";
      if (model.value === 't') {
        //#emp id is the host
        hostId.value = this.userProvider.userSession.empId || "";
        console.log('enter here ', this.userProvider.userSession.empId,hostId);
        hostId.isHidden = ext.isHidden =true;

      } else if (model.value === 'f') {
        //# search']
        hostIdSearch.isHidden = false;

        hostIdSearch.value = "";
        ext.isHidden =false;

        hostId.value         = "";
        hostName.value       = "";
        hostDepartment.value = "";
        hostSection.value    = "";
        console.log('enter here lse');
        if (this.isEditing) {
          // hostIdSearch.value = this.applyRule.data.host_id || "";

        }else{
          hostIdSearch.value = "";

        }

      }

    });



    setTimeout(()=>{
      hostId.value = this.hostData.hostId || "";

    },300)
    setTimeout(() => {
      console.log('hostTypeValueTimeout', this.userProvider.userSession.isFnF);
      if (this.isFnf) {
        var hostTypeValue = 't';
        if (this.isEditing) {
          hostTypeValue = this.hostData.hostId == this.userProvider.userSession.empId ? 't' : 'f';
        }

        hostType.value = hostTypeValue;




      } else {
        hostType.value               = 'f';
        hostType.isHidden            = true;
      }


    }, 600)

    hostIdSearch.changeListener.subscribe((model: BaseForm) => {

      console.log('hostIdSearchChangelistener',model);
      if(model.value == ""){
        // hostId.value         = "";
        // hostName.value       = "";
        // hostDepartment.value = "";
        // hostSection.value    = "";

        return;
      }
      this.apiProvider.getEmployeeInformation(model.value, true).then((serverResponse: EmployeeInformationInterface) => {
        hostId.value         = serverResponse.emp_id;
        hostName.value       = serverResponse.emp_name;
        hostDepartment.value = serverResponse.dept_name;
        hostSection.value    = serverResponse.sec_name;

        hostId.isHidden = hostName.isHidden = hostDepartment.isHidden = hostSection.isHidden = false;
        hostIdSearch.value = "";
      }).catch((rejected) => {
        console.log(rejected);
        this.helperProvider.presentToast("error");


      }).finally(() => {
      })
    });


    var ext: BaseForm = new BaseForm("Ext", 'host_ext');
    ext.value         = this.hostData.hostExt || "";
    ext.rules         = {};


    var extraHost


    //# buat flag di completionFormSubmit
    var hostFormState:BaseForm = new BaseForm("","hostFormState");
    hostFormState.isHidden = true;
    hostFormState.value = "t";


    var extraHostBar:BaseForm = new BaseForm("Backup Host(to Edit)","extraHostBar");
    extraHostBar.rules.isRequired = false;
    var httpParams: HttpParams    = new HttpParams().set('autocomplete', 'true').set('loc_id', 'FnF');

    extraHostBar.setInputTypeSearchBar("s/EmployeeList", httpParams, ["keyword", "val"], ((serverResponse: any) => {
      var selectOptions: KeyValue[] = [];
      for (var key in serverResponse) {
        selectOptions.push({key: serverResponse[key].label, value: serverResponse[key].value});
      }
      return selectOptions
    }));

    extraHostBar.changeListener.subscribe((data:BaseForm)=>{
      if(data.value == ""){
        data.value = "";
        this.helperProvider.presentToast("Host already exist in the application");
        return;
      }
      //#check if exist
      var coutnerExist:number = 0;
      for(var key in this.sectionBaseForm.baseForms){
        var currentBaseForm = this.sectionBaseForm.baseForms[key];
        if(currentBaseForm.value == data.value){
          console.log('extraHostBar', currentBaseForm.value, data.value);

          coutnerExist++;
        }
      }
      if(coutnerExist<2){ //# self is 1
        this.addAnotherHost(data.value);

      }
      data.value = "";
    })


    this.sectionBaseForm.baseForms.push (hostType,hostIdSearch,hostId,hostName,hostDepartment,hostSection, ext, extraHostBar);

  }



  public addAnotherHost(value:string){

    if(value == ""){
      return;
    }
    var hostForm: BaseForm               = new BaseForm("Extra Host", `extraHost[${this.extraHost.length}]`);
    hostForm.value                       = value;
    hostForm.rules.isRequired            = false;
    hostForm.buttonRightSuccess.isHidden = false;
    hostForm.buttonRightSuccess.label    = "Detail";
    hostForm.isReadOnly                  = true;
    //#showing info


    hostForm.activateButtonRightDanger("X").subscribe((data:BaseForm)=>{
      this.helperProvider.showConfirmAlert("remove this host",()=>{
        hostForm.value = "";
        hostForm.isDisabled = true;
        hostForm.isHidden   = true;
        var index = this.sectionBaseForm.baseForms.indexOf(hostForm);
        this.sectionBaseForm.baseForms.splice(index,1);
      })
    })
    hostForm.buttonRightSuccess.clickListener.subscribe((data: BaseForm) => {

      //#showing info
      var alert: Alert = this.alertController.create({
        title: "Host detail",
        message: "Loading",
        buttons: [
          {
            text: "Ok",

          }]
      });
      console.log("extraHostClick",data.value);
      //# get the deatil
      this.apiProvider.getEmployeeInformation(data.value, true).then((serverResponse: EmployeeInformationInterface) => {
        console.log("extraHostEmployeeInformation",data.value, serverResponse);

        var id             = serverResponse.emp_id;
        var employeeName   = serverResponse.emp_name;
        var departmentName = serverResponse.dept_name;
        var sectionName    = serverResponse.sec_name;
        alert.setMessage(`
          <p>Id : ${id}</p>
          <p>Name: ${employeeName}</p>
          <p>Department: ${departmentName}</p>
          <p>Section Name: ${sectionName}</p>
        `);
        //# showing alert
        alert.present();

      }).catch((rejected) => {

        console.log(rejected);
        this.helperProvider.presentToast("error");


      }).finally(() => {
      })
      console.log('labelClickListener');

    });


    var httpParams: HttpParams    = new HttpParams().set('autocomplete', 'true').set('loc_id', 'FnF');
    //
    // hostForm.setInputTypeSearchBar("s/EmployeeList", httpParams, ["keyword", "val"], ((serverResponse: any) => {
    //   var selectOptions: KeyValue[] = [];
    //   for (var key in serverResponse) {
    //     selectOptions.push({key: serverResponse[key].label, value: serverResponse[key].value});
    //   }
    //   return selectOptions
    // }));

    this.extraHost.push(hostForm);
    this.sectionBaseForm.baseForms.push(hostForm);



  }
}


export interface HostFormDataInterface{
  hostId:string;
  otherHostId:string;
  hostExt;
}
