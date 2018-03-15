import {Directive, ElementRef, HostBinding, Renderer, Renderer2} from '@angular/core';

/**
 * Generated class for the StatusColorDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[status-color]', // Attribute selector
  host: {
    '[style.color]': "'black'",
  }
})
export class StatusColorDirective {



  public color: {} = {

    black: ['submitted'],
    red: ['lateness',
          'early leaving',
          'pending','incomplete',
    ],
    "#449D44":[//green
      'approved','acknowledge'
    ],
    "#F79A03":[//yellow
      'rejected'
    ],


  }


  @HostBinding('style.color') elementColor = 'black';

  constructor(public elementRef: ElementRef, renderer: Renderer2) {


  }

  // ngOnInit
  ngAfterContentInit() {
    setTimeout(() => {
      console.log('statusColorDirective', this.color, this.elementRef, this.color, this.elementRef.nativeElement.textContent)
      this.convertColor();
    }, 300)

  }


  public convertColor() {

    for(var key in this.color){
      var currentData:string[] = this.color[key];
      var isContain = false;
      var textContent = this.elementRef.nativeElement.textContent.toLowerCase();
      currentData.forEach(data=>{
        if(textContent.indexOf(data) >-1){
          this.elementColor = key;
        }
      })
    }


  }

}
