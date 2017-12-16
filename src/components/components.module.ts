import { NgModule } from '@angular/core';
import { FloatingInputComponent } from './Forms/floating-input/floating-input';
import {IonicModule} from "ionic-angular";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { FormErrorMessageComponent } from './Forms/form-error-message/form-error-message';
import { VisitationFormComponent } from './visitation-form/visitation-form';
@NgModule({
	declarations: [,
    FloatingInputComponent,
    FormErrorMessageComponent,
    VisitationFormComponent],
	imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  ],
	exports: [
    FloatingInputComponent,
    FormErrorMessageComponent,
    VisitationFormComponent]
})
export class ComponentsModule {}
