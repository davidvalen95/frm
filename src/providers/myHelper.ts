














export class MyHelper{



  public static ucWord(target:string){
    target = target.replace(/_/g," ");
    //# replace all after space in documents
    target = target.replace(/[\s]./g, (a)=>{
      return a.toUpperCase();

    })

    target = target.replace(/^./g,(a=>{

      return a.toUpperCase()
    }))
    return target;
  }
}
