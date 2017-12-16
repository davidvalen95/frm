import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {
  ApiProvider, VisitationDataApiInterface, VisitationDataDetailInterface,
  VisitationDataRecordsInterface
} from "../../providers/api/api";
import {UserProvider} from "../../providers/user/user";
import {KeyValue} from "../../components/Forms/base-form";

/**
 * Generated class for the VisitationDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-visitation-detail',
  templateUrl: 'visitation-detail.html',
})
export class VisitationDetailPage {

  public visitationData: VisitationDataRecordsInterface;
  public visitationDetailKeyValue: KeyValue[]                  = [];
  public visitationDetailObject: VisitationDataDetailInterface = null;
  public isCanAcknowledge                                      = false;
  public title: string                                         = ""

  constructor(public navCtrl: NavController, public navParams: NavParams, public userProvider: UserProvider, public apiProvider: ApiProvider) {
    this.visitationData = navParams.get("visitationData");
    this.title = navParams.get("title");
    this.getVisitationDetail();


    // acknowledgement && visitation_status.equals("in") && !acknowledged && isHost && status.equals("AP")
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VisitationDetailPage', this.navParams.get("title"));
  }

  private getVisitationDetail() {
    this.apiProvider.getVisitationDetail(this.userProvider.userSession, this.visitationData.id).then((data: any) => {
      console.log('rawvisitatildetail', data)
      var detail: VisitationDataDetailInterface = (data["data"] as VisitationDataDetailInterface)

      var visitationStatus: boolean = detail.visitation_status == null || ( detail.visitation_status.toLowerCase() !== 'in');
      var detailStatus: boolean     = detail.status == null || detail.status.toLowerCase() === 'ap'
      this.isCanAcknowledge         =
        !detail.acknowledged &&
        detail.host_id == this.userProvider.userSession.empId &&
        visitationStatus &&
        detailStatus
      ;
      console.log('boolean, ', !detail.acknowledged, detail.host_id == this.userProvider.userSession.empId, visitationStatus, detailStatus)

      this.visitationDetailObject = detail;
      return this.visitationDetailObject;

    }).then((data: VisitationDataDetailInterface) => {
      var keyValue: KeyValue[] = [];


      for (var key in data) {
        // var readableKey = key.replace(/_/g," ").toUpperCase();
        keyValue.push({key: key, value: data[key]})
      }
      keyValue.sort((a: KeyValue, b: KeyValue) => {

        if (a.key < b.key) {
          return -1
        } else {
          return 1
        }

      });

      console.log("detailData", keyValue);
      this.visitationDetailKeyValue = keyValue;

    }).catch((rejected) => {
      console.log('getvisitaitondetailrejected', rejected);
    }).finally(() => {
      this.apiProvider.dismissLoader()
    });
  }

  acknowledge(visitationDetailObject: VisitationDataDetailInterface) {

    var message: string = "";
    this.apiProvider.acknowledge(this.visitationData.id).then((data) => {
      var isSuccess: boolean = data["success"];
      if (isSuccess) {
        this.getVisitationDetail();
        this.isCanAcknowledge = false;
        message = data["message"];
      }
    }).catch((rejected) => {
      message = rejected.toString();
    }).finally(() => {
      this.apiProvider.dismissLoader();
      this.apiProvider.presentToast(message);
    })

  }
}


export interface VisitationDetailPageParam {
  visitationData: VisitationDataRecordsInterface;
  title: string;
}
