import {Component, Injectable} from '@angular/core';
import {BaseForm, InputType, KeyValue, LabelType} from "../Forms/base-form";
import {NgModel} from "@angular/forms";
import {HttpParams} from "@angular/common/http";
import {ApiProvider, EmployeeInformationInterface, VisitationDataApiInterface} from "../../providers/api/api";
import {UserProvider} from "../../providers/user/user";

/**
 * Generated class for the VisitationFormComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'visitation-form',
  templateUrl: 'visitation-form.html'
})
@Injectable()
export class VisitationFormComponent {


  public visitationData: VisitationDataApiInterface[] = [];
  public identityForms: PageForm[]                    = [];
  public identityForEmployeeForm: PageForm;
  public vechileForm: PageForm;
  public hostForm: PageForm;
  public identityInformationForm: PageForm;
  public visitationDetailForm: PageForm;
  public additionalForm: PageForm;


  public formValues: object = {};
  public categoryCountryRules:any = {}

  constructor(public apiProvider:ApiProvider, public userProvider:UserProvider) {
    console.log('Hello VisitationFormComponent Component');
    this.setUpForms();
  }


  setUpForms() {


    var requisitionType: BaseForm = new BaseForm("ReqType", "requisition_type");
    requisitionType.isHidden      = true;
    requisitionType.value         = "appointment";

    var visitorCategory: BaseForm = new BaseForm("Visitor Category", "visitorcategory_code");
    visitorCategory.inputType     = InputType.select;
    visitorCategory.selectOptions =
      [
        {
          key: "AUTHORITY / INSPECTION BODY / AUDITOR", value: "AUDIT"
        },
        {
          key: "CONTRACT WORKER / TEMPORARY PASS", value: "C001"
        },
        {
          key: "COURIER SERVICES", value: "COURI"
        },
        {
          key: "CUSTOMER", value: "CUST"
        },
        {
          key: "FORWARDER / TRANSPORTER", value: "FWDT"
        },
        {
          key: "GOODS DELIVERY", value: "DELIV"
        },
        {
          key: "JOB APPLICANT / INTERVIEW", value: "JOBAP"
        },
        {
          key: "MEMBER", value: "M001"
        },
        {
          key: "STAFF", value: "S002"
        },
        {
          key: "SUPPLIER", value: "S001"
        },
        {
          key: "VIP", value: "M002"
        }
      ];

    console.log('before obser');

    visitorCategory.setInputTypeSelectChain(this.apiProvider.getSelectOptionsVisitation(), ((data: object[]) => {

      var selectOptions: KeyValue[] = [];

      for (var key in data["visitorcategory"]) {
        var current: object = data["visitorcategory"][key];
        selectOptions.push({
          key: current["visitorcategory_name"],
          value: current["visitorcategory_code"]
        })
      }
      console.log('processing', selectOptions);
      return selectOptions;
    }));

    var visitorCountry: BaseForm = new BaseForm("Visitor Country", "visitor_ct");
    visitorCountry.inputType     = InputType.select;
    visitorCountry.selectOptions =
      [
        {
          key: "MALAYSIA", value: "MY"
        },
        {
          key: "INDONESIA", value: "ID"
        },
        {
          key: "CHINA", value: "CN",
        },
        {
          key: "MEXICO", value: "MX"
        }
      ];
    var visitorId: BaseForm      = new BaseForm("Employee Id", "visitor_id");
    visitorId.isHidden           = true;
    var visitorCompany: BaseForm = new BaseForm("Visitor Company", "outsider_code");
    visitorCompany.setInputTypeSelect([{key: "Other", value: ""}]);
    visitorCompany.isHidden = true;
    visitorCompany.rules.required = false;


    visitorCategory.changeListener.subscribe((data: NgModel) => {
      // console.log('visitorcategorySelect', data.value, 'tes: ',visitorCategory.value,'visitorId:',visitorId.value);
      // this.identityForms[0].baseForms[2].isHidden = true;
      visitorId.isHidden            = false;
      visitorId.rules.required      = true;
      visitorCompany.isHidden       = true;
      visitorId.inputType           = InputType.text;
      visitorId.value               = "";

      if (data.value.toLowerCase() == 's002' || data.value.toLowerCase() == 'staff') {
        visitorId.label            = "Employee Id";
        var httpParams: HttpParams = new HttpParams();
        httpParams                 = httpParams.set("autocomplete", "true");
        visitorId.setInputTypeSearchBar("s/EmployeeList", httpParams, ["keyword", "val"], ((serverResponse: any) => {
          console.log('fromSearchBarCallback', serverResponse);
          var selectOptions: KeyValue[] = [];

          for (var key in serverResponse) {
            selectOptions.push({key: serverResponse[key].label, value: serverResponse[key].value})
          }
          return selectOptions
        }))
      } else if (data.value.toLowerCase() == 'm001' || data.value.toLowerCase() == 'm002' || data.value.toLowerCase() == 'memb' || data.value.toLowerCase() == 'vip') {
        visitorId.label = "Member Id"
      } else {
        visitorId.isHidden            = true;
        visitorId.rules.required      = false;
        visitorCompany.isHidden       = false;
      }

      this.apiProvider.getVisitationFormRules(visitorCountry.value, visitorCategory.value).subscribe(data => {
        console.log('rules', data);
        console.log('value',visitorCountry.value,visitorCategory.value);
        this.categoryCountryRules    = data;
        var selectOptions:KeyValue[] = []
        for(var key in data["outsiders"]){

          var currentOutsider = data["outsiders"][key];
          selectOptions.push({key:currentOutsider["company_name"],value:currentOutsider["outsider_code"]})
        }
        visitorCompany.setInputTypeSelect(selectOptions)

      });



    });

    visitorCountry.changeListener.subscribe((model:NgModel)=>{
      this.apiProvider.getVisitationFormRules(visitorCountry.value, visitorCategory.value).subscribe(data => {
        console.log('rules', data);
        console.log('value',visitorCountry.value,visitorCategory.value);
        this.categoryCountryRules    = data;
        var selectOptions:KeyValue[] = []
        for(var key in data["outsiders"]){

          var currentOutsider = data["outsiders"][key];
          selectOptions.push({key:currentOutsider["company_name"],value:currentOutsider["outsider_code"]})
        }
        visitorCompany.setInputTypeSelect(selectOptions)

      });
    });



    var employeeId            = new BaseForm("", "emp_id");
    employeeId.isHidden       = true;
    employeeId.value          = this.userProvider.userSession.userId;
    employeeId.rules.required = false;
    this.identityForms.push(
      {
        title: 'Visitor Information',
        isOpen: false,
        baseForms: [visitorCategory, visitorCountry, visitorId, visitorCompany, employeeId, requisitionType],
        isHidden: false
      }
    );


    this.identityForEmployeeForm = {
      title: "Employee Information",
      isHidden: true,
      isOpen: false,
      baseForms: [],
    };
    this.identityInformationForm = {
      title: "Visitor Information",
      isOpen: true,
      baseForms: [],
      isHidden: false
    };


    var employeeIdCompletion: BaseForm = new BaseForm("Employee Id", "employeeId");


    var vechileType: BaseForm     = new BaseForm("Vechile Type *leave empty = no vechile", "vehicle_type");
    vechileType.rules.required    = false;
    var vechilePlateNo: BaseForm  = new BaseForm("Vechile Plate No *leave empty = no vechile", "vehicle_no");
    vechilePlateNo.rules.required = false;
    var vehicleInfo: BaseForm     = new BaseForm("Vechile Info", "vechile_info");
    vehicleInfo.rules.required    = false;
    this.vechileForm              = {
      title: "Vechile Information",
      isOpen: false,
      baseForms: [vechileType, vechilePlateNo, vehicleInfo],
      isHidden: false
    };

    var hostType: BaseForm = new BaseForm("Host Type", "host_type");
    hostType.inputType     = InputType.select;
    hostType.selectOptions = [ {
      key: "I am the host",
      value: 'true'
    }, {key: "Other as the host", value: 'false'}];


    var hostIdSearch: BaseForm  = new BaseForm("Employee ID / Name", "");
    //# http://hrms.dxn2u.com:8888/hrm_test2/s/EmployeeList?autocomplete=true&loc_id=FnF&keyword=my&val=my
    hostIdSearch.rules.required = false;
    var httpParams: HttpParams  = new HttpParams().set('autocomplete', 'true').set('loc_id', 'FnF');

    hostIdSearch.setInputTypeSearchBar("s/EmployeeList", httpParams, ["keyword", "val"], ((serverResponse: any) => {
      var selectOptions: KeyValue[] = [];
      for (var key in serverResponse) {
        selectOptions.push({key: serverResponse[key].label, value: serverResponse[key].value});
      }
      return selectOptions
    }));
    hostIdSearch.isHidden = true;

    var hostId: BaseForm          = new BaseForm("Employee ID", "host_id");
    hostId.labelType              = LabelType.inline;
    hostId.isReadOnly             = true;
    var hostName: BaseForm        = new BaseForm("Employee name", "host_name");
    hostName.labelType            = LabelType.inline;
    hostName.isReadOnly           = true;
    hostName.isHidden             = true;
    hostName.rules.required       = false;
    var hostDepartment: BaseForm  = new BaseForm("Department", "host_department");
    hostDepartment.labelType      = LabelType.inline;
    hostDepartment.isReadOnly     = true;
    hostDepartment.isHidden       = true;
    hostDepartment.rules.required = false;
    var hostSection: BaseForm     = new BaseForm("Section", "host_section");
    hostSection.labelType         = LabelType.inline;
    hostSection.isReadOnly        = true;
    hostSection.isHidden          = true;
    hostSection.rules.required    = false;

    hostType.changeListener.subscribe((model: NgModel) => {
      hostName.isHidden = hostIdSearch.isHidden = hostDepartment.isHidden = hostSection.isHidden = true;
      console.log((<boolean>model.value));
      hostId.value = "";
      if (model.value === 'true') {
        //#emp id is the host
        hostId.value = this.formValues["emp_id"];
        console.log('enter here ');

      } else if (model.value === 'false') {
        //# search']
        console.log('enter here lse');
        hostIdSearch.isHidden = false;
        hostName.isHidden     = hostIdSearch.isHidden = hostDepartment.isHidden = hostSection.isHidden = false;

      }

    });

    hostIdSearch.changeListener.subscribe((model: NgModel) => {
      this.apiProvider.getEmployeeInformation(model.value, true).then((serverResponse: EmployeeInformationInterface) => {
        hostId.value         = serverResponse.emp_id;
        hostName.value       = serverResponse.emp_name;
        hostDepartment.value = serverResponse.dept_name;
        hostSection.value    = serverResponse.sec_name;
      }).catch((rejected) => {
        console.log(rejected);
        this.apiProvider.presentToast("error");


      }).finally(()=>{
        this.apiProvider.dismissLoader()
      })
    });


    var ext: BaseForm = new BaseForm("Ext", 'host_ext');
    ext.rules         = {};

    this.hostForm = {
      title: "Host Information",
      isOpen: false,
      baseForms: [hostType, hostIdSearch, hostId, hostName, hostDepartment, hostSection, ext],
      isHidden: false
    };


// Return today's date and time
    var currentTime = new Date()
    currentTime.setDate(currentTime.getDate() + 60);


    var min                      = BaseForm.getCurrentDate();
    var max                      = currentTime.toISOString();
    console.log('maxTime',max);

    var visitationDate: BaseForm = new BaseForm("Visitation Date", "visitation_date");
    visitationDate.setInputTypeDate({min: min, max: max,});
    var untilDate            = new BaseForm("Until Date", "until_date");
    untilDate.setInputTypeDate({min:min,max:max})
    // untilDate.value          = visitationDate.value;
    // untilDate.rules.required = false;

    visitationDate.changeListener.subscribe((model: NgModel) => {
      // untilDate.value = model.value
      untilDate.value = ""
      untilDate.setInputTypeDate({min: model.value, max:max})
    });


    var visitationTime: BaseForm = new BaseForm("Visitation Time", "visitation_time");
    visitationTime.setInputTypeDate({displayFormat: "HH:mm"});
    var purpose: BaseForm = new BaseForm("Purpose", 'purpose_id');
    // purpose.setInputTypeSelect([{key:"Visitation",value:'1'},{key:"Control",value:"2"}]);
    purpose.setInputTypeSelectChain(this.apiProvider.getSelectOptionsVisitation(), ((data: object[]) => {

      var selectOptions: KeyValue[] = [];

      for (var key in data["purpose"]) {
        var current = data["purpose"][key];
        selectOptions.push({
          key: current["purpose"],
          value: current["id"],

        });

      }

      return selectOptions;
    }));

    var purposeSpecify: BaseForm  = new BaseForm("Purpose Specify", "purpose_specify");
    purposeSpecify.isHidden       = true;
    purposeSpecify.rules.required = false;
    purposeSpecify.value          = purpose.value;

    var destination: BaseForm = new BaseForm("Destination", 'destination_id');
    // destination.setInputTypeSelect([{key:"Factory",value:'1'},{key:"Market",value:"2"}]);
    destination.setInputTypeSelectChain(this.apiProvider.getSelectOptionsVisitation(), ((data: object[]) => {

      var selectOptions: KeyValue[] = [];

      for (var key in data["destination"]) {
        var current = data["destination"][key];
        selectOptions.push({
          key: current["destination"],
          value: current["id"],

        });
      }
      return selectOptions;

    }));

    var destinationSpecify            = new BaseForm("Destination Specify", "destination_specify");
    destinationSpecify.isHidden       = true;
    destinationSpecify.rules.required = false;
    // destinationSpecify.value = destination.value

    this.visitationDetailForm      = {
      title: "Visitation Detail",
      isOpen: false,
      baseForms: [visitationDate, untilDate,visitationTime, purpose, destination, purposeSpecify, destinationSpecify],
      isHidden: false
    };

    var remark: BaseForm = new BaseForm("Remark", "remark");
    this.additionalForm  = {
      title: "Additional Form",
      isOpen: false,
      baseForms: [remark],
      isHidden: false
    }


  }




}

interface PageForm {
  title: string,
  isOpen: boolean,
  baseForms: BaseForm[]
  isHidden: boolean
}

