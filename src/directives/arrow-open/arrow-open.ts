import {Directive, ElementRef, HostListener, Input, Renderer} from '@angular/core';

/**
 * Generated class for the ArrowOpenDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[arrow-open]' // Attribute selector
})
export class ArrowOpenDirective {

  // @Input() tes;
  @HostListener('click') onClick(){
    console.log('clicked');
  }
  constructor(private elementRef:ElementRef) {
    console.log('element',this.elementRef.nativeElement);
    this.elementRef.nativeElement.innerHTML += "<ion-icon name='arrow-up'></ion-icon>"

  }


}
