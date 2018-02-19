import {Component, Injectable, Input} from '@angular/core';
import {NgModel} from "@angular/forms";
import {BaseForm} from "../base-form";
import {isNumber} from "ionic-angular/util/util";

/**
 * Generated class for the FormErrorMessageComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'form-error-message',
  template: `<p class="error-message" *ngFor="let message of getErrorMessages()">{{message}}</p>`
})

export class FormErrorMessageComponent {


  @Input('model') public model: NgModel;
  @Input('baseForm') public baseForm: BaseForm;
  private errorMessages: object = {
    required: (param) => `${this.baseForm.label} cannot be empty`,
    minlength: (param) => `${this.baseForm.label} require ${param.requiredLength} characters`,
    maxlength: (param) => `${this.baseForm.label} exceed maximum characters`,
    pattern: (param) => `${this.baseForm.label} ${this.baseForm.rules.patternInformation || 'not satisfy input requirement'}`,
    max:()=>`${this.baseForm.label} exceed limited value (${this.baseForm.rules.max})`,
    min:()=>`${this.baseForm.label} must greater than minimum value (${this.baseForm.rules.min})`,
  }

  constructor() {
  }

  getErrorMessages(): string[] {
    var errors: string[] = [];
    for (var key in this.model.errors) {
      var message: string = "";
      if (!isNaN(Number(key))) {
        message = this.errorMessages[this.model.errors[key]]()
      } else {

        message = this.errorMessages[key](this.model.errors[key])
      }

      errors.push(message);
    }
    return errors;
  }


}
