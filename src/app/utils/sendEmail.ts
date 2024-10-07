import nodemailer from 'nodemailer';
// import config from '../config';

export const sendEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
    // port: 587, 
    port: 465, 
    // secure: config.NODE_ENV === 'production',
    secure: true,
    auth: {
      user: 'fozlerabbishuvo@gmail.com',
      pass: 'qhdg kwxf pwgp dbho', 
    },
  });

  await transporter.sendMail({
    from: 'fozlerabbishuvo@gmail.com',
    to, 
    subject: 'Set your OTP withen 10m', 
    text: '', 
    html : `<div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
        <p>Your OTP code is:</p>
        <p style="font-size: 24px; font-weight: bold; color: blue;">${otp}</p>
        <p>Please use this code within 10 minutes to reset your password.</p>
      </div>` ,
  });
};