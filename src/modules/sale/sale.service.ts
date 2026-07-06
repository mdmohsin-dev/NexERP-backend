import mongoose from 'mongoose';
import { Sale, ISale } from './sale.model';
import { Product } from '../product/product.model';
import { Customer } from '../customer/customer.model';
import { ApiError } from '../../utils/ApiError';
import { QueryBuilder } from '../../utils/QueryBuilder';

interface SaleItemInput {
  product: string;
  quantity: number;
}

interface CreateSaleInput {
  customer: string;
  items: SaleItemInput[];
  soldBy: string;
}

export const createSale = async (input: CreateSaleInput): Promise<ISale> => {
  const customer = await Customer.findById(input.customer);
  if (!customer) throw ApiError.notFound('Customer not found');

  // Merge duplicate product entries in the same sale (e.g. same product added twice)
  const mergedItems = new Map<string, number>();
  for (const item of input.items) {
    mergedItems.set(item.product, (mergedItems.get(item.product) || 0) + item.quantity);
  }

  const session = await mongoose.startSession();

  try {
    let createdSale: ISale;

    await session.withTransaction(async () => {
      const saleItems = [];
      let grandTotal = 0;

      for (const [productId, quantity] of mergedItems) {
        // Atomic decrement: only succeeds if enough stock is available,
        // preventing race conditions between concurrent sales.
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, stockQuantity: { $gte: quantity } },
          { $inc: { stockQuantity: -quantity } },
          { new: true, session }
        );

        if (!updatedProduct) {
          const product = await Product.findById(productId).session(session);
          if (!product) {
            throw ApiError.notFound(`Product not found: ${productId}`);
          }
          throw ApiError.badRequest(
            `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${quantity}`
          );
        }

        const lineTotal = updatedProduct.sellingPrice * quantity;
        grandTotal += lineTotal;

        saleItems.push({
          product: updatedProduct._id,
          productName: updatedProduct.name,
          quantity,
          unitPrice: updatedProduct.sellingPrice,
          lineTotal,
        });
      }

      const [sale] = await Sale.create(
        [
          {
            customer: customer._id,
            items: saleItems,
            grandTotal,
            soldBy: input.soldBy,
          },
        ],
        { session }
      );

      createdSale = sale;
    });

    return (await Sale.findById(createdSale!._id)
      .populate('customer', 'name phone email')
      .populate('soldBy', 'name role')) as ISale;
  } finally {
    await session.endSession();
  }
};

export const getSales = async (queryParams: Record<string, unknown>) => {
  const qb = new QueryBuilder(Sale, queryParams).sort();
  const { data, meta } = await qb.execute();

  const populated = await Sale.populate(data, [
    { path: 'customer', select: 'name phone email' },
    { path: 'soldBy', select: 'name role' },
  ]);

  return { data: populated, meta };
};

export const getSaleById = async (id: string): Promise<ISale> => {
  const sale = await Sale.findById(id)
    .populate('customer', 'name phone email')
    .populate('soldBy', 'name role');
  if (!sale) throw ApiError.notFound('Sale not found');
  return sale;
};
