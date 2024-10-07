import express from 'express';
import { UserRouter } from '../modules/Auth/auth.route';
const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: UserRouter }
];

moduleRoutes.forEach((pathRouter) =>
  router.use(pathRouter.path, pathRouter.route),
);

export default router;

