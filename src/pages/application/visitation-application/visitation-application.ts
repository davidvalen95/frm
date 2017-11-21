import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {BaseForm} from "../../../components/Forms/base-form";
import {NgForm} from "@angular/forms";

/**
 * Generated class for the VisitationApplicationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-visitation-application',
  templateUrl: 'visitation-application.html',
})
export class VisitationApplicationPage {


  public visitList:object[] = [
    {
      purpose: 'Training',
      status: 'Submited',
      createdDate: '01 Oct 2017',
      visitDate: '02 Oct 2017',
      visitTime: '14.30',
      isOpen: false
    },
    {
      purpose: 'User Testing',
      status: 'Pennding Approval',
      createdDate: '01 Oct 2017',
      visitDate: '02 Oct 2017',
      visitTime: '14.30',
      isOpen: false
    },
    {
      purpose: 'Implementation',
      status: 'Approved',
      createdDate: '01 Oct 2017',
      visitDate: '02 Oct 2017',
      visitTime: '14.30',
      isOpen: false
    },
  ]
  public forms:object[] = [
    {
      title: 'Visitor Information',
      isOpen:false,
      baseForms:[
        {
          name: "visitorCategory",
          label: "Visitor Category",
          type: "text",
          rules: {
            required: true
          },
        },
        {
          name: "visitorCountry",
          label: "Visitor Country",
          type: "text",
          rules: {
            required: true
          },
        }

      ]


    },


    {
      title: 'Vechile Information',
      isOpen:false,
      baseForms:[
        {
          name: "vechileType",
          label: "Vechile Type",
          type: "text",
          rules: {
            required: true,
            minlength:5,
            pattern:'[a-z]+',
            patternInformation:'Small word only'
          },
        },
        {
          name: "visitorCountry",
          label: "Visitor Country",
          type: "text",
          rules: {
            required: true
          },
        }

      ]
    },


    {
      title: 'Additional Information',
      isOpen:false,
      baseForms:[
        {
          name: "remark",
          label: "Remark",
          type: "text",
          rules: {
            required: true,
            minlength:5,
            pattern:'[0-9]+',
            patternInformation:'Number only'
          },
        },

      ]
    }


  ]

  public pet:string = "list";
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertController:AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VisitationApplicationPage');
  }

  alert(message:string){
    this.alertController.create(
      {
        subTitle:message,
        buttons:['Ok']
      }
    ).present();
  }

  formSubmit(form:NgForm){
    if(!form.valid){
      this.alert("Form is not valid")
    }

  }


}
