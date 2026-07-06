import { Router } from 'express';
import * as productController from './product.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadProductImage } from '../../middlewares/upload.middleware';
import { createProductSchema, updateProductSchema, productIdSchema } from './product.validation';
import { Role } from '../../types';

const router = Router();

router.use(authenticate);

// All roles (Admin, Manager, Employee) can view products
router.get('/', productController.getProducts);
router.get('/:id', validate(productIdSchema), productController.getProductById);

// Only Admin & Manager can manage products
router.post(
  '/',
  authorize(Role.ADMIN, Role.MANAGER),
  uploadProductImage,
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  authorize(Role.ADMIN, Role.MANAGER),
  uploadProductImage,
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  authorize(Role.ADMIN, Role.MANAGER),
  validate(productIdSchema),
  productController.deleteProduct
);

export default router;
