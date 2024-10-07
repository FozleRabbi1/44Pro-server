import { model, Schema } from "mongoose";
import { TUser, TampUser } from "./auth.interface";
import bcrypt from 'bcrypt';


const TampUserSchema = new Schema<TampUser>(
  {
    id: {
      type: String,
    },
    otp: {
      type: String,
      required: [true, "Otp is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    needPasswordChange: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);


const userSchema = new Schema<TUser>(
  {
    id: {
      type: String,
    },
    Id: {
      type: Number,
      required: [true, "Id is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
    },
    needPasswordChange: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);



userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashPassword);
};



export const TampUserCollection = model<TUser>('TampUser', TampUserSchema);

export const User = model<TUser>('User', userSchema);
