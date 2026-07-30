import {asyncHandler} from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import {User} from "../models/user-model";
import ApiResponse from "../utils/ApiResponse";

const registerUser = asyncHandler(async(req:Request,res:Response) => {
    const {username,email,fullName,password} = req.body;

    if([username,email,fullName,password].some((field) => field?.trim() === " ")
    
) {
    throw new ApiError(400, "All fiels is required");
}

const existedUser = await User.findOne ({
    $or : [{username},{email}],
});

if(existedUser){
    throw new ApiError(409,"User already exist");
}


})