import { Router } from 'express';
import * as dashboardController from './dashboard.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// All authenticated roles can view the dashboard
router.get('/stats', authenticate, dashboardController.getDashboardStats);

export default router;
