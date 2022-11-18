export class ModelNotFoundError extends Error {
    public static status:number = 4001;
    public override message:string = "";
    
    constructor(){
        super();
    }
}