import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkoutsideHomePage } from './workoutside-home';

@NgModule({
  declarations: [
    WorkoutsideHomePage,
  ],
  imports: [
    IonicPageModule.forChild(WorkoutsideHomePage),
  ],
})
export class WorkoutsideHomePageModule {}
