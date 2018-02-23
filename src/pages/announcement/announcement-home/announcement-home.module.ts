import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AnnouncementHomePage } from './announcement-home';

@NgModule({
  declarations: [
    AnnouncementHomePage,
  ],
  imports: [
    IonicPageModule.forChild(AnnouncementHomePage),
  ],
})
export class AnnouncementHomePageModule {}
