import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the StatusColorPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'statusColor',
})
export class StatusColorPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {




    return value.toLowerCase();
  }
}
