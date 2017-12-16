import { NgModule } from '@angular/core';
import { UcWordPipe } from './uc-word/uc-word';
import {isString} from "ionic-angular/util/util";
@NgModule({
	declarations: [UcWordPipe],
	imports: [],
	exports: [UcWordPipe]
})
export class PipesModule {



}
