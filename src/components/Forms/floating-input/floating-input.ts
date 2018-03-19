import {
  ChangeDetectorRef,
  Component, ElementRef, Injectable, Input, ViewChild
} from '@angular/core';
import {BaseForm, InputType, LabelType} from "../base-form";
import {NgForm, NgModel, ValidationErrors} from "@angular/forms";
import {DateTime, Label, ModalController, NavController} from "ionic-angular";
import {SearchBarParam, SearchBarPage} from "../../../pages/search-bar/search-bar";
import {isDefined} from "ionic-angular/util/util";
import {DatePickerProvider} from "ionic2-date-picker";
import {CalenderPage, CalenderParamInterface} from "../../../pages/calender/calender";

/**
 * Generated class for the FloatingInputComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'floating-input',
  templateUrl: 'floating-input.html'
})
@Injectable()
export class FloatingInputComponent {

  @Input() public baseForm:BaseForm ;
  @Input() public parentForm: NgForm ;

  // public model:NgModel;
  // @ViewChild('model') public set content(content:NgModel){
  //   this.model = model;
  //   this.parentForm.addControl(this.model);
  //
  // };

  @ViewChild('ionInputModel') public ionInputModel:NgModel;
  @ViewChild('ionSelectModel') public ionSelectModel:NgModel;
  @ViewChild('ionDateModel')  public ionDateModel:NgModel;
  @ViewChild('ionTextareaModel')  public ionTextareaModel:NgModel;
  @ViewChild('fileModel')  public fileModel:NgModel;
  @ViewChild('ionRadioModel')  public ionRadioModel:NgModel;
  public finalModel:NgModel;
  public inputType;
  public labelType;
  public allowedBroadcast;
  constructor(public navController:NavController, public datePickerProvider:DatePickerProvider,public modalController: ModalController) {
    this.baseForm = null;
  }
  ngOnInit(){

  }

  ngAfterContentInit(){
    if(this.baseForm){
      this.baseForm.changeListener.subscribe(((model:BaseForm)=>{
        // this.parentForm.tes.setDirty()
        if(this.baseForm.inputType == InputType.number){
          console.log('listenerNumber val:', model.value, 'baseform: ', this.baseForm);
          if(this.baseForm.rules.max < Number(model.value)){
            // console.log('listenerNumber catch error max', this.baseForm.rules.max, Number(model.value ))
            this.parentForm.getControl(this.finalModel).setErrors(["max"])

          }
          if(this.baseForm.rules.min > Number(model.value)){
            this.parentForm.getControl(this.finalModel).setErrors(["min"])

          }
        }

      }))
      switch(this.baseForm.inputType){
        case InputType.text:
        case InputType.password:
        case InputType.email:
        case InputType.number:
          this.finalModel = this.ionInputModel;
          this.allowedBroadcast = "ioninput";
          break;
        case InputType.select:
          this.finalModel = this.ionSelectModel;
          this.allowedBroadcast = "ionselect";
          break;
        case InputType.date:
        case InputType.datetime:
          this.finalModel = this.ionDateModel;
          this.allowedBroadcast = "iondatetime";
          break;
        case InputType.textarea:
          this.finalModel = this.ionTextareaModel;
          this.allowedBroadcast = "iontextarea";
          break;
        case InputType.file:
          this.finalModel = this.fileModel;
          break;
        case InputType.radio:
          this.finalModel = this.ionRadioModel;
          this.allowedBroadcast = "ionradio";

          break;
      }
      this.parentForm.addControl(this.finalModel);
      this.inputType = InputType[this.baseForm.inputType];
      this.labelType = LabelType[this.baseForm.labelType];




    }


    // this.baseForm.isHidden = false;
  }
  debug(){
    console.log('debug');
  }

  onFieldClicked(model){
    console.log('onFieldClicked');
    if(this.baseForm.isSearchBar){
      var param:SearchBarParam = {
        baseForm: this.baseForm
      }
      console.log('onFieldClicked');
      this.navController.push(SearchBarPage, param)

    }


    if(this.baseForm.inputType == InputType.date){
      // this.showCalendar();
      this.showCalendarPage();
    }
    this.baseForm.inputClickListener.next(model);
  }


  public broadcast(origin){

    // console.log('broadcastION',origin,this.allowedBroadcast,this.baseForm.name ,this.baseForm.value);
    if(origin == this.allowedBroadcast){
      this.baseForm.broadcastIonChange(origin);
    }


  }


  public showCalendarPage(){

    BaseForm.closeDatetimeIonicPicker();


    setTimeout(()=>{
      var param:CalenderParamInterface = {
        isApproval: false,
        pickerSetting: {
          baseForm: this.baseForm,
          onActivityResult:(date:Date)=>{
            if(date){
              this.baseForm.value = date.toISOString();

            }

          }
        }
      }

      // var calenderModal = this.modalController.create(CalenderPage,param,{ showBackdrop: false, enableBackdropDismiss:false });
      // calenderModal.onDidDismiss(()=>{
      //   setTimeout(()=>{
      //     this.baseForm.closeDatetimeIonicPicker();
      //   },25);
      // })
      // calenderModal.present();
      console.log('showCalenderPage', param);
      this.navController.push(CalenderPage,param);
    },200);




  }


  showCalendar() {
    const dateSelected =
            this.datePickerProvider.showCalendar(this.modalController,{});

    // this.datePickerProvider.



    dateSelected.subscribe(data =>{
      console.log("first date picker: date selected is", data);
      var correctDate = BaseForm.getAdvanceDate(1, data);


      this.baseForm.value = correctDate.toISOString();
      // this.baseForm.value = "test";
      console.log("Correct date", correctDate,this.baseForm);


    })

  }

}
