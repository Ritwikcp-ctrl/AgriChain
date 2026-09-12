import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/user-model";
import ApiError from "../utils/ApiError";


const verifyJwt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      return res
        .status(200)
        .json(
          new ApiError(201, "user logged in successful", ["token", "not found"])
        );
    }
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(201, "Invalid access token", ["user", "not found"]);
    }
    req.user = user;
    // i could return this , but insted i attach it to the request.Because the same rquest is still travelling through express.
    next();
  } catch (error) {
    throw new ApiError(201, "Access token expired or invalid", [
      "token",
      "expred or invaild",
    ]);
  }
};

export {verifyJwt};

