import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileInformationPage } from './profile-information';

@NgModule({
  declarations: [
    ProfileInformationPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileInformationPage),
  ],
})
export class ProfileInformationPageModule {}
