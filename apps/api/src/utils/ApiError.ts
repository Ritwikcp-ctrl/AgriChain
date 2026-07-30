class ApiError extends Error {
    statusCode:Number;
    success : boolean;
    errors : any[];
    data : object;

    constructor(
        statusCode :number,
        message : string = "Something went wrong",
        error : any[],
        data : object,
        stack :string = ""
    ){
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        this.success = false;
        this.errors = error;

        if(stack){
            this.stack = stack;
        }else {
            Error.captureStackTrace(this,this.constructor);
        }

    }
};

export default ApiError;
