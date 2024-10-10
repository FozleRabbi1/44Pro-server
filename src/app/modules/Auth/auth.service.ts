/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { TLoginUser, TUser } from "./auth.interface";
import { AppError } from "../../errors/AppErrors";
import { sendEmail } from "../../utils/sendEmail";
import { TampUserCollection, User } from "./auth.module";
import bcrypt from 'bcrypt'; 
import { createToken } from "./auth.utils";
import config from "../../config";
import { sendEmailToUser } from "../../utils/sendEmailToUser";
// import { sendEmailToUser } from "../../utils/sendEmailToUser";


const getAllUserFromDB = async () =>{
  const result = await User.find()
  return result
}


const createUserIntoDB = async (payload: TUser) => {  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = new Date(Date.now() + 1 * 60 * 1000); 

  const isStudentExists = await TampUserCollection.findOne({ email: payload?.email });
  const isStudentExistsInUser = await User.findOne({ email: payload?.email });

  const hashedPassword = await bcrypt.hash(payload?.password, 8); 

  if (isStudentExistsInUser ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  if(isStudentExists){   
    const data = {
      otp ,
      password : hashedPassword,
    }

    await TampUserCollection.findOneAndUpdate({email : payload?.email}, data , {new : true, runValidators : true})
    await sendEmail(payload?.email, otp);
    return
  }

  const newUserData = {
    email: payload?.email,
    password: hashedPassword,
    name: payload?.name,
    otp,
    expiresAt: expirationTime, 
  };

  await sendEmail(payload?.email, otp);
  await TampUserCollection.create(newUserData);
  return {
    success: true,
    message: 'OTP sent to your email. Please verify to complete registration.',
  };
};


const verifyOTPintoDB = async (email: string, otp: string) => {
  const tempUser = await TampUserCollection.findOne({ email });
  
  if (!tempUser) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found Try again');
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
    const res = await bcrypt.compare(paylod.password, userData.password)
  if(!res){
    throw new AppError(httpStatus.FORBIDDEN, 'password is not matched');
  }

  const jwtPayload = {
    email: userData.email,
    // role: userData.role | "",
  };
  
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


const deleteExpiredUsers = async () => {
    try {
    const now = new Date();    
    const expiredUsers = await TampUserCollection.find({ expiresAt: { $lte: now } });

    if (expiredUsers.length > 0) {
      console.log("deleted");      
      await TampUserCollection.deleteMany({ expiresAt: { $lte: now } });
    } else {
      console.log("No expired users found");
    }
  } catch (error) {
    console.error("Error deleting expired users:", error);
    throw new AppError(500, "Failed to delete expired users");
  }
};
setInterval(() => {
  deleteExpiredUsers();
}, 10 * 60 * 1000);


const sendEmailToAllUser = async (payload : any) =>{
  const { email, subject, value } = payload;
  const result = await sendEmailToUser(email, subject, value)
  return result;
}


  export const UserServices = {
    getAllUserFromDB,
    createUserIntoDB,
    verifyOTPintoDB,
    loginUserIntoDB,
    sendEmailToAllUser
  };