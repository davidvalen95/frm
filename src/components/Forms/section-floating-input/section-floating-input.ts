import {Component, Input} from '@angular/core';
import {BaseForm} from "../base-form";
import {isDefined} from "ionic-angular/util/util";
import {NgForm} from "@angular/forms";

/**
 * Generated class for the SectionFloatingInputComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'section-floating-input',
  templateUrl: 'section-floating-input.html'
})
export class SectionFloatingInputComponent {



  @Input() container:SectionFloatingInputInterface;
  @Input() parentForm:NgForm;


  constructor() {

    if(this.container ){
      if(!isDefined(this.container.isOpen) || this.container.isOpen == null){
        this.container.isOpen = true;
      }
    }

  }



}



export interface SectionFloatingInputInterface{
  name: string;
  description?: string;
  baseForms:BaseForm[];
  isOpen?:boolean;
  isHidden?:boolean;

}
