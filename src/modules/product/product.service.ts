import { Product, IProduct } from './product.model';
import { ApiError } from '../../utils/ApiError';
import { QueryBuilder } from '../../utils/QueryBuilder';
import fs from 'fs';
import path from 'path';

interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  imagePath: string;
}

export const createProduct = async (input: CreateProductInput): Promise<IProduct> => {
  const existing = await Product.findOne({ sku: input.sku.toUpperCase() });
  if (existing) {
    throw ApiError.conflict('A product with this SKU already exists');
  }

  return Product.create({
    name: input.name,
    sku: input.sku,
    category: input.category,
    purchasePrice: input.purchasePrice,
    sellingPrice: input.sellingPrice,
    stockQuantity: input.stockQuantity,
    image: input.imagePath,
  });
};

export const getProducts = async (queryParams: Record<string, unknown>) => {
  const qb = new QueryBuilder(Product, queryParams)
    .search(['name', 'sku', 'category'])
    .filter(['category'])
    .sort();

  return qb.execute();
};

export const getProductById = async (id: string): Promise<IProduct> => {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

export const updateProduct = async (
  id: string,
  updates: Partial<CreateProductInput> & { imagePath?: string }
): Promise<IProduct> => {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Product not found');

  if (updates.sku && updates.sku.toUpperCase() !== product.sku) {
    const existing = await Product.findOne({ sku: updates.sku.toUpperCase() });
    if (existing) throw ApiError.conflict('A product with this SKU already exists');
  }

  const oldImagePath = product.image;

  Object.assign(product, {
    name: updates.name ?? product.name,
    sku: updates.sku ?? product.sku,
    category: updates.category ?? product.category,
    purchasePrice: updates.purchasePrice ?? product.purchasePrice,
    sellingPrice: updates.sellingPrice ?? product.sellingPrice,
    stockQuantity: updates.stockQuantity ?? product.stockQuantity,
    image: updates.imagePath ?? product.image,
  });

  await product.save();

  // Clean up old image file if a new one was uploaded
  if (updates.imagePath && oldImagePath && updates.imagePath !== oldImagePath) {
    const fullPath = path.join(__dirname, '../../../', oldImagePath);
    fs.unlink(fullPath, () => {
      /* ignore cleanup errors */
    });
  }

  return product;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound('Product not found');

  await product.deleteOne();

  if (product.image) {
    const fullPath = path.join(__dirname, '../../../', product.image);
    fs.unlink(fullPath, () => {
      /* ignore cleanup errors */
    });
  }
};
