import { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { User } from "../models/user-model";
import { LoginBody } from "../utils/loinUserSchema";
import bcrypt from "bcryptjs";

const loginUser: RequestHandler = asyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body;

    if (!email || password) {
      throw new ApiError(400, "Identifier and password are required", []);
    }

    const user = await User.findOne({
      $or: [{ email, password }],
    });

    if (!user) {
      throw new ApiError(404, "User not found", []);
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Invalid credential", []);
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    user.refreshToken = hashedRefreshToken; //stored in db

    await user.save({
      validateBeforeSave: false,
    });

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!loggedInUser) {
      throw new ApiError(404, "not logged in can't return the jwt", []);
      // const errors = new ApiError(404,"not logged in ",[])
      // console.log(errors.message)
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          201,
          { user: loggedInUser, accessToken },
          "user logged in successful"
        )
      );
  }
);

export { loginUser };
