import { Router } from 'express';
import * as customerController from './customer.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdSchema,
} from './customer.validation';
import { Role } from '../../types';

const router = Router();

router.use(authenticate);

router.get('/', customerController.getCustomers);
router.get('/:id', validate(customerIdSchema), customerController.getCustomerById);

router.post(
  '/',
  authorize(Role.ADMIN, Role.MANAGER),
  validate(createCustomerSchema),
  customerController.createCustomer
);

router.put(
  '/:id',
  authorize(Role.ADMIN, Role.MANAGER),
  validate(updateCustomerSchema),
  customerController.updateCustomer
);

router.delete(
  '/:id',
  authorize(Role.ADMIN, Role.MANAGER),
  validate(customerIdSchema),
  customerController.deleteCustomer
);

export default router;
