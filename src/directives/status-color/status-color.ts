import { Directive } from '@angular/core';

/**
 * Generated class for the StatusColorDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[status-color]' // Attribute selector
})
export class StatusColorDirective {

  constructor() {
    console.log('Hello StatusColorDirective Directive');
  }

}
