



export interface BaseForm{
  label:string,
  type:string,
  name:string,
  defaultValue?:string,
  placeholder?:string,
  options?:SelectOptions[],
  rules?: InputRules,


}

export interface SelectOptions{
  value:string,
  display:string,

}

export interface InputRules{
  required?: boolean,
  minLength?: number,
  maxLength?: number,
  pattern?: string,
  patternInformation?:string,
}

