/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmailToUser = async (to: string[], sub: string, message: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, 
    secure: true, 
    auth: {
      user: 'fozlerabbishuvo@gmail.com',
      // user: senderEmail,
      pass: config.email_pass, 
    },
  });

  const recipientEmails = to.join(',');
  await transporter.sendMail({
    from: 'fozlerabbishuvo@gmail.com',
    // from: senderEmail,
    to: recipientEmails, 
    subject: sub, 
    text: '', 
    html: message,
  });
  
};
