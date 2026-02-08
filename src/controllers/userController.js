import User from '../models/userModel.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

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
    console.error("Token Generation Error:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token."
    );
  }
};


const registerUser = asyncHandler(async (req, res) => {
  console.log("payload is here", req.body);
  const {
    email,
    fullName,
    password,
    interests,
    ageGroup,
    language,
    city,
    pincode,
    state
  } = req.body;

  if (
    [email, fullName, password, ageGroup, city, pincode, state].some((field) =>
      typeof field !== 'string' || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required and must be strings");
  }

  const userExists = await User.findOne({ email });

  console.log("userExists", userExists);
  if (userExists)
    throw new ApiError(409, "user with email already exists");

  const user = await User.create({
    fullName,
    email,
    password,
    interests,
    ageGroup,
    language,
    city,
    pincode,
    state
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser)
    throw new ApiError(500, "user registration failed, please try again");

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
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
  console.log(user._id);
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
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // removes field from document
      },
    },
    { new: true }
  );

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



export { registerUser, loginUser, logoutUser };
