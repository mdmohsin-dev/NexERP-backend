import { Router } from 'express';
import * as saleController from './sale.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createSaleSchema } from './sale.validation';
import { Role } from '../../types';

const router = Router();

router.use(authenticate);

// Admin, Manager, Employee can all create sales
router.post(
  '/',
  authorize(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE),
  validate(createSaleSchema),
  saleController.createSale
);

// Viewing sale history - Admin & Manager (Employee's assessment scope is create-only)
router.get('/', authorize(Role.ADMIN, Role.MANAGER), saleController.getSales);
router.get('/:id', authorize(Role.ADMIN, Role.MANAGER), saleController.getSaleById);

export default router;
