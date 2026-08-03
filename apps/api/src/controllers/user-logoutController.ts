import { Request, Response, RequestHandler, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";

import ApiResponse from "../utils/ApiResponse";

export const logoutUser: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const logedoutuser = req.user!;
    logedoutuser.refreshToken = " ";
    await logedoutuser.save({
      validateBeforeSave: false,
    });
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
