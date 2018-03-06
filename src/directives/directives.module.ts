import { NgModule } from '@angular/core';
import { ArrowOpenDirective } from './arrow-open/arrow-open';
import { StatusColorDirective } from './status-color/status-color';
@NgModule({
	declarations: [ArrowOpenDirective,
    StatusColorDirective],
	imports: [],
	exports: [ArrowOpenDirective,
    StatusColorDirective]
})
export class DirectivesModule {}
