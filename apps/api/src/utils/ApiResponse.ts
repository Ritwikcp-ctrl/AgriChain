class ApiResponse {
  statusCode: number;
  data: unknown;
  message: string;
  success: boolean;
  token? :string;

  constructor(statusCode: number, data:unknown, message: string = "Success",token?:string) {

    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.token = token;
  }
};

export default ApiResponse;
