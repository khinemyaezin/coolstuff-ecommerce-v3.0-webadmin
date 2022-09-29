export class InvalidRouteError extends Error {
    public status:number = 0;
    public override message:string = "";
    
    constructor(){
        super();
    }
}