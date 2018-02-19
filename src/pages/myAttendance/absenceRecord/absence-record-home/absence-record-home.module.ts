import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AbsenceRecordHomePage } from './absence-record-home';

@NgModule({
  declarations: [
    AbsenceRecordHomePage,
  ],
  imports: [
    IonicPageModule.forChild(AbsenceRecordHomePage),
  ],
})
export class AbsenceRecordHomePageModule {}
