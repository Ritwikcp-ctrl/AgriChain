import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { User } from "../models/user-model";
import ApiResponse from "../utils/ApiResponse";
import { Request, RequestHandler, Response, NextFunction } from "express";
import { RegisterBody } from "../utils/regiaterUserSchema";
import { LoginBody } from "../utils/loinUserSchema";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

//Register
export const registerUser: RequestHandler = asyncHandler(
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { username, email, fullName, password } = req.body;

    if (
      [username, email, fullName, password].some(
        (field) => field?.trim() === " "
      )
    ) {
      throw new ApiError(400, "All fiels is required", []);
    }

    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      throw new ApiError(409, "User already exist", []);
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email,
      fullName,
      password,
      
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering user",
        []
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "user  registered successfully"));
  }
);

//Login
export const loginUser: RequestHandler = asyncHandler(
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    console.log("Body :",req.body);
    const { email, password } = req.body;

    console.log("EMAIL:", email);
console.log("PASSWORD:", password);

    if (!email || !password) {
      throw new ApiError(400, "Identifier and password are required", []);
    }

    const user = await User.findOne({
      $or: [{ email}],
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
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10); // refresh token would be stored in database as it lives longer.

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

//Logout
export const logoutUser: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const logedoutuser = req.user!;
    logedoutuser.refreshToken = " ";
    await logedoutuser.save({
      validateBeforeSave: false,
    });
    // This is clear cookies form the browser we will do it later in login controller.so that we do logut with cookies.
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")

      .json(
        new ApiResponse(
          200,
          { use: logedoutuser },
          "User is logged out successfully"
        )
      );
  }
);

//refreshToken
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const incomingRefreshToken = req.body.refreshToken;
    if (!incomingRefreshToken) {
      return res
        .status(401)
        .json(new ApiResponse(201, "Refresh token is required"));
    }
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as JwtPayload;

    const user = await User.findById(decoded._id);
    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(201, "invalid refresh token"));
    }

    if (incomingRefreshToken !== user.refreshToken) {
      return res
        .status(401)
        .json(new ApiResponse(201, "Refresh token id invalid or already used"));
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          accessToken,
          refreshToken,
          "Access token renewed successfully "
        )
      );
  } catch (error) {
    throw new ApiError(201, "Invalild or expired refresh Token", [
      "invalid",
      "token",
    ]);
  }
};

//current user
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    return res
      .status(200)
      .json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
      );
  }
);

//change password
export const changeCurrentPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "old password and new password are required", []);
    }
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new ApiError(404, "user not found", []);
    }
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
      throw new ApiError(400, "old password is incorrect", []);
    }

    const isSamePassword = await user.isPasswordCorrect(newPassword);
    if (isSamePassword) {
      throw new ApiError(
        400,
        "New password must be different from the current password",
        []
      );
    }
    user.password = newPassword;
    await user.save({
      validateBeforeSave: false,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "password changed successfully"));
  }
);

//useraccount details
export const updateAccountDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
      throw new ApiError(400, "Fullname and email are required", []);
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user?._id },
    });

    if (existingUser) {
      throw new ApiError(409, "email is already in use", []);
    }
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          //  updates only the specific fields
          fullName,
          email,
        },
      },
      {
        new: true, //this return the updated one
        runValidators: true,
      }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "user not found", []);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"));
  }
);
