import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContainerInHomePage } from './container-in-home';

@NgModule({
  declarations: [
    ContainerInHomePage,
  ],
  imports: [
    IonicPageModule.forChild(ContainerInHomePage),
  ],
})
export class ContainerInHomePageModule {}
