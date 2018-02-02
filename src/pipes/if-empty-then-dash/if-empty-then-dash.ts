import { Pipe, PipeTransform } from '@angular/core';
import {isDefined} from "ionic-angular/util/util";

/**
 * Generated class for the IfEmptyThenDashPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'ifEmptyThenDash',
})
export class IfEmptyThenDashPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: any, ...args) {

    if(!isDefined(value) || value == null || value == ""){
      console.log("ifEmptyThenDash",value)

      return isDefined(args[0]) ? args[0] : "-";
    }else{
      return value;
    }

  }
}
