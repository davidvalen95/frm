import {Component, Input} from '@angular/core';
import {KeyValue} from "../Forms/base-form";

/**
 * Generated class for the DetailKeyValueComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'detail-key-value',
  templateUrl: 'detail-key-value.html'
})
export class DetailKeyValueComponent {


  @Input() public keyValueContainer: MatureKeyValueContainer;



  constructor() {
  }

  ngOnInit(){
    console.log('detailKeyValueComponentInit',this.keyValueContainer);

  }
  ngAfterViewChecked(){
    // console.log('detailKeyValueComponentChecked',this.keyValueContainer);
  }

}


export interface MatureKeyValueContainer{
  name: string;
  isOpen:boolean;
  keyValue: KeyValue[];
}
