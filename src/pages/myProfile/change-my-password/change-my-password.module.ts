import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangeMyPasswordPage } from './change-my-password';

@NgModule({
  declarations: [
    ChangeMyPasswordPage,
  ],
  imports: [
    IonicPageModule.forChild(ChangeMyPasswordPage),
  ],
})
export class ChangeMyPasswordPageModule {}
