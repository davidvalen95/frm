import { NgModule } from '@angular/core';
import { UcWordPipe } from './uc-word/uc-word';
import {isString} from "ionic-angular/util/util";
import { IfEmptyThenDashPipe } from './if-empty-then-dash/if-empty-then-dash';
@NgModule({
	declarations: [UcWordPipe,
    IfEmptyThenDashPipe],
	imports: [],
	exports: [UcWordPipe,
    IfEmptyThenDashPipe]
})
export class PipesModule {



}
