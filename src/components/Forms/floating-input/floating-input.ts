import {Component, Input, ViewChild} from '@angular/core';
import {BaseForm} from "../base-form";
import {NgForm, NgModel} from "@angular/forms";

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
export class FloatingInputComponent {

  @Input() public baseForm:BaseForm ;
  @Input() public parentForm: NgForm;
  @ViewChild('model') public model:NgModel;
  constructor() {
  }
  ngOnInit(){
    this.parentForm.addControl(this.model);
    console.log(this.model);
  }

}
