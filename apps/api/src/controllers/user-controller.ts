import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { User } from "../models/user-model";
import ApiResponse from "../utils/ApiResponse";
import { Request, Response } from "express";
import { RegisterBody } from "../utils/regiaterUserSchema";

const registerUser = asyncHandler(
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

export { registerUser };
