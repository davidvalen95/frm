














export class MyHelper{





  public static ucWord(target:string){
    target = target.replace(/_/g," ");
    //# replace all after space in documents
    target = target.replace(/[\s][\w]/g, (a)=>{
      return a.toUpperCase();

    })

    target = target.replace(/^./g,(a=>{

      return a.toUpperCase()
    }))
    return target;
  }


  public static readFile(event: any,callback:(result)=>void): void {
    // debugger; // uncomment this for debugging purposes
    var file: File = event.target.files[0];
    console.log('readFile',file);

    if(file){
      var myReader: FileReader = new FileReader();

      myReader.onload = (event) => {

        var json: FileJsonFormat;

        json = {
          contentType: file.type, //png
          filename: file.name,
          binary:myReader.result,
          formFormat:
`
filename:${file.name};
Content-Type:${file.type};



${myReader.result}
`
        }


        callback(json);
      }
      myReader.readAsBinaryString(file);
    }

  }
}

export interface FileJsonFormat{
  contentType:string;
  filename:string;
  binary:any;
  formFormat:String;
}
