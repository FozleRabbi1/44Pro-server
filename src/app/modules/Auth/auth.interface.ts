export interface TUser {
  id: string;
  Id : number; 
  otp: string;
  name: string;
  email: string;
  password: string;
  needPasswordChange: boolean;
  isDeleted: boolean;
  expiresAt : Date;
}


export type TLoginUser = {
  email: string;
  password: string;
};



export interface TampUser extends TUser {} 
