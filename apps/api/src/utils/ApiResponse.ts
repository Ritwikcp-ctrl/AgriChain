class ApiResponse {
  statusCode: Number;
  data: null;
  message: string;
  success: Boolean;

  constructor(statusCode: number, data: object, message: string = "Success") {

    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = statusCode > 400;
  }
};

export default ApiResponse;
