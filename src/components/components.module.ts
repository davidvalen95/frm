import { NgModule } from '@angular/core';
import { FloatingInputComponent } from './Forms/floating-input/floating-input';
import {IonicModule} from "ionic-angular";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { FormErrorMessageComponent } from './Forms/form-error-message/form-error-message';
import { ToggleOpenComponent } from './toggle-open/toggle-open';
@NgModule({
	declarations: [,
    FloatingInputComponent,
    FormErrorMessageComponent,
    ToggleOpenComponent,
    ],
	imports: [
    IonicModule,
    CommonModule,
    FormsModule,
  ],
	exports: [
    FloatingInputComponent,
    FormErrorMessageComponent,
    ToggleOpenComponent,
    ]
})
export class ComponentsModule {}
