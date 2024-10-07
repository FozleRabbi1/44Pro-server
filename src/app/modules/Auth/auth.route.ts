import express from 'express';
import { userController } from './auth.compnent';

const router = express.Router();

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

export const UserRouter = router;