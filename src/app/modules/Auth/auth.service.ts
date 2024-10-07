import httpStatus from "http-status";
import { TLoginUser, TUser } from "./auth.interface";
import { AppError } from "../../errors/AppErrors";
import { sendEmail } from "../../utils/sendEmail";
import { TampUserCollection, User } from "./auth.module";
import bcrypt from 'bcrypt'; 
import { createToken } from "./auth.utils";
import config from "../../config";


const createUserIntoDB = async (payload: TUser) => {
  const isStudentExists = await TampUserCollection.findOne({ email: payload.email });
  const isStudentExistsInUser = await User.findOne({ email: payload.email });

  if (isStudentExists || isStudentExistsInUser ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = new Date(Date.now() + 1 * 60 * 1000); 

  const hashedPassword = await bcrypt.hash(payload.password, 8); 

  const newUserData = {
    email: payload.email,
    password: hashedPassword,
    name: payload.name,
    otp,
    expiresAt: expirationTime, 
  };

  await sendEmail(payload.email, otp);
  await TampUserCollection.create(newUserData);
  return {
    success: true,
    message: 'OTP sent to your email. Please verify to complete registration.',
  };
};


const verifyOTPintoDB = async (email: string, otp: string) => {
  const tempUser = await TampUserCollection.findOne({ email });
  
  if (!tempUser) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  if (tempUser.otp !== otp) {
    throw new AppError(400, 'OTP not matched, try again');
  }
  if (tempUser.expiresAt < new Date()) {
    throw new AppError(400, 'OTP has expired, please request a new one');
  }
  const lastDocument = await User.findOne().sort({ _id: -1 }).exec();
  const lastDocumentId = lastDocument?.Id || 0;

  const newUserData = {
    Id: lastDocumentId + 1,
    email: tempUser.email,
    password: tempUser.password,
    name: tempUser.name,
  };

  await User.create(newUserData);
  await TampUserCollection.deleteOne({ email });

  return {
    success: true,
    message: 'User registered successfully!',
  };
};



const loginUserIntoDB = async (paylod: TLoginUser) => {  
  const userData = await User.findOne({email : paylod.email});

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is not found');
  }
  // =================================>>>>>  checking if the password is correct or not
  // if (!(await User.isPasswordMatched(paylod?.password, userData?.password))) {
  //   throw new AppError(httpStatus.FORBIDDEN, 'password is not matched');
  // }

  const res = await bcrypt.compare(paylod.password, userData.password)
  if(!res){
    throw new AppError(httpStatus.FORBIDDEN, 'password is not matched');
  }

  const jwtPayload = {
    email: userData.email,
    // role: userData.role | "",
  };
  
  // =========== jwt এর builting function
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
  };
};



  export const UserServices = {
    createUserIntoDB,
    verifyOTPintoDB,
    loginUserIntoDB
  };