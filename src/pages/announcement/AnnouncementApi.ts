export interface AnnouncementListInterface{

adate_from:string;
adate_to:string;
data?:AnnouncementListDataInterface[];
sql:string;
success:boolean;
total: number;
userid:string;

}


export interface AnnouncementListDataInterface{
  chkred: number;
  content:string;
  description: string;
  id:string;
  postdate:string;
  sortcont:string;
  subject:string;
  isOpen:boolean;
}
