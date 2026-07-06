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

export interface DailySalesPoint {
  date: string; // YYYY-MM-DD
  quantitySold: number;
}

/**
 * Returns total product quantity sold per day for the last `days` days
 * (default 30), zero-filled for days with no sales.
 */
export const getDailySalesChart = async (days = 30): Promise<DailySalesPoint[]> => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (days - 1));

  const results = await Sale.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        quantitySold: { $sum: '$items.quantity' },
      },
    },
  ]);

  const totalsByDate = new Map<string, number>(
    results.map((r: { _id: string; quantitySold: number }) => [r._id, r.quantitySold])
  );

  const chartData: DailySalesPoint[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const key = date.toISOString().split('T')[0];
    chartData.push({ date: key, quantitySold: totalsByDate.get(key) || 0 });
  }

  return chartData;
};