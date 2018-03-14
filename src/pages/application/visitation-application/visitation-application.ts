import {Component, Input, ViewChild} from '@angular/core';
import {
  Alert,
  AlertController, Content, InfiniteScroll, IonicPage, Loading, Navbar, NavController, NavParams, Platform, Refresher,
  Segment,
  Slides, ToastController, ToolbarTitle
} from 'ionic-angular';
import {BaseForm, InputType, LabelType, KeyValue} from "../../../components/Forms/base-form";
import {NgForm, NgModel} from "@angular/forms";
import {
  ApiGetConfigInterface,
  ApiProvider, BadgeApiInterface, CompanyInformation, EmployeeInformationInterface, VisitationDataApiInterface,
  VisitationDataDetailInterface,
  VisitationDataRecordsInterface,
  VisitationFilterApi
} from "../../../providers/api/api";
import {UserProvider} from "../../../providers/user/user";
import {SearchBarPage} from "../../search-bar/search-bar";
import {HttpParams} from "@angular/common/http";
import {VisitationDetailPage, VisitationDetailPageParam} from "../../visitation-detail/visitation-detail";
import {BroadcastType, RootParamsProvider} from "../../../providers/root-params/root-params";
import {FileJsonFormat, MyHelper} from "../../../app/MyHelper";
import {Subscription} from "rxjs/Subscription";
import {InAppBrowser, InAppBrowserObject} from "@ionic-native/in-app-browser";
import {HelperProvider} from "../../../providers/helper/helper";
// import { InAppBrowser } from 'ionic-native';
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
  public vehicleForm: PageForm;
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

  public slidingStatus = {previous:false,next:false,position:0};
  public broadcast:Subscription = null;
  // public Setting = Setting;
  public badge:BadgeApiInterface ;
  public filterRule: VisitationFilterApi = {};

  public atachment:string[] = [];
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
  public currentAlert: Alert;

  constructor(public platform:Platform, public helperProvider:HelperProvider, public inAppBrowser:InAppBrowser, public navCtrl: NavController, public navParams: NavParams, public alertController: AlertController, public apiProvider: ApiProvider, public userProvider: UserProvider, public rootParam: RootParamsProvider, public toastController: ToastController) {

    this.setHardwareBackButton();
    console.log("visitationApplicationBadge", this.rootParam.visitationApplicationParam);






    if (this.rootParam.visitationApplicationParam.isProvider) {
      this.pageParam = this.rootParam.visitationApplicationParam
    }
    else {
      this.pageParam = navParams.data;
    }

    this.pageParam.isProvider       = false;
    this.pageParam.isEditInitialize = this.pageParam.isEditing;
    // this.resetWhenEdit();


    console.log('visitationApplicationBadge', this.pageParam, navParams.get("isApprover"));
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
        {value: '', name: 'Active'},
        {value: 'submitted', name: 'Submitted'},
        {value: 'PA', name: 'Pending Approval'},
        {value: 'AP', name: 'Approved'},
        {value: 'RE', name: 'Rejected'},
        {value: 'CA', name: 'Cancelled'},
        {value: 'in', name: 'In'},
        {value: 'out', name: 'Out'},
        {value: 'expired', name: 'Expired'}
      ];


    }

    if (!this.pageParam.isEditing) {
      if (this.pageParam.isApprover) {
        //# will trigger getList
        this.filter.cmbStatus = "PA";
        // this.getList();
        //# REPLACED WITH BROADCAST
      } else {
        // this.getList();
        this.filter.cmbStatus = "";


      }
      console.log('enter !');

      this.getVisitation();
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

    this.getFilter();






  }


  public getFilter() {

    // http://hrms.dxn2u.com:8888/hrm_test2/s/OvertimeApplication_top?mobile=true&cmd=filter&user_id=MY080127&callback=Ext.data.JsonP


    this.filter.cmbStatus = "";
    var url = `${ ApiProvider.HRM_URL }${this.pageParam.isApprover ? "s/VisitationApplication_top" : "s/VisitationApplication_top"}`;


    if(this.pageParam.isApprover){
      this.filter.cmbStatus = "PA";
      this.filter.cmbSearch = "emp_name"
    }

    var params = {
      mobile: "true",
      cmd: "filter",
      container: false,
      user_id: this.userProvider.userSession.empId,
      approval: this.pageParam.isApprover,
    }

    var config:ApiGetConfigInterface = {
      url: url,
      params: params
    }
    this.apiProvider.get<VisitationFilterApi>(config,(data:VisitationFilterApi)=>{
      this.filterRule = data;
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

  completionFormSubmit(form: NgForm,pageForm:PageForm = null) {
    console.log("completionFormSubmitDirty", form);





    if (form.valid) {


      //#check for identityEmployeeForm
      if(pageForm != null){
        if(pageForm.id && pageForm.id==2){
          // if()
          console.log('switchMobileVisitor', pageForm, form.value);

          if(form.value.mobile_no === "" && form.value.visitor_no === "") {
            // pageForm.baseForms[1].rules.isRequired = true; //#mobileNO
            // pageForm.baseForms[2].rules.isRequired = true; //# icNo visitor_no
            this.alert("<p>Please fulfill at least one of these</p><p>Mobile No OR IC No</p>", "Attention");
            return;
          }
        }
      }

      if(form.value.hostFormState){
        //# convert to id format my080127;my080123
        this.convertIdFormat();
      }




      this.content.scrollToTop();

      for (var key in form.value) {

        //# wont ovveride attachment
        if(key.indexOf("attachment") == -1){
          this.formValues[key] = form.value[key];

        }
      }
      console.log('completionFormSubmit', this.formValues);
      this.ngForms.push(form);

      if (this.formSlides.isEnd()) {
        console.log('completionFormSubmitEnd', form);

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
    if(!this.visitationData || !this.visitationData[0]){
      return;
    }
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
      var companionRemark: BaseForm    = new BaseForm("Companion Remark", "companion_remark");
      companion.rules.max              = Number(this.categoryCountryRules["max_companion"]) || 0;
      companionRemark.rules.isRequired = false;
      companionRemark.value            = this.pageParam.editData.companion_remark || "";
      console.log('companionForm', companion);


      setTimeout(()=>{
        companion.value                  = "" + (this.pageParam.editData.companion || 0);

      },300)

      companion.changeListener.subscribe((model: BaseForm) => {
        if  (model.value == "0") {
          companionRemark.rules.isRequired = false;
        } else {
          companionRemark.rules.isRequired = true;
        }
      })
      companionRemark.changeListener.subscribe((data:BaseForm)=>{
        // data.value = MyHelper.ucWord(data.value);
        data.value = data.value.toUpperCase();
      })



      var mobileNo: BaseForm = new BaseForm("Mobile No", "mobile_no");
      // mobileNo.setRulesPatternNumberOnly();
      mobileNo.rules.isRequired = false;
      mobileNo.isHidden         = false;
      // mobileNo.isReadOnly     = this.pageParam.isEditing;
      if (form.value.visitorcategory_code.toLowerCase() == 's002' || form.value.visitorcategory_code.toLowerCase() == 'staff') {
        console.log('staff');
        //# only for read only
        this.apiProvider.getEmployeeInformation(this.formValues["visitor_id"]).then((employeeInformation: EmployeeInformationInterface) => {


          this.formValues["visitor_no"] = (employeeInformation.ident_no||"") !== '' ? employeeInformation.ident_no : "-";

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
          //   birthDate.setDateAdvanceDay(birthDateValue)
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

          if(this.identityForEmployeeForm.baseForms.length == 0){
            this.identityForEmployeeForm.baseForms = [employeeIdInformation, employeeName, employeeDepartment, section, gender, companion, companionRemark, mobileNo];

          }
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

            data.value = data.value.toUpperCase();
          })
          var icNo: BaseForm = new BaseForm("IC No. / Passport No.", "visitor_no");
          // icNo.setRulesPatternNumberOnly();
          icNo.rules.isRequired = false;

          icNo.changeListener.subscribe((data: BaseForm) => {
            console.log('mo/oi icnochangelistner',data);

            // icNo.rules.isRequired = mobileNo.rules.isRequired
            setTimeout(() => {
              // mobileNo.rules.isRequired = "" + data.value == "";
              console.log("icNOTriggered")
            }, 300)


          })

          mobileNo.changeListener.subscribe((data: BaseForm) => {
            console.log('mo/oi mobilechangelistener',data);
            setTimeout(() => {
              // icNo.rules.isRequired = "" + data.value == "";

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
          birthDate.setDateAdvanceDay(birthDateValue)

          // birthDate.value =  new Date(this.pageParam.editData.visitor_birth_date).toISOString();
          if(this.identityInformationForm.baseForms.length == 0 ){
            this.identityInformationForm.baseForms = [visitorName, mobileNo, icNo, gender, birthDate, companion, companionRemark];

          }
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

  ngOnDestroy(){
    if(this.broadcast != null){
      console.log('broadcastUnsubscrive1');
      this.broadcast.unsubscribe();
      this.broadcast.remove(this.broadcast);
      this.broadcast = null;

    }
  }
  ionViewDidEnter(){//didleave


  }


  ionViewDidLeave(){//didenter

    if(this.pageParam.visitationApplicationDidLeave){
      this.pageParam.visitationApplicationDidLeave();
    }
  }

  ionViewDidLoad() {

    //#set broadcastIonChange

    console.log("visitationApplicationBoolean", this.pageParam);

    if(this.pageParam.isEditing) {


      // this.pageParam.editData

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

        if(this.formSlides.isBeginning()){
          this.leavePage();
        }


        this.slidePrevious();


      }
    }

  }

  pushVisitationDetail(visitationData: VisitationDataRecordsInterface) {

    var param: VisitationDetailPageParam = {
      visitationData: visitationData,
      title: this.pageParam.isApprover ? "Visitation Approval" : "Visitation Detail",
      isVisitation: true,
      isApprover: this.pageParam.isApprover,
      visitationDetailDidLeave: () => {
        this.getVisitation();
      }
    }
    this.navCtrl.push(VisitationDetailPage, param)
  }

  slideNext() {
    if (this.formSlides && !this.slidingStatus.next && !this.formSlides.isEnd() ) {
      console.log('slidenext');
      this.slidingStatus.next = true;
      this.formSlides.lockSwipes(false);
      this.formSlides.slideNext(100);
      this.formSlides.lockSwipes(true);
      this.slidingStatus.position++;
      setTimeout(()=>{
        this.slidingStatus.next = false;

      },400)
    }
  }

  slidePrevious() {
    if (this.formSlides && !    this.slidingStatus.previous && !this.formSlides.isBeginning()) {
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
      // visitorId.value = data.value;

      data.selectOptions.filter((keyValue:KeyValue)=>{
        if(keyValue.value == data.value){
          if(keyValue.key.toLowerCase().indexOf("other")>-1){
            outsiderSpecify.isHidden         = false;
            outsiderSpecify.rules.isRequired = true;
            outsiderSpecify.value            = this.pageParam.editData.outsider_specify || "";

          }
        }
      })

    })
    var visitorType: BaseForm = new BaseForm("Visitor Type", "visitor_type"); //# for nonFnf
    visitorType.isInitializeState = true;
    visitorType.setInputTypeSelect([{
      key: "For Own Visit", value: "own"
    }, {
      key: "For Other Visit", value: "other",
    }])
    visitorType.isHidden = this.userProvider.userSession.isFnF;

    visitorType.changeListener.subscribe((model: BaseForm) => {
      console.log('visitorTypeChangeListener',model);
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




    }, 300)

    //# get value when edit initialize
    var isVisitorCategoryClicked: boolean = false;
    visitorCategory.inputClickListener.subscribe((data: BaseForm) => {
      isVisitorCategoryClicked = true;
    })

    var visitorChangeListenerCounter:number = 0;
    visitorCategory.changeListener.subscribe((data: BaseForm) => {



      // this.alert(`"${data.value}"`, "Value");

      console.log('visitorCategoryChanged', data);
      // console.log('visitorcategorySelect', data.value, 'tes: visitorCountry.value',visitorCategory.value,'visitorId:',visitorId.value);
      // this.identityForms[0].baseForms[2].isHidden = true;
      visitorCompany.isHidden = true;

      visitorCompany.rules.isRequired = false;
      outsiderSpecify.isHidden = true;
      outsiderSpecify.rules.isRequired = false;
      // visitorCompany.value = "";
      // visitorId.inputType     = InputType.text;
      visitorId.setInputTypeText();
      visitorId.isReadOnly    = false;
      visitorId.isSearchBar   = false;
      if (isVisitorCategoryClicked) {
        visitorId.value = "";

      }
      visitorId.rules.isRequired = true;
      visitorType.isHidden       = true;
      visitorType.rules.isRequired = false;
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
          visitorType.rules.isRequired = true;
          visitorId.value               = this.pageParam.editData.visitor_id || this.userProvider.userSession.empId;
          // visitorCountry.isReadOnly     = true;
          this.formValues["visitor_ct"] = visitorCountry.value;
          visitorCountry.value          = this.userProvider.userSession.ct_id;
          console.log('visitorTypePrepare',this.pageParam.isEditing ,visitorType.isInitializeState, (this.pageParam.editData.visitor_id || ""), this.userProvider.userSession.empId);
          if (this.pageParam.isEditing && visitorType.isInitializeState) {
            console.log('visitorType', visitorType.value)
            visitorType.value   = (this.pageParam.editData.visitor_id || "") == this.userProvider.userSession.empId ? 'own' : "other";
            console.log('visitorTypeDone', visitorType.value)

            visitorType.isInitializeState = false;
          }else{
            console.log('visitorTypeDoneElse')
            visitorType.value             = "own";

          }

          visitorId.rules.isRequired = visitorType.value   == "other";



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

        if(selectOptions.length == 0){
          visitorCompany.rules.isRequired = false;
          visitorCompany.isHidden = true;
          visitorCompany.value = "";

        }
        // visitorCompany.value = "";
        //
        // setTimeout(()=>{
        //   if(visitorChangeListenerCounter < 2){
        //     visitorCompany.value            = this.pageParam.editData.outsider_code || "";
        //     visitorChangeListenerCounter ++;
        //   }
        // },300)



        visitorCompany.setInputTypeSelect(selectOptions)
        if(selectOptions.filter((keyValue)=>{
            return keyValue.value == this.pageParam.editData["outsider_code"]
          }).length > 0 && this.pageParam.isEditing){
          visitorCompany.value = this.pageParam.editData["outsider_code"];
        }else{
          visitorCompany.value = "";
        }

        //region #attachment 1

        this.additionalForm.baseForms.splice(1);


        //# for sorting
        var attachmentContainer:BaseForm[] =[]
        for(var key in data){
          //# ada attachment4 ada attachment4_desc
          if(key.indexOf("attachment")>-1 && key.indexOf("desc")==-1 && key.indexOf("require") == -1 ){

            if(data[key]){
              var currentAttachment:BaseForm = new BaseForm(data[`${key}_desc`],key);
              //# ke 4 dipisah karena optional
              var currentKey = key.slice(0,key.length);
                // currentAttachment.setInputTypeFile((event)=>{
                //   // this.formValues[currentKey] = event;
                //   this.formValues[currentKey] = event.target.files[0];
                //
                // }
              // );

              currentAttachment.setInputTypeFile(this.formValues);


              if(key.indexOf("4") >-1){
                currentAttachment.rules.isRequired = false;
              }
              if(this.helperProvider.parseBoolean(data[key])){
                attachmentContainer.push(currentAttachment);

              }
              console.log("attachment",key,data[`${key}_desc`],currentAttachment);


              // currentAttachment.fileCallback.subscribe(($event)=>{
              //   MyHelper.readFile($event.target,(result)=>{
              //     console.log('result',result);
              //   });
              // })



              currentAttachment.inputClickListener.subscribe((baseForm:BaseForm)=>{
                console.log('attachmentInputListener',baseForm);
              });
            }

          }
        }

        attachmentContainer.sort((a,b)=>{
          return a.name.localeCompare(b.name);
        })
        console.log('theAttachmentContainer',attachmentContainer);

        this.additionalForm.baseForms = this.additionalForm.baseForms.concat(attachmentContainer);

        //endregion

      });


    });

    visitorId.changeListener.subscribe((data:BaseForm)=>{
      this.identityForEmployeeForm.baseForms = [];
      this.identityInformationForm.baseForms = [];
    })


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
        if(selectOptions.length == 0){
          visitorCompany.rules.isRequired = false;
          visitorCompany.isHidden = true;
          visitorCompany.value = "";
        }

        // var isValueExist:boolean = false;
        // for(var value in selectOptions.values()){
        //   if(value == visitorCompany.value){
        //     isValueExist = true;
        //   }
        // }
        // if(!isValueExist){
        //   visitorCompany.value = "";
        // }
        //
        visitorCompany.setInputTypeSelect(selectOptions);

        //# if editint and same as editdata
        if(selectOptions.filter((keyValue)=>{
            return keyValue.value == this.pageParam.editData["outsider_code"]
          }).length > 0 && this.pageParam.isEditing){
          visitorCompany.value = this.pageParam.editData["outsider_code"];
        }else{
          visitorCompany.value = "";
        }
        // visitorCompany.value = "";
        // setTimeout(()=>{
        //   if(visitorChangeListenerCounter < 2){
        //     visitorCompany.value            = this.pageParam.editData.outsider_code || "";
        //     visitorChangeListenerCounter ++;
        //   }
        // },300)


        //region #attachment 2
        //
        this.additionalForm.baseForms.splice(1);


        //# for sorting
        var attachmentContainer:BaseForm[] =[]
        for(var key in data){
          //# ada attachment4 ada attachment4_desc
          if(key.indexOf("attachment")>-1 && key.indexOf("desc")==-1 && key.indexOf("require") == -1 ){

            if(data[key]){
              var currentAttachment:BaseForm = new BaseForm(data[`${key}_desc`],key);
              //# ke 4 dipisah karena optional
              var currentKey = key.slice(0,key.length);
              // currentAttachment.setInputTypeFile((event)=>{
              //     // this.formValues[currentKey] = event;
              //     this.formValues[currentKey] = event.target.files[0];
              //
              //   }
              // );

              currentAttachment.setInputTypeFile(this.formValues);
              if(key.indexOf("4") >-1){
                currentAttachment.rules.isRequired = false;
              }
              if(this.helperProvider.parseBoolean(data[key])){
                attachmentContainer.push(currentAttachment);

              }
              console.log("attachment",key,data[`${key}_desc`],currentAttachment);


              // currentAttachment.fileCallback.subscribe(($event)=>{
              //   MyHelper.readFile($event.target,(result)=>{
              //     console.log('result',result);
              //   });
              // })



              currentAttachment.inputClickListener.subscribe((baseForm:BaseForm)=>{
                console.log('attachmentInputListener',baseForm);
              });
            }

          }
        }

        attachmentContainer.sort((a,b)=>{
          return a.name.localeCompare(b.name);
        })
        console.log('theAttachmentContainer',attachmentContainer);

        // this.additionalForm.baseForms.concat(attachmentContainer);
        this.additionalForm.baseForms = this.additionalForm.baseForms.concat(attachmentContainer);

        //endregion


        // isVisitorCategoryAndCountryChanged = true;

      });
    });

    visitorCompany.value = "";

//

    var fnfCheckInterval = setInterval(() => {
      if(this.userProvider.userSession.isFnFReady){
        var defaultVisitorCategory = this.pageParam.editData.visitorcategory_code;

        if (!this.pageParam.isEditing) {
          defaultVisitorCategory = !this.userProvider.userSession.isFnF ? (this.rootParam.isLive ? "STAFF" : "S002") : "";
          // defaultVisitorCategory = !this.userProvider.userSession.isFnF ? "S002" : "";

        }
        visitorCategory.value = defaultVisitorCategory;
        console.log("visitorCategory", this.userProvider.userSession.isFnF, defaultVisitorCategory, visitorCategory);
        clearInterval(fnfCheckInterval);
      }


    }, 200)

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
      id:3,
    };
    this.identityInformationForm = {
      title: "Visitor Information",
      isOpen: true,
      baseForms: [],
      isHidden: false,
      id:2,
    };


    var vehicleInfo: BaseForm = new BaseForm("With Vehicle","vehicle_info");
    vehicleInfo.setInputTypeSelect([{
      key: "Yes",
      value:"t"
    },{
      key: "No",
      value:"f"
    }])




    var vehicleType: BaseForm       = new BaseForm("Vehicle Type", "vehicle_type");
    vehicleType.rules.isRequired    = false;
    vehicleType.value               = this.pageParam.editData.vehicle_type || "";
    var vehiclePlateNo: BaseForm    = new BaseForm("Vehicle Plate No", "vehicle_no");
    vehiclePlateNo.rules.isRequired = false;
    vehiclePlateNo.value            = this.pageParam.editData.vehicle_no || "";
    this.vehicleForm                = {
      title: "Vehicle Information",
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
      vehicleInfo.value = (this.pageParam.editData.vehicle_info  || false ) ? 'f' : 't';

    },500)
    var hostType: BaseForm = new BaseForm("Host Type", "host_type");
    hostType.inputType     = InputType.select;
    hostType.value = "-"


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
    // hostIdSearch.isHidden = true;

    setTimeout(()=>{
      if(this.pageParam.isEditing){
        if(hostType.value =='t'){
          hostId.value = this.pageParam.editData.host_id || "";
        }else{
          hostIdSearch.value = this.pageParam.editData.host_id || "";

        }
      }

    },3000)

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
        hostId.isHidden = ext.isHidden =false;

        hostId.value         = "";
        hostName.value       = "";
        hostDepartment.value = "";
        hostSection.value    = "";
        console.log('enter here lse');
        if (this.pageParam.isEditing) {
          // hostIdSearch.value = this.pageParam.editData.host_id || "";

        }else{
          hostIdSearch.value = "";

        }

      }

    });



    setTimeout(()=>{
      hostId.value = this.pageParam.editData.host_id || "";

    },300)
    setTimeout(() => {
      console.log('hostTypeValueTimeout', this.userProvider.userSession.isFnF);
      if (this.userProvider.userSession.isFnF) {
        var hostTypeValue = 't';
        if (this.pageParam.isEditing) {
          hostTypeValue = this.pageParam.editData.host_id == this.userProvider.userSession.empId ? 't' : 'f';
        }

        hostType.value = hostTypeValue;




      } else {
        hostType.value               = 'f';
        hostType.isHidden            = true;
        this.formValues["host_type"] = 'f';
      }


    }, 600)

    hostIdSearch.changeListener.subscribe((model: BaseForm) => {
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

        hostName.isHidden = hostDepartment.isHidden = hostSection.isHidden = false;
        hostIdSearch.value = "";
      }).catch((rejected) => {
        console.log(rejected);
        this.helperProvider.presentToast("error");


      }).finally(() => {
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


    var min = this.helperProvider.getCurrentDate();
    var max = currentTime.toISOString();
    console.log('maxTime', max);

    var visitationDate: BaseForm = new BaseForm("Visitation Date", "visitation_date");
    visitationDate.setInputTypeDate({min: null, max: max,});
    if (this.pageParam.editData.visitation_date && this.pageParam.editData.visitation_date != "" && this.pageParam.editData.visitation_date != null) {
      visitationDate.setDateAdvanceDay("" + this.pageParam.editData.visitation_date);
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
      console.log('purposeSelectChain',selectOptions);
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
    // this.getList();

  }

  doRefresh(refresher:Refresher){
    refresher.complete();
    this.getVisitation();
  }

  getVisitation(page = 1): Promise<any> {
    this.visitationData   = [];
    this.filter.filter_by = null;
    console.log('getVisitation', this.pageParam);
    if (this.pageParam.isApprover) {

      this.apiProvider.getBadgeVisitationApproval(this.userProvider.userSession).then((badge:VisitationDataApiInterface)=>{
        console.log('theBadgeApprover',badge);

        this.badge = {badgeVisitation:badge.badgeAppointmentApproval};
      }).catch(e=>{

      });


      return this.apiProvider.getApprovalVisitationContainer(this.filter, page, this.userProvider.userSession).then((data: VisitationDataApiInterface) => {
        //# get the name of ids
        // for (var key in data.records){
        //   //#detail record
        //   var currentRecord:VisitationDataRecordsInterface = data.records[key];
        //   this.apiProvider.getEmployeeInformation(currentRecord.host_id).then((data:EmployeeInformationInterface)=>{
        //     currentRecord.host_name = data.emp_name;
        //   }).catch(re=>{
        //
        //   })
        //
        //   this.apiProvider.getEmployeeInformation(currentRecord.visitor_id).then((data:EmployeeInformationInterface)=>{
        //     currentRecord.visitor_name = data.emp_name;
        //   }).catch(re=>{
        //
        //   })
        // }


        data.records.forEach((currentRecord)=>{
          currentRecord.isOpen = true;
        })


        this.visitationData.push(data);

        this.isInfiniteEnable = this.visitationData[0].maxpage > 1;


        return Promise.resolve(true);
      }).catch(rejected=>{
        console.log(rejected);
      });
    } else {

      this.apiProvider.getBadgeVisitationPendingAcknowledge(this.userProvider.userSession).then((badge:BadgeApiInterface)=>{
        console.log('theBadge',badge);

        this.badge = badge;
      }).catch(e=>{

      });



      return this.apiProvider.getVisitationContainer(this.filter, this.userProvider.userSession, false, page).then((data: VisitationDataApiInterface) => {

        //# get the name of ids
        // data.records.forEach((currentRecord:VisitationDataRecordsInterface)=>{
        //   // this.apiProvider.getEmployeeInformation(currentRecord.host_id).then((data:EmployeeInformationInterface)=>{
        //   //
        //   //   var linkCurrentRecord = currentRecord;
        //   //   console.log('visitationGetName', currentRecord);
        //   //   currentRecord.host_name = data.emp_name;
        //   // }).catch(re=>{
        //   //
        //   // })
        //
        //   this.apiProvider.getEmployeeInformation(currentRecord.visitor_id).then((data:EmployeeInformationInterface)=>{
        //     var linkCurrentRecord = currentRecord;
        //
        //     currentRecord.visitor_name = data.emp_name;
        //   }).catch(re=>{
        //
        //   })
        // })

        //
        // for (var key in data.records){
        //     console.log('visitationGetNameKey',key)
        //     var currentKey = key;
        //
        //     var currentRecord:VisitationDataRecordsInterface = data.records[currentKey];
        //     this.apiProvider.getEmployeeInformation(currentRecord.host_id).then((data:EmployeeInformationInterface)=>{
        //
        //       var linkCurrentRecord = currentRecord;
        //       console.log('visitationGetName', linkCurrentRecord);
        //       linkCurrentRecord.host_name = data.emp_name;
        //     }).catch(re=>{
        //
        //     })
        //
        //     this.apiProvider.getEmployeeInformation(currentRecord.visitor_id).then((data:EmployeeInformationInterface)=>{
        //       var linkCurrentRecord = currentRecord;
        //
        //       linkCurrentRecord.visitor_name = data.emp_name;
        //     }).catch(re=>{
        //
        //     })
        //   //#detail record
        //
        // }
        // console.log(data);
        data.records.forEach((currentRecord)=>{
          currentRecord.isOpen = true;
        })
        this.visitationData.push(data);
        this.isInfiniteEnable = this.visitationData[0].maxpage > 1;

        return Promise.resolve(true);
      }).catch(rejected=>{
        console.log(rejected);
      });
    }

  }

  ionSegmentChange() {
    if (this.segmentValue == 'list') {
      this.visitationData = [];
      this.getVisitation();
    } else {
      if(this.userProvider.userSession.isFnFReady){
        // this.setUpForms();
        this.newApply();

        setTimeout(()=>{
          this.segmentValue = 'list';

        },100);
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
    this.formValues['tid']              = this.pageParam.editTid || -1;



    // if (!this.formValues['vehicle_no'] || this.formValues['vehicle_no'] == '') {
    //   this.formValues['vehicle_info'] = 'f';
    // }
    //
    // if (!this.formValues["visitor_id"] || this.formValues["visitor_id"] == "") {
    //   this.formValues['visitor_id'] = "-";
    // }


    this.formValues['requisition_type'] = "appointment";
    console.log('submitFormVisitation1', this.formValues);
    this.formValues['emp_id']           = this.pageParam.isApply ? this.userProvider.userSession.empId : this.pageParam.editData.emp_id;
    console.log('submitFormVisitation2', this.formValues);


    var message: string                 = "";

    if (this.pageParam.isEditing) {
    }



    this.currentAlert = this.helperProvider.showConfirmAlert("submit",()=>{
      var loading = this.helperProvider.presentLoadingV2("Submiting Form");


      // s/VisitationApplication_op

      // this.apiProvider.submitVisitationAplyForm(this.formValues, `${ApiProvider.URL_PHP}/app-ionic.php?VisitationApplication_op`).then((data) => {
      // this.apiProvider.submitVisitationAplyForm(this.formValues, `${ApiProvider.URL_PHP}app-ionic-multipart.php?VisitationApplication_op`).then((data) => {
      this.apiProvider.submitVisitationAplyForm(this.formValues, `${ApiProvider.HRM_URL}s/VisitationApplication_op`).then((data) => {
      // this.apiProvider.submitVisitationAplyForm(this.formValues, `http://10.26.5.111/upload.php`).then((data) => {
      // this.apiProvider.submitVisitationAplyForm(this.formValues, `http://10.26.5.111/app-ionic-multipart.php?VisitationApplication_op`).then((data) => {
        console.log('submit form response', data);

        message                = data["message"]
        var isSuccess: boolean = data["success"];
        // isSuccess = false;
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
                this.navCtrl.pop({},()=>{

                }); //# detailpage->list page->

              }
            } else {
            }
            this.navCtrl.pop({}, callback);

          }, 300)
          this.helperProvider.presentToast(message);

        }else{
          this.alert(message,"Info");

        }

      }).catch(rejected => {
        message = rejected["message"]
        console.log('submit rejected', rejected);
        this.alert(message,"Submit Exception");

      }).finally(() => {
        loading.dismiss();

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
    var hostForm: BaseForm               = new BaseForm("Extra Host", `extraHost[${this.extraHost.length}]`);
    hostForm.value                       = value;
    hostForm.rules.isRequired            = false;
    hostForm.buttonRightSuccess.isHidden = false;
    hostForm.buttonRightSuccess.label    = "Detail";
    hostForm.isReadOnly                  = true;
    //#showing info


    hostForm.activateButtonRightDanger("X").subscribe((data:BaseForm)=>{
      this.currentAlert = this.helperProvider.showConfirmAlert("remove this host",()=>{
        hostForm.value = "";
        hostForm.isDisabled = true;
        hostForm.isHidden   = true;
        var index = this.hostForm.baseForms.indexOf(hostForm);
        this.hostForm.baseForms.splice(index,1);
        console.log('remove',this.hostForm);
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
    this.hostForm.baseForms.push(hostForm);



  }


  public showConfirmAlert(message:string, handler:()=>void):Alert{

    //#alertconfirmation
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
            this.helperProvider.presentToast("" + error);
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

    if(status.toLowerCase().indexOf("pending") >-1 ){
      color = "#FF0000";
    }

    // color = "#FF0000";


    // return `color: ${color};`;
    return color;


  }

  public leavePage() {

    this.currentAlert = this.currentAlert = this.helperProvider.showConfirmAlert("leave this page", () => {
      this.navCtrl.pop({}, () => {

      });
    })
  }


  public setHardwareBackButton(){
    this.platform.ready().then(() => {

      this.platform.registerBackButtonAction(() => {
        try{
          this.currentAlert.dismiss();          return;
        }catch(exception){
          console.log(exception);
        }
        this.leavePage();

      });
    });
  }



  public  openAttachment(name:string){
    // var browser = new InAppBrowser(url,"_blank");
    var loader:Loading = this.helperProvider.presentLoadingV2("Loading");
    this.apiProvider.getVisitationDetail(this.userProvider.userSession, this.pageParam.editTid).then((data)=>{
      var url = data["attachment1url"];
      var browser:InAppBrowserObject = this.inAppBrowser.create(`${ApiProvider.BASE_URL}${url}${name}`);
      // browser.show();
    }).catch(rejected=>{
      this.helperProvider.presentToast("Error")
    }).finally(()=>{
      loader.dismiss();
    })

  }
}


export interface PageForm {
  title: string,
  isOpen: boolean,
  baseForms: BaseForm[]
  isHidden: boolean,
  id?:number
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

  visitationApplicationDidLeave?: ()=>void;
}
