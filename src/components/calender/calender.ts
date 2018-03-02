import {Component, Injectable, Input} from '@angular/core';
import {Calendar} from "@ionic-native/calendar";
import {HelperProvider} from "../../providers/helper/helper";

/**
 * Generated class for the CalenderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'calender',
  templateUrl: 'calender.html'
})
@Injectable()
export class CalenderComponent {


  date: any = new Date();
  daysInThisMonth: any;
  daysInLastMonth: any;
  daysInNextMonth: any;
  monthNames: string[] = ["January","February","March","April","Mei","June","July","August","September","October","November","December"];
  currentMonth: any;
  currentYear: any;
  currentDate: any;

  eventList: any = [];
  selectedEvent: any;
  isSelected: any;
  color:string[]= ["#00008b", "#008b8b","#a9a9a9","#006400","#bdb76b","#8b008b","#556b2f","#ff8c00","#9932cc","#8b0000","#e9967a"]
  // darkblue: "#00008b",
  // darkcyan: "#008b8b",
  // darkgrey: "#a9a9a9",
  // darkgreen: "#006400",
  // darkkhaki: "#bdb76b",
  // darkmagenta: "#8b008b",
  // darkolivegreen: "#556b2f",
  // darkorange: "#ff8c00",
  // darkorchid: "#9932cc",
  // darkred: "#8b0000",
  // darksalmon: "#e9967a",
  // darkviolet: "#9400d3",

  @Input('calenderEvents') set setCalenderEvents(calenderEvents:CalenderEventInterface[]){

    calenderEvents.forEach((current,index)=>{
      current.color = this.color[index];
    })

    this.calenderEvents = calenderEvents;
    console.log('calenderEvent',this.targetMonth);
    this.getDaysOfMonth();
  }
  calenderEvents:CalenderEventInterface[] = [];

  @Input('targetMonth') targetMonth:number = 1;

  constructor(private calendar: Calendar, public helperProvider:HelperProvider) {


  }

  ngAfterContentInit(){

    this.getDaysOfMonth();

  }

    getDaysOfMonth() {
    this.daysInThisMonth = [];
    this.daysInLastMonth = [];
    this.daysInNextMonth = [];
    this.currentMonth    = this.monthNames[this.targetMonth];
    this.currentYear     = this.date.getFullYear();
    if (this.targetMonth === new Date().getMonth()) {
      this.currentDate = new Date().getDate();
    } else {
      this.currentDate = 999;
    }

    var firstDayThisMonth = new Date(this.date.getFullYear(), this.targetMonth, 1).getDay();
    var prevNumOfDays     = new Date(this.date.getFullYear(), this.targetMonth, 0).getDate();
    for (var i = prevNumOfDays - (firstDayThisMonth - 1); i <= prevNumOfDays; i++) {
      this.daysInLastMonth.push(i);
    }

    var thisNumOfDays = new Date(this.date.getFullYear(), this.targetMonth + 1, 0).getDate();
    for (var i = 0; i < thisNumOfDays; i++) {
      this.daysInThisMonth.push(i + 1);
    }

    var lastDayThisMonth = new Date(this.date.getFullYear(), this.targetMonth + 1, 0).getDay();
    var nextNumOfDays    = new Date(this.date.getFullYear(), this.targetMonth + 2, 0).getDate();
    for (var i = 0; i < (6 - lastDayThisMonth); i++) {
      this.daysInNextMonth.push(i + 1);
    }
    var totalDays = this.daysInLastMonth.length + this.daysInThisMonth.length + this.daysInNextMonth.length;
    if (totalDays < 36) {
      for (var i = (7 - lastDayThisMonth); i < ((7 - lastDayThisMonth) + 7); i++) {
        this.daysInNextMonth.push(i);
      }
    }

    console.log('calenderComponent',this.daysInThisMonth);
  }

  goToLastMonth() {
    this.date = new Date(this.date.getFullYear(), this.targetMonth, 0);
    this.getDaysOfMonth();
  }

  goToNextMonth() {
    this.date = new Date(this.date.getFullYear(), this.targetMonth+2, 0);
    this.getDaysOfMonth();
  }


  loadEventThisMonth() {
    this.eventList = new Array();
    var startDate = new Date(this.date.getFullYear(), this.targetMonth, 1);
    var endDate = new Date(this.date.getFullYear(), this.targetMonth+1, 0);
    this.calendar.listEventsInRange(startDate, endDate).then(
      (msg) => {
        msg.forEach(item => {
          this.eventList.push(item);
        });
      },
      (err) => {
        console.log(err);
      }
    );
  }

  checkEvent(day) {
    var hasEvent = false;
    var thisDate1 = this.date.getFullYear()+"-"+(this.targetMonth+1)+"-"+day+" 00:00:00";
    var thisDate2 = this.date.getFullYear()+"-"+(this.targetMonth+1)+"-"+day+" 23:59:59";
    this.eventList.forEach(event => {
      if(((event.startDate >= thisDate1) && (event.startDate <= thisDate2)) || ((event.endDate >= thisDate1) && (event.endDate <= thisDate2))) {
        hasEvent = true;
      }
    });
    return hasEvent;
  }

  selectDate(day) {//start at 1
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

    var currentDescription:CalenderDescriptionInterface[] = []

    this.calenderEvents.forEach((currentEvent:CalenderEventInterface)=>{
      currentDescription = currentDescription.concat(
        currentEvent.description.filter((description:CalenderDescriptionInterface)=>{
          return description.dateIndex == (day-1);
        })
      )


    })

    console.log('currentDescription',currentDescription);
    var message = "";
    currentDescription.forEach((description:CalenderDescriptionInterface)=>{
      description.text.forEach(text=>{
        message += `<p>${text}</p>`;

      })
    })


    this.helperProvider.showAlert(message,`Date: ${day}`);



  }

  deleteEvent(evt){
    this.helperProvider.showConfirmAlert("Delete event",()=>{
      this.calendar.deleteEvent(evt.title, evt.location, evt.notes, new Date(evt.startDate.replace(/\s/, 'T')), new Date(evt.endDate.replace(/\s/, 'T'))).then(
        (msg) => {
          console.log(msg);
          this.loadEventThisMonth();
          this.selectDate(new Date(evt.startDate.replace(/\s/, 'T')).getDate());
        })
    })
  }
}



export interface CalenderEventInterface{
  legend:string;
  color?:string;//#fffff

  description: CalenderDescriptionInterface[],


}
export interface CalenderDescriptionInterface{
  dateIndex:number;
  text: string[];
}
