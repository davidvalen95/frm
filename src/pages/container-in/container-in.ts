import {Component, ViewChild} from '@angular/core';
import {AlertController, Content, InfiniteScroll, IonicPage, NavController, NavParams, Slides} from 'ionic-angular';
import {
  ApiProvider, EmployeeInformationInterface, VisitationDataApiInterface, VisitationDataRecordsInterface,
  VisitationFilterApi
} from "../../providers/api/api";
import {UserProvider} from "../../providers/user/user";
import {NgForm, NgModel} from "@angular/forms";
import {BaseForm, InputType, KeyValue, LabelType} from "../../components/Forms/base-form";
import {SearchBarPage} from "../search-bar/search-bar";
import {VisitationDetailPageParam, VisitationDetailPage} from "../visitation-detail/visitation-detail";
import {HttpParams} from "@angular/common/http";
import {RootParamsProvider} from "../../providers/root-params/root-params";

/**
 * Generated class for the ContainerInPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-container-in',
  templateUrl: 'container-in.html',
})
export class ContainerInPage {



  public visitationData: VisitationDataApiInterface[] = [];


  public segmentValue: string        = "containerIn";
  public formSlides: Slides;
  public filter: VisitationFilterApi = new VisitationFilterApi();
  public isInfiniteEnable: boolean   = true;
  public statusKeyValue:KeyValue[] = [
    {key:"Pending Approval", value:"PA"},
    {key:"Approved", value:"AP"},
    {key:"Rejected", value:"RE"},
    {key:"Canceled", value:"CA"},
    {key:"In", value:"in"},
    {key:"Out", value:"out"},
    {key:"Expired", value:"expired"},
    ]
  public containerInDetailForm:PageForm;
  public exportCargoForm:PageForm;
  public importCargoForm:PageForm;
  public additionalForm:PageForm;
  public hostForm: PageForm;
  public isNeedHost: boolean         = true;
  public ngForms:NgForm[] = [];
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

  public dataList:DataList[] = [];
  public formValues: object        = {};
  public categoryCountryRules: any = {}
  constructor(public navCtrl: NavController, public alertController:AlertController, public navParams: NavParams, public apiProvider:ApiProvider, public userProvider:UserProvider, public rootParam:RootParamsProvider) {
    this.dataList.push({
      theCase:"containerIn",
      isInfiniteEnable:true,
      visitationData:[],
      filter:new VisitationFilterApi(),
    },{
      theCase:"containerOut",
      isInfiniteEnable:true,
      visitationData:[],
      filter: new VisitationFilterApi(),
    })

    this.dataList.forEach((currentList)=>{
      this.getVisitation(1,currentList,true);
    })

    this.setUpForms();


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
      this.ngForms.push(form);


      if (this.formSlides.isEnd()) {
        console.log('submit form', this.formValues);
        this.formValues['outsider_specify'] = ""
        this.formValues['visitor_no']       = this.formValues['visitor_id'];

        var message: string = "";

        this.apiProvider.submitVisitationAplyForm(this.formValues, "s/VisitationApplication_op").then((data) => {
          console.log('submit form response', data);

          message                = data["message"]
          var isSuccess: boolean = data["success"];
          if (isSuccess) {
            this.ngForms.forEach((currentForm:NgForm)=>{
              currentForm.resetForm();
              currentForm.reset();
            })
            setTimeout(() => {
              this.segmentValue = "containerIn";
            }, 1000)
          }

        }).catch(rejected => {
          message = rejected["message"]
          console.log('submit rejected', rejected);
        }).finally(() => {
          this.apiProvider.presentToast(message)

        })
      }
      this.slideNext();


    }
    else {
      this.alert("Field(s) is not valid");
    }


  }

  doInfinite(infinite: InfiniteScroll,currentList:DataList) {
    if (currentList.visitationData.length >= (currentList.visitationData[0].maxpage)) {
      // infinite.enable(false);
      currentList.isInfiniteEnable = false

    } else {
      // infinite.enable(true);

      currentList.isInfiniteEnable = true;
      console.log('doinfinited',currentList);
      this.getVisitation(currentList.visitationData.length + 1,currentList).then(data => {
        if (data) {
          infinite.complete();
        }
      });
    }


  }


  ionViewDidLoad() {
  }

  pushVisitationDetail(visitationData: VisitationDataRecordsInterface) {

    var param: VisitationDetailPageParam = {visitationData: visitationData,title:"Container In",
    actionOnPop:()=>{

    }
    }
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
    this.formValues["emp_id"]               = this.userProvider.userSession.empId;
    this.formValues["group_by"]             = "container";
    this.formValues["is_contract"]          = false;
    this.formValues["need_host"]            = true;
    this.formValues["purpose_setup"]        = false;
    this.formValues["check_max_companion"]  = false;
    this.formValues["max_companion"]        = 0;
    this.formValues["requisition_type"]     = "container";
    this.formValues["ct_id"]                = this.userProvider.userSession.ct_id;
    this.formValues["specifyPurpose"]       = false;
    this.formValues["destination_setup"]    = false;
    this.formValues["purpose_specify"]      = "";
    this.formValues["specifyDestination"]   = false;
    this.formValues["act"]                  = "add";
    this.formValues["tid"]                  = -1;
    this.formValues["outsider_specify"]     = ""
    this.formValues["emp_name"]             = this.userProvider.userSession.name;
    this.formValues["dept_name"]            = this.userProvider.userSession.dept_id;
    this.formValues["visitorcategory_code"] = "CONT"

    var visitationDateFrom = new BaseForm("Visitation Date From", "visitation_date");
    visitationDateFrom.setInputTypeDate({min: BaseForm.getCurrentDate(),max:BaseForm.getAdvanceDate(720).toISOString(), displayFormat: "DD MMM YYYY"});
    var visitationDateTo = new BaseForm("Until","until_date")
    visitationDateTo.setInputTypeDate({});
    visitationDateFrom.changeListener.subscribe((model:BaseForm)=>{

      if(model.value == "" || model.value == null){
        return
      }
      var checkDate = new Date(model.value)
      console.log('time',model.value);

      // visitationDateTo.setInputTypeDate({min:model.value,max:(BaseForm.getAdvanceDate(60,new Date(model.value)))})
      visitationDateTo.value = ""
      visitationDateTo.setInputTypeDate({min: model.value, max: BaseForm.getAdvanceDate(60,new Date(model.value)).toISOString()})
    })
    var visitationTime:BaseForm = new BaseForm("Visitation Time","visitation_time");
    visitationTime.setInputTypeTime();
    visitationTime.setDateTimezone(8);

    var deliveryType:BaseForm = new BaseForm("Delivery Type","delivery_type");
    deliveryType.setInputTypeSelect([{key:"Export Cargo",value:"export"},{key:"Import Cargo",value:"import"}]);


    this.containerInDetailForm = {
      title: "Container In Detail",
      isHidden: false,
      isOpen: false,
      baseForms: [visitationDateFrom,visitationDateTo,visitationTime,deliveryType]
    }


    var containerNo:BaseForm = new BaseForm("Container No","visitor_id");
    containerNo.setRulesPatternNumberOnly();

    var containerSize:BaseForm = new BaseForm("Container Size","container_size");
    containerSize.setInputTypeSelect([{key:"40'HC",value:"40hc"},{key:"40'GP",value:"40gp"},{key:"20'GP",value:"20gp"}]);

    var containerName:BaseForm = new BaseForm("Container Name", "visitor_name");
    var transportationCompany:BaseForm = new BaseForm("Transportation Company","outsider_code");
    transportationCompany.setInputTypeSelect([{key:"United Arab Shipping Company",value:"CM002"},{key:"Multimodal Freight Sdn Bhd", value:"CM003"}])

    var portName: BaseForm = new BaseForm("Port Name","port_name");



    this.exportCargoForm = {
      title: "Export Cargo Information",
      isHidden: true,
      isOpen: false,
      baseForms:[containerNo, containerSize, containerName, transportationCompany, portName]
    }

    var containerSealNo:BaseForm = new BaseForm("Container Seal No", "container_sealno");

    this.importCargoForm = {
      title: "Import Cargo Information",
      isHidden: false,
      isOpen: false,
      baseForms:[containerSize, containerName, containerNo,containerSealNo]
    }
    deliveryType.changeListener.subscribe((model:BaseForm)=>{
      if(model.value.toLowerCase() == 'export'){
        this.exportCargoForm.isHidden = false;
        this.importCargoForm.isHidden = true;
      }else{
        this.exportCargoForm.isHidden = true;
        this.importCargoForm.isHidden = false;
      }
    })


    var hostType: BaseForm = new BaseForm("Host Type", "host_type");
    hostType.inputType     = InputType.select;
    hostType.selectOptions = [{
      key: "I am the host",
      value: 'true'
    }, {key: "Other as the host", value: 'false'}];


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

    var hostId: BaseForm            = new BaseForm("Employee ID", "host_id");
    hostId.labelType                = LabelType.inline;
    hostId.isReadOnly               = true;
    var hostName: BaseForm          = new BaseForm("Employee name", "host_name");
    hostName.labelType              = LabelType.inline;
    hostName.isReadOnly             = true;
    hostName.isHidden               = true;
    hostName.rules.isRequired       = false;
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
      hostName.isHidden = hostIdSearch.isHidden = hostDepartment.isHidden = hostSection.isHidden = true;
      hostId.value = "";
      if (model.value === 'true') {
        //#emp id is the host
        hostId.value = this.userProvider.userSession.empId;
        console.log('enter here ');

      } else if (model.value === 'false') {
        //# search']
        console.log('enter here lse');
        hostIdSearch.isHidden = false;
        hostName.isHidden     = hostIdSearch.isHidden = hostDepartment.isHidden = hostSection.isHidden = false;

      }

    });

    hostIdSearch.changeListener.subscribe((model: BaseForm) => {
      this.apiProvider.getEmployeeInformation(model.value, true).then((serverResponse: EmployeeInformationInterface) => {
        hostId.value         = serverResponse.emp_id;
        hostName.value       = serverResponse.emp_name;
        hostDepartment.value = serverResponse.dept_name;
        hostSection.value    = serverResponse.sec_name;
      }).catch((rejected) => {
        console.log(rejected);
        this.apiProvider.presentToast("error");


      }).finally(() => {
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


    var remark:BaseForm     = new BaseForm("Remark", "remark");
    remark.rules.isRequired = false;

    this.additionalForm = {
      title: "Additional Form",
      isOpen: false,
      isHidden: false,
      baseForms:[remark]
    }

  }



  setupIdentityForm() {

  }

  filterChanged(currentList:DataList) {
    console.log("filterChanged",currentList.filter);
    currentList.visitationData   = [];
    // this.infiniteScroll.enable(true);
    currentList.isInfiniteEnable = true;
    this.getVisitation(1,currentList, true);

  }

  getVisitation(page = 1, currentList:DataList = null, isInitiate:boolean = false): Promise<any> {
    var promise:Promise<any>
    if(currentList.theCase=='containerIn'){
        promise = this.apiProvider.getVisitationContainer( currentList.filter, this.userProvider.userSession, true, page).then((data: VisitationDataApiInterface) => {
        if(isInitiate){
          currentList.visitationData = [];
        }
        console.log('cnotainertrue', data);
        currentList.visitationData.push(data);
        return Promise.resolve(true);
      }).catch((rejected)=>{
          console.log(rejected);
        });

    }

    if( currentList.theCase =='containerOut'){
      promise = this.apiProvider.getVisitationContainer( currentList.filter,this.userProvider.userSession,true,page,true).then((data:VisitationDataApiInterface)=>{
        if(isInitiate){
          currentList.visitationData = [];
        }
        currentList.visitationData.push(data);
        console.log('containerOut',currentList);
;        return Promise.resolve(true);
      }).catch((rejected)=>{
        console.log(rejected);
      });;


    }



    if(currentList !=null){
      return promise;
    }



  }

  ionSegmentChange() {
    if (this.segmentValue == 'containerIn' || this.segmentValue == "containerOut") {


      this.dataList.forEach((currentList)=>{
        this.getVisitation(1,currentList,true);
      })
    } else {

    }
  }
  public  getYearRange(){
    var currentYear =  new Date().getFullYear();
    var year:string[] = [];
    for(var i = 5 ; i>=0 ; i--){
      year.push('' + (<number>currentYear - i))
    }
    return year;
  }

}


interface PageForm {
  title: string,
  isOpen: boolean,
  baseForms: BaseForm[]
  isHidden: boolean
}

interface DataList{
  theCase:string;
  filter:VisitationFilterApi;
  visitationData:VisitationDataApiInterface[];
  isInfiniteEnable:boolean;
}
