import {Component, Input, ViewChild} from '@angular/core';
import {
  AlertController, Content, InfiniteScroll, IonicPage, NavController, NavParams, Segment,
  Slides, ToolbarTitle
} from 'ionic-angular';
import {BaseForm, InputType, LabelType, KeyValue} from "../../../components/Forms/base-form";
import {NgForm, NgModel} from "@angular/forms";
import {
  ApiProvider, EmployeeInformationInterface, VisitationDataApiInterface, VisitationDataRecordsInterface,
  VisitationFilterApi
} from "../../../providers/api/api";
import {UserProvider} from "../../../providers/user/user";
import {SearchBarPage} from "../../search-bar/search-bar";
import {HttpParams} from "@angular/common/http";
import {VisitationDetailPage, VisitationDetailPageParam} from "../../visitation-detail/visitation-detail";

/**
 * Generated class for the VisitationApplicationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-visitation-application',
  templateUrl: 'visitation-application.html',
})
export class VisitationApplicationPage {


  public visitationData: VisitationDataApiInterface[] = [];
  public identityForms: PageForm[]                    = [];
  public identityForEmployeeForm: PageForm;
  public vechileForm: PageForm;

  public identityInformationForm: PageForm;
  public visitationDetailForm: PageForm;
  public additionalForm: PageForm;

  public segmentValue: string        = "list";
  public formSlides: Slides;
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public hostForm: PageForm;
  public isNeedHost: boolean         = true;
  public isInfiniteEnable: boolean   = true;
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  // @ViewChild('segment') public segment:Segment
  @ViewChild('formSlides')
  public set setSlides(slides: Slides) {


    if (slides) {
      this.formSlides = slides;
      this.formSlides.lockSwipes(true);
    }

  }

  @ViewChild(Content) public content: Content;

  public formValues: object        = {};
  public categoryCountryRules: any = {}

  constructor(public navCtrl: NavController,public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public userProvider: UserProvider) {
    this.setUpForms();
    this.getVisitation();

  }


  alert(message: string, title?: string) {
    this.alertController.create(
      {
        title: title || "",
        subTitle: message,
        buttons: ['Ok']
      }
    ).present();
  }

  completionFormSubmit(form: NgForm) {
    console.log(this.formSlides.length());
    if (form.valid) {
      this.content.scrollToTop();

      for (var key in form.value) {
        this.formValues[key] = form.value[key];
      }
      console.log('completionFormSubmit', this.formValues);
      if (this.formSlides.isEnd()) {
        console.log('submit form', this.formValues);
        this.formValues['outsider_specify'] = ""
        this.formValues['visitor_no']       = this.formValues['visitor_id'];
        this.formValues['act']              = 'add';
        this.formValues['tid']              = '-1';

        var message: string = "";

        this.apiProvider.submitVisitationAplyForm(this.formValues, "s/VisitationApplication_op").then((data) => {
          console.log('submit form response', data);

          message                = data["message"]
          var isSuccess: boolean = data["success"];
          if (isSuccess) {
            setTimeout(() => {
              this.segmentValue = "list";
            }, 1000)
          }

        }).catch(rejected => {
          message = rejected["message"]
          console.log('submit rejected', rejected);
        }).finally(() => {
          this.apiProvider.dismissLoader();
          this.apiProvider.presentToast(message)

        })
      }
      this.slideNext();

    }
    else {
      this.alert("Field(s) is not valid");
    }


  }

  doInfinite(infinite: InfiniteScroll) {
    if (this.visitationData.length >= (this.visitationData[0].maxpage)) {
      // infinite.enable(false);
      this.isInfiniteEnable = false

    } else {
      // infinite.enable(true);

      this.isInfiniteEnable = true;
      this.getVisitation(this.visitationData.length + 1).then(data => {
        if (data) {
          infinite.complete();

        }
      });
    }


  }


  identityFormSubmit(form: NgForm) {


    if (form.valid) {

      this.apiProvider;
      for (var key in form.value) {
        this.formValues[key] = form.value[key];
      }


      this.content.scrollToTop();
      var companion: BaseForm       = new BaseForm("Companion", "companion");
      companion.inputType           = InputType.number;
      var companionRemark: BaseForm = new BaseForm("Companion Remark", "companion_remark");
      companion.rules.max           = Number(this.categoryCountryRules["max_companion"]) || 0;

      console.log('companionForm', companion);


      if (form.value.visitorcategory_code.toLowerCase() == 's002' || form.value.visitorcategory_code.toLowerCase() == 'staff') {
        console.log('staff');


        this.apiProvider.getEmployeeInformation(this.formValues["visitor_id"]).then((employeeInformation: EmployeeInformationInterface) => {

          this.apiProvider.dismissLoader();
          this.slideNext();
          var employeeIdInformation: BaseForm  = new BaseForm("Employee Id", "visitor_id");
          employeeIdInformation.value          = employeeInformation.emp_id;
          employeeIdInformation.isReadOnly     = true;
          employeeIdInformation.labelType      = LabelType.inline;
          employeeIdInformation.rules.required = false;


          var employeeName: BaseForm  = new BaseForm("Employee Name", "visitor_name");
          employeeName.value          = employeeInformation.emp_name;
          employeeName.isReadOnly     = true;
          employeeName.labelType      = LabelType.inline;
          employeeName.rules.required = false;

          var employeeDepartment: BaseForm  = new BaseForm("Employee Department", "employeeDepartment");
          employeeDepartment.value          = employeeInformation.dept_name;
          employeeDepartment.isReadOnly     = true;
          employeeDepartment.labelType      = LabelType.inline;
          employeeDepartment.rules.required = false;

          var section: BaseForm    = new BaseForm("Section", "section");
          section.value            = employeeInformation.sec_name;
          section.isReadOnly       = true;
          section.labelType        = LabelType.inline;
          section.rules.required   = false;
          var gender: BaseForm     = new BaseForm("Gender", "visitor_gender");
          gender.value             = employeeInformation.gender;
          gender.isReadOnly        = true;
          gender.labelType         = LabelType.inline;
          gender.rules.required    = false;
          var birthDate: BaseForm  = new BaseForm("Birth Date", "visitor_birth_date");
          birthDate.value          = employeeInformation.birthdate_str;
          birthDate.isReadOnly     = true;
          birthDate.labelType      = LabelType.inline;
          birthDate.rules.required = false;
          // this.idIdentityInformationForm = new NgForm([],[]);
          // this.idIdentityInformationForm.removeControl(this.idIdentityInformationForm.contr)

          this.identityForEmployeeForm.baseForms = [employeeIdInformation, employeeName, employeeDepartment, section, gender, birthDate, companion, companionRemark];
          this.identityForEmployeeForm.isHidden  = false;
          this.identityInformationForm.isHidden  = true;

        }).catch(rejected => {
          console.log(rejected)
        })
        // s/VisitationRulesList?reqtype=emp_scan&keyword=MY08012734


      } else {
        this.slideNext();
        console.log('staff else');
        var visitorCompany: BaseForm = new BaseForm("Visitor Company", "visitor_no");
        visitorCompany.isReadOnly    = true;
        visitorCompany.isHidden      = true;
        visitorCompany.labelType     = LabelType.inline;
        visitorCompany.value         = form.value.visitorCompany;

        var visitorName: BaseForm = new BaseForm("Visitor Name", "visitor_name");
        if (form.value.visitorcategory_code.toLowerCase() == 'm001') {
          visitorCompany.label     = "Member ID";
          visitorCompany.inputType = InputType.text;
          visitorName.label        = "Member Name";
          visitorCompany.isHidden  = false;
        }
        var icNo: BaseForm = new BaseForm("IC no. / Passport no.", "visitor_no");
        icNo.setRulesPatternNumberOnly();
        var gender: BaseForm = new BaseForm("Gender", 'visitor_gender');
        // gender.setInputTypeSelect([{key:"Male", value:"m"},{key:"Female",value:"f"}]);
        gender.setInputTypeSelectChain(this.apiProvider.getSelectOptionsVisitation(), ((data: object[]) => {
          var selectOptions: KeyValue[] = [];
          for (var key in data["visitor_gender"]) {
            var current: object = data["visitor_gender"][key];
            selectOptions.push({
              key: current["description"],
              value: current["code"]
            })
          }


          return selectOptions
        }));
        var birthDate: BaseForm = new BaseForm("Birth Date", "visitor_birth_date");
        birthDate.setInputTypeDate({displayFormat: "DD MMM YYYY"});


        this.identityInformationForm.baseForms = new Array<BaseForm>();
        this.identityInformationForm.baseForms = [visitorCompany, visitorName, icNo, gender, birthDate, companion, companionRemark];
        this.identityForEmployeeForm.isHidden  = true;
        this.identityInformationForm.isHidden  = false;
        //# hide host if courier
        if (form.value.visitorcategory_code.toLowerCase() == 'couri') {
          this.isNeedHost = false;
        }
      }


    } else {
      this.alert("Field(s) is not valid");

    }


  }

  ionViewDidLoad() {
  }

  pushVisitationDetail(visitationData: VisitationDataRecordsInterface) {

    var param: VisitationDetailPageParam = {visitationData: visitationData,title:"Visitation Detail"}
    this.navCtrl.push(VisitationDetailPage, param)
  }

  slideNext() {
    if (this.formSlides) {
      this.formSlides.lockSwipes(false);
      this.formSlides.slideNext();
      this.formSlides.lockSwipes(true);
    }
  }

  slidePrevious() {
    if (this.formSlides) {
      this.formSlides.lockSwipes(false);
      this.formSlides.slidePrev();
      this.content.scrollToTop();
      this.formSlides.lockSwipes(true);
    }
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
    visitorCompany.isHidden       = true;
    visitorCompany.rules.required = false;


    visitorCategory.changeListener.subscribe((data: NgModel) => {
      // console.log('visitorcategorySelect', data.value, 'tes: ',visitorCategory.value,'visitorId:',visitorId.value);
      // this.identityForms[0].baseForms[2].isHidden = true;
      visitorId.isHidden       = false;
      visitorId.rules.required = true;
      visitorCompany.isHidden  = true;
      visitorId.inputType      = InputType.text;
      visitorId.value          = "";

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
        visitorId.isHidden       = true;
        visitorId.rules.required = false;
        visitorCompany.isHidden  = false;
      }

      this.apiProvider.getVisitationFormRules(visitorCountry.value, visitorCategory.value).subscribe(data => {
        console.log('rules', data);
        console.log('value', visitorCountry.value, visitorCategory.value);
        this.categoryCountryRules     = data;
        var selectOptions: KeyValue[] = []
        for (var key in data["outsiders"]) {

          var currentOutsider = data["outsiders"][key];
          selectOptions.push({key: currentOutsider["company_name"], value: currentOutsider["outsider_code"]})
        }
        visitorCompany.setInputTypeSelect(selectOptions)

      });


    });

    visitorCountry.changeListener.subscribe((model: NgModel) => {
      this.apiProvider.getVisitationFormRules(visitorCountry.value, visitorCategory.value).subscribe(data => {
        console.log('rules', data);
        console.log('value', visitorCountry.value, visitorCategory.value);
        this.categoryCountryRules     = data;
        var selectOptions: KeyValue[] = []
        for (var key in data["outsiders"]) {

          var currentOutsider = data["outsiders"][key];
          selectOptions.push({key: currentOutsider["company_name"], value: currentOutsider["outsider_code"]})
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
    hostType.selectOptions = [{
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


      }).finally(() => {
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


    var min = BaseForm.getCurrentDate();
    var max = currentTime.toISOString();
    console.log('maxTime', max);

    var visitationDate: BaseForm = new BaseForm("Visitation Date", "visitation_date");
    visitationDate.setInputTypeDate({min: min, max: max,});
    var untilDate = new BaseForm("Until Date", "until_date");
    untilDate.setInputTypeDate({min: min, max: max})
    // untilDate.value          = visitationDate.value;
    // untilDate.rules.required = false;

    visitationDate.changeListener.subscribe((model: NgModel) => {
      // untilDate.value = model.value
      untilDate.value = ""
      untilDate.setInputTypeDate({min: model.value, max: max})
    });


    var visitationTime: BaseForm = new BaseForm("Visitation Time", "visitation_time");
    // visitationTime.setInputTypeDate({displayFormat: "HH:mm"});
    visitationTime.setInputTypeTime();
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

    this.visitationDetailForm = {
      title: "Visitation Detail",
      isOpen: false,
      baseForms: [visitationDate, untilDate, visitationTime, purpose, destination, purposeSpecify, destinationSpecify],
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

  setupIdentityForm() {

  }

  filterChanged() {
    console.log(this.filter);
    this.visitationData   = [];
    // this.infiniteScroll.enable(true);
    this.isInfiniteEnable = true;
    this.getVisitation();

  }

  getVisitation(page = 1): Promise<any> {
    return this.apiProvider.getVisitationContainer(this.filter, this.userProvider.userSession, false, page).then((data: VisitationDataApiInterface) => {
      // console.log(data);
      this.visitationData.push(data);
      return Promise.resolve(true);
    });
  }

  ionSegmentChange() {
    if (this.segmentValue == 'list') {
      this.visitationData = [];
      this.getVisitation();
    } else {

    }
  }

  popUp(ev) {
    this.navCtrl.push(SearchBarPage, {})
  }
}


interface PageForm {
  title: string,
  isOpen: boolean,
  baseForms: BaseForm[]
  isHidden: boolean
}
