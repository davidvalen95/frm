import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

/**
 * Generated class for the KeepAsHtmlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'keepAsHtml',
})

@Injectable()
export class KeepAsHtmlPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */

  constructor(private sanitizer: DomSanitizer){

  }
  transform(value: string, ...args) {
    if(!value ){
      return "-";
    }
    return this.sanitizer.bypassSecurityTrustHtml(value);
    // return value.toLowerCase();
  }
}
