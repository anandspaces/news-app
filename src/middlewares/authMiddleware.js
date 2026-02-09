import JWT from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/userModel.js";

const verifyAuthentication = async (req, isOptional = false) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      if (isOptional) return;
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = JWT.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id).select(
      " -password -refreshToken"
    );

    if (!user) {
      if (isOptional) return;
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
  } catch (error) {
    if (!isOptional) {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  }
};

export const verifyJWT = asyncHandler(async (req, _, next) => {
  await verifyAuthentication(req, false);
  next();
});

export const verifyJWTForLogout = asyncHandler(async (req, _, next) => {
  await verifyAuthentication(req, true);
  next();
});
