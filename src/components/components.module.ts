import { NgModule } from '@angular/core';
import { FloatingInputComponent } from './Forms/floating-input/floating-input';
import {IonicModule} from "ionic-angular";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { FormErrorMessageComponent } from './Forms/form-error-message/form-error-message';
import { ToggleOpenComponent } from './toggle-open/toggle-open';
import { DetailKeyValueComponent } from './detail-key-value/detail-key-value';
import { OpenUrlComponent } from './open-url/open-url';
import { SectionFloatingInputComponent } from './Forms/section-floating-input/section-floating-input';
import { CalenderComponent } from './calender/calender';
import { HostFormComponent } from './host-form/host-form';
@NgModule({
	declarations: [,
    FloatingInputComponent,
    FormErrorMessageComponent,
    ToggleOpenComponent,
    DetailKeyValueComponent,
    OpenUrlComponent,
    SectionFloatingInputComponent,
    CalenderComponent,
    HostFormComponent,
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
    DetailKeyValueComponent,
    OpenUrlComponent,
    SectionFloatingInputComponent,
    CalenderComponent,
    HostFormComponent,
    ]
})
export class ComponentsModule {}
