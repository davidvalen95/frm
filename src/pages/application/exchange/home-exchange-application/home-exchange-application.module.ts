import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {HomeExchangeApplicationPage} from './home-exchange-application';

@NgModule({
    declarations: [
        HomeExchangeApplicationPage,
    ],
    imports: [
        IonicPageModule.forChild(HomeExchangeApplicationPage),
    ],
})
export class HomeExchangeApplicationPageModule {}
