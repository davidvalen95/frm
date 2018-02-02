import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomeLeaveApplicationPage } from './home-leave-application';

@NgModule({
  declarations: [
    HomeLeaveApplicationPage,
  ],
  imports: [
    IonicPageModule.forChild(HomeLeaveApplicationPage),
  ],
})
export class HomeLeaveApplicationPageModule {}
