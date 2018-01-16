import { Component } from '@angular/core';

/**
 * Generated class for the ToggleOpenComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'toggle-open',
  templateUrl: 'toggle-open.html'
})
export class ToggleOpenComponent {

  text: string;

  constructor() {
    console.log('Hello ToggleOpenComponent Component');
    this.text = 'Hello World';
  }

}
