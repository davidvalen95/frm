import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IncompleteRecordHomePage } from './incomplete-record-home';

@NgModule({
  declarations: [
    IncompleteRecordHomePage,
  ],
  imports: [
    IonicPageModule.forChild(IncompleteRecordHomePage),
  ],
})
export class IncompleteRecordHomePageModule {}
