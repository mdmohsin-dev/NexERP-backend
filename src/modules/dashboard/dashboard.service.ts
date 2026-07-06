import { Product } from '../product/product.model';
import { Customer } from '../customer/customer.model';
import { Sale } from '../sale/sale.model';
import { env } from '../../config/env';

export const getDashboardStats = async () => {
  const [totalProducts, totalCustomers, totalSales, lowStockProducts, salesAgg] =
    await Promise.all([
      Product.countDocuments(),
      Customer.countDocuments(),
      Sale.countDocuments(),
      Product.find({ stockQuantity: { $lt: env.lowStockThreshold } })
        .select('name sku stockQuantity category image')
        .sort('stockQuantity'),
      Sale.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$grandTotal' } } }]),
    ]);

  return {
    totalProducts,
    totalCustomers,
    totalSales,
    totalRevenue: salesAgg[0]?.totalRevenue || 0,
    lowStockThreshold: env.lowStockThreshold,
    lowStockProducts,
  };
};
