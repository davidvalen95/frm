import { Pipe, PipeTransform } from '@angular/core';
import {isString} from "ionic-angular/util/util";
import {MyHelper} from "../../app/MyHelper";

/**
 * Generated class for the UcWordPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'ucWord',
})
export class UcWordPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    if(isString(value)){
      return MyHelper.ucWord(value)
    }
    return value
  }
}
