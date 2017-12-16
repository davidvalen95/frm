import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VisitationDetailPage } from './visitation-detail';

@NgModule({
  declarations: [
    VisitationDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(VisitationDetailPage),
  ],
})
export class VisitationDetailPageModule {}
