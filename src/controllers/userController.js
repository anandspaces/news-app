import User from '../models/userModel.js';
import Interest from '../models/interestModel.js';
import Language from '../models/languageModel.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import logger from '../utils/logger.js'; // Import logger
import sendEmail from '../utils/sendEmail.js';

// Generate JWT Token

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error(`Token Generation Error: ${error}`);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token."
    );
  }
};


const registerUser = asyncHandler(async (req, res) => {
  logger.info(`payload is here: ${JSON.stringify(req.body)}`);
  const {
    email,
    password,
    firstName,
    lastName,
    mobileNumber,
    countryCode,
    interests,
    ageGroup,
    language,
    city,
    pincode,
    state
  } = req.body;

  if (
    [email, password, firstName].some((field) =>
      typeof field !== 'string' || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const userExists = await User.findOne({ email });

  logger.info(`userExists: ${userExists}`);
  if (userExists)
    throw new ApiError(409, "User with email already exists");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    mobileNumber,
    countryCode,
    interests,
    ageGroup,
    language,
    city,
    pincode,
    state,
    isVerified: false, // Explicitly set to false, though default handles it
    otp,
    otpExpiry
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -otp -otpExpiry"
  );

  if (!createdUser)
    throw new ApiError(500, "User registration failed, please try again");

  // Send OTP email asynchronously (do not await)
  const message = `Your OTP for verification is: ${otp}. It is valid for 10 minutes.`;

  sendEmail({
    email: user.email,
    subject: 'News App - Verification OTP',
    message,
  }).catch((error) => {
    logger.error(`Error sending registration OTP email: ${error.message}`);
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully. OTP will be sent to your email shortly."));
});


const loginUser = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required.");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User doesnot exist.");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials.");
  }

  if (!user.isVerified) {
    throw new ApiError(401, "Please verify your email first.");
  }

  logger.info(`User ID: ${user._id}`);
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully !!!."
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1, // removes field from document
        },
      },
      { new: true }
    );
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logout successfull !!!."));
});



const getInterests = asyncHandler(async (req, res) => {
  const interests = await Interest.find().select('name _id').sort({ name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, interests, "Interests fetched successfully"));
});

const getLanguages = asyncHandler(async (req, res) => {
  const languages = await Language.find().select('name _id').sort({ name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, languages, "Languages fetched successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { firstName, lastName, mobileNumber, countryCode, email, interests, ageGroup, language, city, pincode, state } = req.body;

  // Prevent email update for now (or handle it with verification logic if needed)
  if (email && email !== req.user.email) {
    throw new ApiError(400, "Email cannot be updated through this endpoint");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        firstName,
        lastName,
        mobileNumber,
        countryCode,
        interests, // Assuming interests is an array of strings/Ids
        ageGroup,
        language,
        city,
        pincode,
        state
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set OTP expiry to 10 minutes from now
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save({ validateBeforeSave: false });

  const message = `Your OTP for verification is: ${otp}. It is valid for 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'News App - Verification OTP',
      message,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "OTP sent successfully"));
  } catch (error) {
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error(`Error sending email: ${error.message}`);
    throw new ApiError(500, "Email could not be sent");
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.otp || !user.otpExpiry) {
    throw new ApiError(400, "OTP not sent or expired");
  }

  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (Date.now() > user.otpExpiry) {
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(400, "OTP has expired");
  }

  // Clear OTP fields
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP verified successfully"));
});


const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Email, OTP and new password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.otp || !user.otpExpiry) {
    throw new ApiError(400, "OTP not sent or expired");
  }

  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (Date.now() > user.otpExpiry) {
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(400, "OTP has expired");
  }

  user.password = newPassword; // Will be hashed by pre-save hook
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

export { registerUser, loginUser, logoutUser, getInterests, getLanguages, getCurrentUser, updateAccountDetails, sendOTP, verifyOTP, resetPassword };
