import {
  Component, ElementRef, Injectable, Input, ViewChild
} from '@angular/core';
import {BaseForm, InputType, LabelType} from "../base-form";
import {NgForm, NgModel, ValidationErrors} from "@angular/forms";
import {Label, NavController} from "ionic-angular";
import {ParamSearchBarPage, SearchBarPage} from "../../../pages/search-bar/search-bar";
import {isDefined} from "ionic-angular/util/util";

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
  public finalModel:NgModel;
  public inputType;
  public labelType;
  public allowedBroadcast;
  constructor(public navController:NavController) {
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
        case InputType.searchBar:
          this.finalModel = this.ionInputModel;
          this.allowedBroadcast = "ioninput";
          break;
        case InputType.select:
          this.finalModel = this.ionSelectModel;
          this.allowedBroadcast = "ionselect";
          break;
        case InputType.date:
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
      }
      this.parentForm.addControl(this.finalModel);
      this.inputType = InputType[this.baseForm.inputType];
      this.labelType = LabelType[this.baseForm.labelType];
      if(this.inputType==InputType.searchBar){
        this.inputType = "text";
        // this.isSearchBar = true;//# to disable read-only attr
      }



    }


    // this.baseForm.isHidden = false;
  }
  debug(){
    console.log('debug');
  }

  onFieldClicked(ev){
    if(this.baseForm.inputType == InputType.searchBar){
      var param:ParamSearchBarPage = {
        baseForm: this.baseForm
      }
      console.log('onFieldClicked');
      this.navController.push(SearchBarPage, param)

    }
  }


  public broadcast(origin){

    if(origin == this.allowedBroadcast){
      this.baseForm.broadcastIonChange(origin);
    }

  }

}
