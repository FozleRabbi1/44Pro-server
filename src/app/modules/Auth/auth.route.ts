import express from 'express';
import { userController } from './auth.compnent';

const router = express.Router();

router.get(
    '/',
    // validateRequest(UserValidation.createUserValidationSchema),
    userController.getAllUser,
  );

router.post(
    '/create-user',
    // validateRequest(UserValidation.createUserValidationSchema),
    userController.createUser,
  );

router.post(
    '/verifyOTP',
    // validateRequest(UserValidation.createUserValidationSchema),
    userController.verifyOTP,
  );

router.post(
    '/login',
    // validateRequest(UserValidation.createUserValidationSchema),
    userController.loginUser,
  );

router.post(
    '/sendEmail',
    // validateRequest(UserValidation.createUserValidationSchema),
    userController.sendEmailToUser,
  );

export const UserRouter = router;