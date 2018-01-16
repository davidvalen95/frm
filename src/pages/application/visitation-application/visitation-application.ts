import {Component, Input, ViewChild} from '@angular/core';
import {
  Alert,
  AlertController, Content, InfiniteScroll, IonicPage, Navbar, NavController, NavParams, Segment,
  Slides, ToastController, ToolbarTitle
} from 'ionic-angular';
import {BaseForm, InputType, LabelType, KeyValue} from "../../../components/Forms/base-form";
import {NgForm, NgModel} from "@angular/forms";
import {
  ApiProvider, CompanyInformation, EmployeeInformationInterface, VisitationDataApiInterface,
  VisitationDataDetailInterface,
  VisitationDataRecordsInterface,
  VisitationFilterApi
} from "../../../providers/api/api";
import {UserProvider} from "../../../providers/user/user";
import {SearchBarPage} from "../../search-bar/search-bar";
import {HttpParams} from "@angular/common/http";
import {VisitationDetailPage, VisitationDetailPageParam} from "../../visitation-detail/visitation-detail";
import {RootParamsProvider} from "../../../providers/root-params/root-params";
import {MyHelper} from "../../../providers/myHelper";

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

  public title: string;
  public visitationData: VisitationDataApiInterface[] = [];
  public identityForms: PageForm[]                    = [];
  public identityForEmployeeForm: PageForm;
  public vechileForm: PageForm;
  public statusFilter;
  public identityInformationForm: PageForm;
  public visitationDetailForm: PageForm;
  public additionalForm: PageForm;

  public segmentValue: string        = "list";
  public formSlides: Slides;
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public hostForm: PageForm;
  public isNeedHost: boolean         = true;
  public isInfiniteEnable: boolean   = true;

  public ngForms: NgForm[]                     = [];
  public extraHost: BaseForm[]                 = [];
  public pageParam: VisitationApplicationParam = {};
  public isFormSettedUp:boolean                = false;

  public slidingStatus = {previous:false,next:false};
  @ViewChild('infiniteScroll') public infiniteScroll: InfiniteScroll;

  // @ViewChild('segment') public segment:Segment
  @ViewChild('formSlides')
  public set setSlides(slides: Slides) {


    if (slides) {
      this.formSlides = slides;
      this.formSlides.lockSwipes(true);
    }

  }

  @ViewChild("navbar") navbar:Navbar;
  @ViewChild(Content) public content: Content;

  public formValues: object        = {};
  public categoryCountryRules: any = {}

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {
    console.log("visitationApplicationParam", this.rootParam.visitationApplicationParam);



    if (this.rootParam.visitationApplicationParam.isProvider) {
      this.pageParam = this.rootParam.visitationApplicationParam
    }
    else {
      this.pageParam = navParams.data;
    }

    this.pageParam.isProvider       = false;
    this.pageParam.isEditInitialize = this.pageParam.isEditing;
    // this.resetWhenEdit();


    console.log('visitationApplicationParam', this.pageParam, navParams.get("isApprover"));
    if (!this.pageParam.editData) {
      this.pageParam.editData = {};
    }
    if (this.pageParam.isApprover) {
      this.statusFilter = [
        {value: 'AP', name: 'Approved'},
        {value: 'RE', name: 'Rejected'},
        {value: 'PA', name: 'Pending Approval'},

      ]
    } else {
      this.statusFilter = [
        {value: '', name: '--All--'},
        {value: 'submitted', name: 'Submitted'},
        {value: 'PA', name: 'Pending Approval'},
        {value: 'AP', name: 'Approved'},
        {value: 'RE', name: 'Rejected'},
        {value: 'CA', name: 'Cancelled'},
        {value: 'in', name: 'In'},
        {value: 'out', name: 'Out'},
        {value: 'expired', name: 'Expired'}
      ]
    }

    // this.setUpForms();
    if (this.pageParam != null) {
      this.title = this.rootParam.visitationApplicationParam.title || "Visitation Application";

    } else {
      this.title = this.pageParam.title;
    }

    this.userProvider.watchFnF.subscribe(() => {
      if(!this.isFormSettedUp){
        this.setUpForms();

      }

    })


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


      if(form.value.hostFormState){
        //# convert to id format my080127;my080123
        this.convertIdFormat();
      }




      this.content.scrollToTop();

      for (var key in form.value) {
        this.formValues[key] = form.value[key];
      }
      console.log('completionFormSubmit', this.formValues);
      this.ngForms.push(form);

      if (this.formSlides.isEnd()) {
        this.submitForm();
      }
      this.slideNext();


    }
    else {
      this.alert("<span style='color:red'>Please check field(s) mark in red</span>");
      console.log('formNotValid', form.value);
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
      this.formValues["visitor_no"] = "";


      this.apiProvider;
      for (var key in form.value) {
        this.formValues[key] = form.value[key];
      }
      console.log('identityFormSubmit', this.formValues, form);

      this.content.scrollToTop();
      var companion: BaseForm = new BaseForm("Companion", "companion");
      // companion.inputType           = InputType.number;
      companion.setRulesPatternNumberOnly();
      companion.value                  = "" + (this.pageParam.editData.companion || 0);
      var companionRemark: BaseForm    = new BaseForm("Companion Remark", "companion_remark");
      companion.rules.max              = Number(this.categoryCountryRules["max_companion"]) || 0;
      companionRemark.rules.isRequired = false;
      companionRemark.value            = this.pageParam.editData.companion_remark || "";
      console.log('companionForm', companion);


      companion.changeListener.subscribe((model: BaseForm) => {
        if  (model.value == "0") {
          companionRemark.rules.isRequired = false;
        } else {
          companionRemark.rules.isRequired = true;
        }
      })
      companionRemark.changeListener.subscribe((data:BaseForm)=>{
        data.value = MyHelper.ucWord(data.value);
      })


      var mobileNo: BaseForm = new BaseForm("Mobile No", "mobile_no");
      // mobileNo.setRulesPatternNumberOnly();

      mobileNo.isHidden         = false;
      mobileNo.rules.isRequired = true;
      // mobileNo.isReadOnly     = this.pageParam.isEditing;
      if (form.value.visitorcategory_code.toLowerCase() == 's002' || form.value.visitorcategory_code.toLowerCase() == 'staff') {
        console.log('staff');
        //# only for read only
        this.apiProvider.getEmployeeInformation(this.formValues["visitor_id"]).then((employeeInformation: EmployeeInformationInterface) => {


          this.formValues["visitor_no"] = (employeeInformation.ident_no||"") !== '' ? employeeInformation.ident_no : "-";

          this.apiProvider.dismissLoader();
          this.ngForms.push(form)

          var employeeIdInformation: BaseForm    = new BaseForm("Employee Id", "visitor_id");
          employeeIdInformation.value            = employeeInformation.emp_id || "";
          employeeIdInformation.isReadOnly       = true;
          employeeIdInformation.labelType        = LabelType.inline;
          employeeIdInformation.rules.isRequired = false;


          var employeeName: BaseForm    = new BaseForm("Employee Name", "visitor_name");
          employeeName.value            = employeeInformation.emp_name || "";
          employeeName.isReadOnly       = true;
          employeeName.labelType        = LabelType.inline;
          employeeName.rules.isRequired = false;


          var employeeDepartment: BaseForm    = new BaseForm("Employee Department", "employeeDepartment");
          employeeDepartment.value            = employeeInformation.dept_name;
          employeeDepartment.isReadOnly       = true;
          employeeDepartment.labelType        = LabelType.inline;
          employeeDepartment.rules.isRequired = false;

          var section: BaseForm    = new BaseForm("Section", "section");
          section.value            = employeeInformation.sec_name;
          section.isReadOnly       = true;
          section.labelType        = LabelType.inline;
          section.rules.isRequired = false;
          var gender: BaseForm     = new BaseForm("Gender", "visitor_gender");
          gender.value             = employeeInformation.gender || "";
          gender.isReadOnly        = true;
          gender.labelType         = LabelType.inline;
          gender.rules.isRequired  = false;
          gender.setInputTypeSelect([{key: "Male", value: "m"}, {key: "Female", value: "f"}]);
          gender.setInputTypeSelectChain(this.apiProvider.getSelectOptionsVisitation(this.userProvider), ((data: object[]) => {
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


          // var birthDate: BaseForm = new BaseForm("Birth Date", "visitor_birth_date");
          // birthDate.setInputTypeDate({displayFormat: "DD MMM YYYY"});
          // if (employeeInformation.birthdate_str && employeeInformation.birthdate_str != "") {
          //   var birthDateValue = this.pageParam.editData.visitor_birth_date || employeeInformation.birthdate_str || "";
          //   birthDate.setDateAdvance1Day(birthDateValue)
          //
          // }
          // console.log('birthDateValue', birthDateValue);
          //
          //
          // birthDate.isReadOnly       = true;
          // birthDate.labelType        = LabelType.inline;
          // birthDate.rules.isRequired = false;
          // this.idIdentityInformationForm = new NgForm([],[]);
          // this.idIdentityInformationForm.removeControl(this.idIdentityInformationForm.contr)

          mobileNo.isHidden         = true;
          mobileNo.rules.isRequired = false;

          this.identityForEmployeeForm.baseForms = [employeeIdInformation, employeeName, employeeDepartment, section, gender, companion, companionRemark, mobileNo];
          this.identityForEmployeeForm.isHidden  = false;
          this.identityInformationForm.isHidden  = true;
          console.log("own");
          this.slideNext();

        }).catch(rejected => {
          console.log(rejected)
        })


        // s/VisitationRulesList?reqtype=emp_scan&keyword=MY08012734


      } else {
        console.log('staff else');


        this.apiProvider.getCompanyInformation(this.formValues["outsider_code"]).then((data: CompanyInformation) => {

          // var visitorCompany: BaseForm   = new BaseForm("Visitor Company", "visitor_id");
          // visitorCompany.isReadOnly      = true;
          // visitorCompany.isHidden        = true;
          // visitorCompany.
          // visitorCompany.labelType       = LabelType.inline;
          // visitorCompany.value           = this.pageParam.editData.visitor_no || form.value.visitorCompany || "";
          // visitorCompany.rules.required  = false;
          var visitorName: BaseForm = new BaseForm("Visitor Name", "visitor_name");
          if (form.value.visitorcategory_code.toLowerCase() == 'm001') {
            // visitorCompany.label     = "Member ID";
            // visitorCompany.inputType = InputType.text;
            visitorName.label = "Member Name";
            // visitorCompany.isHidden  = true;
          }
          visitorName.value = this.pageParam.editData.visitor_name || "";

          visitorName.changeListener.subscribe((data:BaseForm)=>{

            data.value = MyHelper.ucWord(data.value);
          })
          var icNo: BaseForm = new BaseForm("IC No. / Passport No.", "visitor_no");
          // icNo.setRulesPatternNumberOnly();


          icNo.changeListener.subscribe((data: BaseForm) => {
            console.log('mo/oi icnochangelistner',data);

            // icNo.rules.isRequired = mobileNo.rules.isRequired
            setTimeout(() => {
              mobileNo.rules.isRequired = "" + data.value == "";
              console.log("icNOTriggered")
            }, 300)


          })

          mobileNo.changeListener.subscribe((data: BaseForm) => {
            console.log('mo/oi mobilechangelistener',data);
            setTimeout(() => {
              icNo.rules.isRequired = "" + data.value == "";

            }, 300)

          })


          setTimeout(() => {
              // if()
              icNo.value = this.pageParam.editData.visitor_no  || "";


          }, 1000)
          setTimeout(() => {
            mobileNo.value = this.pageParam.editData.mobile_no || "";

          }, 1000)

          var gender: BaseForm = new BaseForm("Gender", 'visitor_gender');
          gender.setInputTypeSelect([{key: "Male", value: "m"}, {key: "Female", value: "f"}]);
          gender.setInputTypeSelectChain(this.apiProvider.getSelectOptionsVisitation(this.userProvider), ((data: object[]) => {
            var selectOptions: KeyValue[] = [];
            for (var key in data["visitor_gender"]) {
              var current: object = data["visitor_gender"][key];
              selectOptions.push({
                key: current["description"],
                value: current["code"]
              })
            }

            gender.value = this.pageParam.editData.visitor_gender || "";

            return selectOptions
          }));


          var birthDate: BaseForm = new BaseForm("Birth Date", "visitor_birth_date");
          birthDate.setInputTypeDate({displayFormat: "DD MMM YYYY"});
          birthDate.rules.isRequired = false;
          var birthDateValue         = this.pageParam.editData.visitor_birth_date || "";
          birthDate.setDateAdvance1Day(birthDateValue)

          // birthDate.value =  new Date(this.pageParam.editData.visitor_birth_date).toISOString();
          this.identityInformationForm.baseForms = new Array<BaseForm>();
          this.identityInformationForm.baseForms = [visitorName, mobileNo, icNo, gender, birthDate, companion, companionRemark];
          this.identityForEmployeeForm.isHidden  = true;
          this.identityInformationForm.isHidden  = false;
          //# hide host if courier
          if (form.value.visitorcategory_code.toLowerCase() == 'couri') {
            this.isNeedHost = false;
          }

          this.ngForms.push(form);
          this.slideNext();

        })


      }



    } else {
      // this.alert("Field(s) is not valid");
      this.alert("Please check field(s) mark in red");

    }


  }


  ionViewDidLoad() {

    console.log("visitationApplicationBoolean", this.pageParam);

    if (!this.pageParam.isEditing) {
      if (this.pageParam.isApprover) {
        //# will trigger getVisitation
        this.filter.cmbStatus = "PA";
        this.getVisitation();

      } else {
        this.getVisitation();

      }
      console.log('enter !');

    } else {

      console.log('enter here');

      var param: VisitationApplicationParam = <VisitationApplicationParam> this.pageParam
      this.pageParam.editTid                = param.editTid;
      if (param.editData == null || this.pageParam.editTid == '-1') {
        //reset
        // this.pageParam.editData = {};
        // this.pageParam.isEditing = false;
        // this.segmentValue = "list"

        this.toastController.create({
          message: "Data not found error",
          duration: 1000,
        }).present();
        this.navCtrl.pop();
      } else {
        this.pageParam.editData  = param.editData || "";
        this.pageParam.isEditing = true;
        this.segmentValue        = "apply"


      }

      // this.setupIdentityForm();
      // this.setUpForms();
    }



    //# overide back button
    if(this.pageParam.isEditing || this.pageParam.isApply){
      this.navbar.backButtonClick = (e:UIEvent)=>{

        this.showConfirmAlert("cancel " + this.pageParam.isEditing ? "edit" : "apply",()=>{
          this.navCtrl.pop();

        })


      }
    }

  }

  pushVisitationDetail(visitationData: VisitationDataRecordsInterface) {

    var param: VisitationDetailPageParam = {
      visitationData: visitationData,
      title: "Visitation Detail",
      isVisitation: true,
      isApprover: this.pageParam.isApprover,
      actionOnPop: () => {
        this.getVisitation();
      }
    }
    this.navCtrl.push(VisitationDetailPage, param)
  }

  slideNext() {
    if (this.formSlides && !this.slidingStatus.next ) {
      console.log('slidenext');
      this.slidingStatus.next = true;
      this.formSlides.lockSwipes(false);
      this.formSlides.slideNext(100);
      this.formSlides.lockSwipes(true);
      setTimeout(()=>{
        this.slidingStatus.next = false;

      },400)
    }
  }

  slidePrevious() {
    if (this.formSlides && !    this.slidingStatus.previous) {
      console.log('slideprevious');

      this.slidingStatus.previous  = true;

      this.formSlides.lockSwipes(false);
      this.formSlides.slidePrev(100);
      this.content.scrollToTop();
      this.formSlides.lockSwipes(true);
      setTimeout(()=>{
        this.slidingStatus.previous = false;

      },400)

    }
  }

  setUpForms() {
    this.isFormSettedUp = true;
    this.identityForms = [];

    var primitiveVisitorId        = "" + (this.pageParam.editData.visitor_id || "").replace("2p0o0p", "2p0o0p");
    primitiveVisitorId            = primitiveVisitorId.slice(0, primitiveVisitorId.length);
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


    visitorCategory.setInputTypeSelectChain(this.apiProvider.getSelectOptionsVisitation(this.userProvider), ((data: object[]) => {

      var selectOptions: KeyValue[] = [];

      for (var key in data["visitorcategory"]) {
        var current: object = data["visitorcategory"][key];
        if (!this.userProvider.userSession.isFnF) {
          if (!current["only_fnf"]) {
            //# menu khusus FNF
            selectOptions.push({
              key: current["visitorcategory_name"],
              value: current["visitorcategory_code"]
            })
          }
        } else {
          //# menu non FNF
          selectOptions.push({
            key: current["visitorcategory_name"],
            value: current["visitorcategory_code"]
          })
        }

      }
      console.log('processing', selectOptions);
      visitorCompany.value            = this.pageParam.editData.outsider_code || "";

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
    // if(this.pageParam.isEditing){
    //   setTimeout(() => {
    //     visitorCountry.value = this.pageParam.editData.visitor_ct;
    //
    //   }, 100);
    // }else{
    //   visitorCountry.value          = this.userProvider.userSession.ct_id;
    //
    // }


    visitorCountry.value = this.pageParam.editData.visitor_ct;
    visitorCountry.value          = this.userProvider.userSession.ct_id;

    var visitorId: BaseForm      = new BaseForm("Employee Id", "visitor_id");
    visitorId.isHidden           = true;
    visitorId.value              = "" + (this.pageParam.editData.visitor_id || "");
    var visitorCompany: BaseForm = new BaseForm("Visitor Company", "outsider_code");
    visitorCompany.setInputTypeSelect([{key: "Other", value: "OTHER"}]);
    visitorCompany.isHidden         = true;
    visitorCompany.rules.isRequired = false;


    setTimeout(()=>{

    },600);



    var outsiderSpecify: BaseForm    = new BaseForm("Please Specify Company", "outsider_specify");
    outsiderSpecify.value            = this.pageParam.editData.outsider_specify || "";
    outsiderSpecify.isHidden         = true;
    outsiderSpecify.rules.isRequired = false;
    visitorCompany.changeListener.subscribe((data: BaseForm) => {
      console.log('visitorCompanyChangelistener',data, data.value.toLowerCase().indexOf("other"));
      outsiderSpecify.isHidden         = true;
      outsiderSpecify.rules.isRequired = false;
      outsiderSpecify.value = "";
      visitorId.value = data.value;

      data.selectOptions.filter((keyValue:KeyValue)=>{
        if(keyValue.value == data.value){
          if(keyValue.key.toLowerCase().indexOf("other")>-1){
            outsiderSpecify.isHidden         = false;
            outsiderSpecify.rules.isRequired = true;
          }
        }
      })

    })
    var visitorType: BaseForm = new BaseForm("Visitor Type", "visitor_type"); //# for nonFnf
    visitorType.setInputTypeSelect([{
      key: "For Own Visit", value: "own"
    }, {
      key: "For Other Visit", value: "other",
    }])
    visitorType.isHidden = this.userProvider.userSession.isFnF;

    visitorType.changeListener.subscribe((model: BaseForm) => {
      console.log('visitorTypeChangeListener');
      if (visitorCategory.value.toLowerCase() != "s001" && visitorCategory.value.toLowerCase() != "s002" && visitorCategory.value.toLowerCase() != "staff") {
        return;
      }
      if (model.value == "own") {
        visitorId.isHidden         = true;
        visitorId.rules.isRequired = false;
        visitorId.value            = this.userProvider.userSession.empId;
        if (this.pageParam.isEditing) {
          primitiveVisitorId = "";
          console.log('visitorIdafterEdit', primitiveVisitorId);
        }

      } else if (model.value == "other") {
        visitorId.isHidden         = false;
        visitorId.rules.isRequired = true;
        String

        console.log('visitorIdBeforeEdit', primitiveVisitorId);
        visitorId.value = primitiveVisitorId;


      }
    })
    setTimeout(() => {
      // visitorType.value = (this.pageParam.editData.visitor_id || "") ==  this.userProvider.userSession.empId ? 'own' : "other";

      var visitorTypeValue = "own";

      if (this.pageParam.isEditing) {
        visitorTypeValue = (this.pageParam.editData.visitor_id || "") == this.userProvider.userSession.empId ? 'own' : "other";
      }
      visitorType.value = visitorTypeValue;


      visitorId.rules.isRequired = visitorTypeValue == "other";


    }, 300)

    //# get value when edit initialize
    var isVisitorCategoryClicked: boolean = false;
    visitorCategory.inputClickListener.subscribe((data: BaseForm) => {
      isVisitorCategoryClicked = true;
    })
    visitorCategory.changeListener.subscribe((data: BaseForm) => {
      console.log('visitorCategoryChanged', data);
      // console.log('visitorcategorySelect', data.value, 'tes: visitorCountry.value',visitorCategory.value,'visitorId:',visitorId.value);
      // this.identityForms[0].baseForms[2].isHidden = true;

      visitorCompany.isHidden = true;
      visitorCompany.rules.isRequired = false;
      // visitorCompany.value = "";
      visitorId.inputType     = InputType.text;
      visitorId.isReadOnly    = false;
      visitorId.isSearchBar   = false;
      if (isVisitorCategoryClicked) {
        visitorId.value = "";

      }
      visitorId.rules.isRequired = true;
      visitorType.isHidden       = true;
      // visitorCountry.isReadOnly  = false;
      visitorCountry.value       = this.userProvider.userSession.ct_id;

      //# hide the visitorId, shown by switch VisitorType
      if (this.userProvider.userSession.isFnF || (<string>data.value).toLowerCase() == "m001" || (<string>data.value).toLowerCase() == "m002")
        visitorId.isHidden = false;
      else {
        if (visitorType.value == "own") {
          visitorId.isHidden         = true;
          visitorId.rules.isRequired = false;
        }
      }


      if (data.value.toLowerCase() == 's002' || data.value.toLowerCase() == 'staff') {

        if (!this.userProvider.userSession.isFnF) {
          visitorType.isHidden          = false;
          visitorType.value             = "own";
          visitorId.value               = this.pageParam.editData.visitor_id || this.userProvider.userSession.empId;
          // visitorCountry.isReadOnly     = true;
          this.formValues["visitor_ct"] = visitorCountry.value;
          visitorCountry.value          = this.userProvider.userSession.ct_id;



        }
        visitorId.label            = "Employee Id / Name";
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

        console.log('visitorCategoryElse');
        visitorId.isHidden         = true;
        visitorId.rules.isRequired = false;
        visitorCompany.isHidden    = false;
        visitorCompany.rules.isRequired = true;

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

    // visitorId.changeListener.subscribe((data:BaseForm)=>{
    //   data.
    // })


    visitorCountry.changeListener.subscribe((model: BaseForm) => {
      console.log("visitorCountryChanged");
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


    setTimeout(() => {
      var defaultVisitorCategory = this.pageParam.editData.visitorcategory_code;

      if (!this.pageParam.isEditing) {
        defaultVisitorCategory = !this.userProvider.userSession.isFnF ? "S002" : "";

      }
      visitorCategory.value = defaultVisitorCategory;
      console.log("visitorCategory", this.userProvider.userSession.isFnF, defaultVisitorCategory, visitorCategory);

    }, 300)

    console.log('setupFormsVisitorCategory', visitorCategory);

    this.identityForms.push(
      {
        title: 'Visitor Information',
        isOpen: false,
        baseForms: [visitorCategory, visitorCountry, visitorType, visitorId, visitorCompany,outsiderSpecify],
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


    var vehicleInfo: BaseForm = new BaseForm("With Vehicle","vehicle_info");
    vehicleInfo.setInputTypeSelect([{
      key: "Yes",
      value:"t"
    },{
      key: "No",
      value:"f"
    }])




    var vehicleType: BaseForm       = new BaseForm("Vechile Type", "vehicle_type");
    vehicleType.rules.isRequired    = false;
    vehicleType.value               = this.pageParam.editData.vehicle_type || "";
    var vehiclePlateNo: BaseForm    = new BaseForm("Vechile Plate No", "vehicle_no");
    vehiclePlateNo.rules.isRequired = false;
    vehiclePlateNo.value            = this.pageParam.editData.vehicle_no || "";
    this.vechileForm                = {
      title: "Vechile Information",
      isOpen: false,
      baseForms: [vehicleInfo, vehicleType, vehiclePlateNo],
      isHidden: false
    };

    vehicleInfo.changeListener.subscribe((data:BaseForm)=>{
      if(data.value == "f"){
        vehicleType.isHidden = true;
        vehiclePlateNo.isHidden = true;
        vehiclePlateNo.rules.isRequired = false;

      }else{
        vehicleType.isHidden = false;
        vehiclePlateNo.isHidden = false;
        vehiclePlateNo.rules.isRequired = true;

      }
    })

    setTimeout(()=>{
      vehicleInfo.value = (this.pageParam.editData.vehicle_info  || false ) ? 't' : 'f';

    },300)
    var hostType: BaseForm = new BaseForm("Host Type", "host_type");
    hostType.inputType     = InputType.select;


    hostType.selectOptions = [{
      key: "I am the host",
      value: 't'
    }, {key: "Other as the host", value: 'f'}];


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
    hostIdSearch.isHidden = true;
    hostIdSearch.value = this.pageParam.editData.host_id || "";

    var hostId: BaseForm            = new BaseForm("Employee ID", "host_id");
    hostId.labelType                = LabelType.inline;
    hostId.isReadOnly               = true;
    var hostName: BaseForm          = new BaseForm("Employee name", "host_name");
    hostName.labelType              = LabelType.inline;
    hostName.isReadOnly             = true;
    hostName.isHidden               = true;
    hostName.rules.isRequired       = false;
    // hostName.value = this.pageParam.editData.host
    var hostDepartment: BaseForm    = new BaseForm("Department", "host_department");
    hostDepartment.labelType        = LabelType.inline;
    hostDepartment.isReadOnly       = true;
    hostDepartment.isHidden         = true;
    hostDepartment.rules.isRequired = false;
    var hostSection: BaseForm       = new BaseForm("Section", "host_section");
    hostSection.labelType           = LabelType.inline;
    hostSection.isReadOnly          = true;
    hostSection.isHidden            = true;
    hostSection.rules.isRequired    = false;


    hostType.changeListener.subscribe((model: BaseForm) => {
      console.log("hostTypeListener",model);
      hostName.isHidden = hostIdSearch.isHidden = hostDepartment.isHidden = hostSection.isHidden = true;
      hostId.value = "";
      if (model.value === 't') {
        //#emp id is the host
        hostId.value = this.userProvider.userSession.empId || "";
        console.log('enter here ', this.userProvider.userSession.empId,hostId);

      } else if (model.value === 'f') {
        //# search']
        hostIdSearch.value = "";

        console.log('enter here lse');
        if (this.pageParam.isEditing) {
          hostIdSearch.value = "";

        }
        hostName.isHidden = hostIdSearch.isHidden = hostDepartment.isHidden = hostSection.isHidden = false;

      }

    });


    setTimeout(() => {
      console.log('hostTypeValueTimeout', this.userProvider.userSession.isFnF);
      if (this.userProvider.userSession.isFnF) {
        hostType.value = 't';
        if (this.pageParam.isEditing) {
          hostType.value = this.pageParam.editData.host_id == this.userProvider.userSession.empId ? 't' : 'f';
        }
        hostId.value = this.pageParam.editData.host_id || "";


      } else {
        hostType.value               = 'f';
        hostType.isHidden            = true;
        this.formValues["host_type"] = 'f';
      }


    }, 300)

    hostIdSearch.changeListener.subscribe((model: BaseForm) => {
      if(model.value == ""){
        // return;
      }
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
    ext.value         = this.pageParam.editData.host_ext || "";
    ext.rules         = {};


    var extraHost


    //# buat flag di completionFormSubmit
    var hostFormState:BaseForm = new BaseForm("","hostFormState");
    hostFormState.isHidden = true;
    hostFormState.value = "t";


    var extraHostBar:BaseForm = new BaseForm("Extra Host","extraHostBar");
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
        return;
      }
      //#check if exist
      var coutnerExist:number = 0;
      for(var key in this.hostForm.baseForms){
        var currentBaseForm = this.hostForm.baseForms[key];
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


    this.hostForm = {
      title: "Host Information",
      isOpen: false,
      baseForms: [hostType, hostIdSearch, hostId, hostName, hostDepartment, hostSection, ext, hostFormState, extraHostBar],
      isHidden: false
    };


    //#otherhost
    if(this.pageParam.isEditing && this.pageParam.editData.other_host_id){
      var split:string[] = this.pageParam.editData.other_host_id.split(";");
      split.forEach((data)=>{

        this.addAnotherHost(data)
      });
    }

// Return today's date and time
    var currentTime = new Date()
    currentTime.setDate(currentTime.getDate() + 60);


    var min = BaseForm.getCurrentDate();
    var max = currentTime.toISOString();
    console.log('maxTime', max);

    var visitationDate: BaseForm = new BaseForm("Visitation Date", "visitation_date");
    visitationDate.setInputTypeDate({min: min, max: max,});
    if (this.pageParam.editData.visitation_date && this.pageParam.editData.visitation_date != "" && this.pageParam.editData.visitation_date != null) {
      visitationDate.setDateAdvance1Day("" + this.pageParam.editData.visitation_date);
    }
    // var untilDate = new BaseForm("Until Date", "until_date");
    // untilDate.setInputTypeDate({min: min, max: max})
    // // untilDate.value          = visitationDate.value;
    // // untilDate.rules.required = false;
    //
    // visitationDate.changeListener.subscribe((model: BaseForm) => {
    //   // untilDate.value = model.value
    //   untilDate.value = ""
    //   untilDate.setInputTypeDate({min: model.value, max: max})
    // });


    var visitationTime: BaseForm = new BaseForm("Visitation Time (hh:mm)", "visitation_time");
    // visitationTime.setInputTypeDate({displayFormat: "HH:mm"});
    visitationTime.setInputTypeTime();
    // visitationTime.value = this.pageParam.editData.visitation_time || visitationTime.setDateTimezone(8);
    visitationTime.value = this.pageParam.editData.visitation_time || "";

    visitationTime.changeListener.subscribe((model: BaseForm) => {
      console.log('visitationTime', model.value);

    })
    var purpose: BaseForm = new BaseForm("Purpose", 'purpose_id');
    // purpose.setInputTypeSelect([{key:"Visitation",value:'1'},{key:"Control",value:"2"}]);
    purpose.setInputTypeSelectChain(this.apiProvider.getSelectOptionsVisitation(this.userProvider), ((data: object[]) => {
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
    purpose.value = "" + (this.pageParam.editData.purpose_id || "");

    var purposeSpecify: BaseForm    = new BaseForm("Purpose Specify", "purpose_specify");
    purposeSpecify.isHidden         = true;
    purposeSpecify.rules.isRequired = false;
    purposeSpecify.value            = this.pageParam.editData.purpose_specify || purpose.value || "";

    var destination: BaseForm = new BaseForm("Destination", 'destination_id');
    // destination.setInputTypeSelect([{key:"Factory",value:'1'},{key:"Market",value:"2"}]);
    destination.setInputTypeSelectChain(this.apiProvider.getSelectOptionsVisitation(this.userProvider), ((data: object[]) => {

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
    destination.value                   = "" + (this.pageParam.editData.destination_id || "");
    var destinationSpecify              = new BaseForm("Destination Specify", "destination_specify");
    destinationSpecify.isHidden         = true;
    destinationSpecify.rules.isRequired = false;
    destinationSpecify.value            = this.pageParam.editData.destination_specify || "";

    // destinationSpecify.value = destination.value

    this.visitationDetailForm = {
      title: "Visitation Detail",
      isOpen: false,
      baseForms: [visitationDate, visitationTime, purpose, destination, destinationSpecify],
      isHidden: false
    };

    var remark: BaseForm    = new BaseForm("Remark", "remark");
    remark.rules.isRequired = false;
    remark.value            = this.pageParam.editData.remark || "";
    this.additionalForm     = {
      title: "Additional Information",
      isOpen: false,
      baseForms: [remark],
      isHidden: false
    }

    // setTimeout(()=>{
    //   this.pageParam.isEditInitialize = false;
    //
    // },4000);
  }

  setupIdentityForm() {

  }

  filterChanged() {
    // console.log(this.filter);
    // this.visitationData   = [];
    // // this.infiniteScroll.enable(true);
    // this.isInfiniteEnable = true;
    // this.getVisitation();

  }

  getVisitation(page = 1): Promise<any> {
    this.visitationData   = [];
    this.isInfiniteEnable = true;

    console.log('getVisitation', this.pageParam);
    if (this.pageParam.isApprover) {
      return this.apiProvider.getApprovalVisitationContainer(this.filter, page, this.userProvider.userSession).then((data: VisitationDataApiInterface) => {
        this.visitationData.push(data);

        return Promise.resolve(true);
      }).catch()
    } else {
      return this.apiProvider.getVisitationContainer(this.filter, this.userProvider.userSession, false, page).then((data: VisitationDataApiInterface) => {
        // console.log(data);
        this.visitationData.push(data);
        return Promise.resolve(true);
      }).catch();
    }

  }

  ionSegmentChange() {
    if (this.segmentValue == 'list') {
      this.visitationData = [];
      this.getVisitation();
    } else {
      if(this.userProvider.userSession.isFnFReady){
        this.setUpForms();
      }
    }
  }

  popUp(ev) {
    this.navCtrl.push(SearchBarPage, {})
  }

  public getYearRange() {
    var currentYear    = new Date().getFullYear();
    var year: string[] = [];
    for (var i = 1; i >= 0; i--) {
      year.push('' + (<number>currentYear - i))
    }
    return year;
  }

  public submitForm() {
    console.log('submit form', this.formValues);
    this.formValues['outsider_specify'] = this.formValues['outsider_specify'] || "";
    // this.formValues['visitor_no']       = this.formValues['visitor_id'];
    this.formValues['act']              = this.pageParam.isEditing ? 'edit' : 'add';
    this.formValues['tid']              = this.pageParam.editTid;

    if (!this.formValues['vehicle_no'] || this.formValues['vehicle_no'] == '') {
      this.formValues['vehicle_info'] = 'f';
    }

    if (!this.formValues["visitor_id"] || this.formValues["visitor_id"] == "") {
      this.formValues['visitor_id'] = "-";
    }
    this.formValues['requisition_type'] = "appointment"
    this.formValues['emp_id']           = this.userProvider.userSession.empId;
    var message: string                 = "";

    if (this.pageParam.isEditing) {
    }



    this.showConfirmAlert("submit",()=>{
      this.apiProvider.submitVisitationAplyForm(this.formValues, "s/VisitationApplication_op").then((data) => {
        console.log('submit form response', data);

        message                = data["message"]
        var isSuccess: boolean = data["success"];
        if (isSuccess) {
          this.ngForms.forEach((currentForm: NgForm) => {
            this.setUpForms();
          })
          setTimeout(() => {
            // this.segmentValue = "list";

            var callback = ()=>{

            }
            if (this.pageParam.isEditing) {
              callback = ()=>{
                this.navCtrl.pop(); //# detailpage->list page->

              }
            } else {
            }
            this.navCtrl.pop({}, callback);

          }, 300)
        }

      }).catch(rejected => {
        message = rejected["message"]
        console.log('submit rejected', rejected);
      }).finally(() => {
        this.apiProvider.dismissLoader();
        this.apiProvider.presentToast(message)

      })
    })



  }

  private resetWhenEdit() {

    if (this.pageParam.isEditing) {
      for (var key in this.pageParam.editData) {
        this.formValues[key] = "";

      }
      console.log("resetWhenEdit", this.formValues);
    }
  }

  public addAnotherHost(value:string){

    if(value == ""){
      return;
    }
    var hostForm: BaseForm     = new BaseForm("Extra Host", `extraHost[${this.extraHost.length}]`);
    hostForm.value = value;
    hostForm.rules.isRequired  = false;
    hostForm.buttonRight.isHidden = false;
    hostForm.buttonRight.label = "Detail";
    hostForm.isReadOnly = true;
    //#showing info
    hostForm.buttonRight.clickListener.subscribe((data: BaseForm) => {

      //#showing info
      var alert: Alert = this.alertController.create({
        title: "Host detail",
        message: "Loading",
        buttons: [
          {
            text: "Cancel",

          }, {
            //# showing confirmation
            text: "Remove",
            handler: () => {

              this.showConfirmAlert("continue",()=>{
                hostForm.value = "";
                hostForm.isDisabled = true;
                hostForm.isHidden   = true;
                var index = this.hostForm.baseForms.indexOf(hostForm);
                this.hostForm.baseForms.splice(index,1);
                console.log('remove',this.hostForm);
              })



            },

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
        this.apiProvider.presentToast("error");


      }).finally(() => {
        this.apiProvider.dismissLoader()
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
    this.hostForm.baseForms.push(hostForm);



  }


  public showConfirmAlert(message:string, handler:()=>void):Alert{
    var alert:Alert = this.alertController.create({
      title:"Confirmation",
      message: `Are you sure to ${message}?`,
      buttons:[
        {text:"no",role:"cancel"},
        {
          text:"yes",
          handler:handler
        }
      ]
    })
    alert.present();
    return alert;
  }

  private convertIdFormat(){
    var bankOtherHostId:string[] = [];// # cek if exist for uniqe
    var counterGetId:number = 0;//counter if ready
    var otherHostId = "" ;

    for(var key in this.hostForm.baseForms){
      var currentBaseForm:BaseForm = this.hostForm.baseForms[key];
      if(currentBaseForm.name.match(/.*extraHost.*/)) {
        // this.formValues["other_host_id"] += `${currentBaseForm.value}`;
        this.formValues['add_other_host'] = 't';
        if(currentBaseForm.value !== ''
          && bankOtherHostId.indexOf(currentBaseForm.value) < 0
        ){
          //
          bankOtherHostId.push("" + currentBaseForm.value);
          this.apiProvider.getEmployeeInformation(currentBaseForm.value).then((data:EmployeeInformationInterface)=>{
            otherHostId += `${data.emp_id};`;
            console.log('convertIdFormat', bankOtherHostId, counterGetId, otherHostId, )
            counterGetId++;
            // this.formValues[key] = "";
            if(counterGetId == bankOtherHostId.length){
              this.formValues["other_host_id"] = otherHostId;
              console.log('convertIdFormatdone', this.formValues["other_host_id"]);
            }
          }).catch((error)=>{
            this.apiProvider.presentToast("" + error);
          })


        }
      }

    }
  }

  public newApply(){
    var params:VisitationApplicationParam = {isApprover:false, title:"Visitation Application",isProvider:true,isApply:true}
    this.navCtrl.push(VisitationApplicationPage,params);
  }

  public getStatusColor(status:string):string{
    console.log('getStatusColor',status);
    // Submitted - Black
    // Pending Approval - red FF0000
    // Approved - green 449D44
    // Rejected - Oren F79A03
    // In - blue 0000FF
    // Out - Dark Grey 8A8A8A
    // Cancelled - Dark Grey 8A8A8A
    // Expired - Dark Grey 8A8A8A
    // Pending Acknowledge - Red FF0000
    // Acknowledge - Green 449D44
    // Pending Update - Red FF0000

    var color = "";
    switch(status.toLowerCase()){
      case "submitted":
        color = "#000000";
      case "approved":
      case "acknowledge":
        color = "#449D44";
      case "rejected":
        color = "#F79A03";
      case "in":
        color = "#0000FF";
      case "out":
      case "cancelled":
        color = "8A8A8A";

      default:
        color = "#000000";

    }

    if(status.toLowerCase().indexOf("pending")){
      color = "#FF0000";
    }
    // color = "#FF0000";


    // return `color: ${color};`;
    return color;


  }
}


interface PageForm {
  title: string,
  isOpen: boolean,
  baseForms: BaseForm[]
  isHidden: boolean
}

export interface VisitationApplicationParam {
  isApprover?: boolean;
  title?: string;
  isEditing?: boolean;
  editData?: any;
  editTid?: string;
  isProvider?: boolean;
  isEditInitialize?:boolean;
  isApply?:boolean;
}
