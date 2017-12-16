import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContainerInPage } from './container-in';

@NgModule({
  declarations: [
    ContainerInPage,
  ],
  imports: [
    IonicPageModule.forChild(ContainerInPage),
  ],
})
export class ContainerInPageModule {}
