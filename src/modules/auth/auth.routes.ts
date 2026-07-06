import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema, registerSchema } from './auth.validation';
import { authenticate } from '../../middlewares/auth.middleware';
import { Role } from '../../types';
import { authorize } from '../../middlewares/role.middleware';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);

// Admin-only: create Manager/Employee accounts
router.post(
  '/register',
  authenticate,
  authorize(Role.ADMIN),
  validate(registerSchema),
  authController.register
);

router.get('/me', authenticate, authController.me);

export default router;
