import { NgModule } from '@angular/core';
import { UcWordPipe } from './uc-word/uc-word';
import {isString} from "ionic-angular/util/util";
import { IfEmptyThenDashPipe } from './if-empty-then-dash/if-empty-then-dash';
import { DebugPipe } from './debug/debug';
import { KeepAsHtmlPipe } from './keep-as-html/keep-as-html';
@NgModule({
	declarations: [UcWordPipe,
    IfEmptyThenDashPipe,
    DebugPipe,
    KeepAsHtmlPipe],
	imports: [],
	exports: [UcWordPipe,
    IfEmptyThenDashPipe,
    DebugPipe,
    KeepAsHtmlPipe]
})
export class PipesModule {



}
