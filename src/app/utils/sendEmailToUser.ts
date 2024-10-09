import nodemailer from 'nodemailer';
import config from '../config';
// import config from '../config';

export const sendEmailToUser = async (to: string, sub : string,  message: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
    // port: 587, 
    port: 465, 
    // secure: config.NODE_ENV === 'production',
    secure: true,
    auth: {
      user: 'fozlerabbishuvo@gmail.com',
      pass: config.email_pass , 
    },
  });

  await transporter.sendMail({
    from: 'fozlerabbishuvo@gmail.com',
    to, 
    subject: sub , 
    text: '', 
    html : message,
  });
};