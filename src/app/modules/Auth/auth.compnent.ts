import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./auth.service";
import config from "../../config";

const getAllUser = catchAsync(async (req, res) => {
    const result = await UserServices.getAllUserFromDB();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Verify OTP',
      data: result,
    });
  });

const createUser = catchAsync(async (req, res) => {
    const { user: userData } = req.body;
    const result = await UserServices.createUserIntoDB(userData);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Verify OTP',
      data: result,
    });
  });

const verifyOTP = catchAsync(async (req, res) => {
    const { email, otp } = req.body;
    const result = await UserServices.verifyOTPintoDB(email, otp);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User Registered successFully',
      data: result,
    });
  });


const loginUser = catchAsync(async (req, res) => {
  const result = await UserServices.loginUserIntoDB(req.body);
  const { refreshToken, accessToken } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is loged in successfully',
    data: {
      accessToken,
    },
  });
});

const sendEmailToUser = catchAsync(async (req, res) => {
  const result = await UserServices.sendEmailToAllUser(req.body);
 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email send  successfully',
    data: result,
  });
});


  export const userController = {
    getAllUser,
    createUser,
    verifyOTP,
    loginUser,
    sendEmailToUser
  };