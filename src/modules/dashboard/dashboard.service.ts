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
  date: string; // YYYY-MM-DD (Asia/Dhaka calendar date)
  quantitySold: number;
}

const DHAKA_TZ = 'Asia/Dhaka';

// Formats a Date (a UTC instant) as its calendar date string in Asia/Dhaka,
// e.g. "2026-07-07". Using Intl avoids manual UTC-offset arithmetic.
const formatInDhaka = (date: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

/**
 * Returns total product quantity sold per day for the last `days` days
 * (default 30), zero-filled for days with no sales.
 *
 * Days are calculated in Asia/Dhaka local time (not server/UTC time), and the
 * MongoDB aggregation also groups by Asia/Dhaka calendar day. This avoids the
 * "today shows as yesterday" bug that happens when the server runs in UTC:
 * without this, any sale made in the early hours of the Dhaka day (which is
 * still the previous UTC day) would get bucketed one day early.
 */
export const getDailySalesChart = async (days = 30): Promise<DailySalesPoint[]> => {
  const now = new Date();
  const todayKey = formatInDhaka(now); // e.g. "2026-07-07"
  const [year, month, day] = todayKey.split('-').map(Number);

  // Dhaka has a fixed UTC+6 offset (no DST), so "today at Dhaka midnight"
  // expressed as a UTC instant is simply UTC midnight minus 6 hours.
  const todayDhakaMidnightUTC = new Date(Date.UTC(year, month - 1, day, -6, 0, 0, 0));

  const startDateUTC = new Date(todayDhakaMidnightUTC);
  startDateUTC.setUTCDate(startDateUTC.getUTCDate() - (days - 1));

  const results = await Sale.aggregate([
    { $match: { createdAt: { $gte: startDateUTC } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: DHAKA_TZ },
        },
        quantitySold: { $sum: '$items.quantity' },
      },
    },
  ]);

  const totalsByDate = new Map<string, number>(
    results.map((r: { _id: string; quantitySold: number }) => [r._id, r.quantitySold])
  );

  const chartData: DailySalesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayUTC = new Date(todayDhakaMidnightUTC);
    dayUTC.setUTCDate(dayUTC.getUTCDate() - i);
    const key = formatInDhaka(dayUTC);
    chartData.push({ date: key, quantitySold: totalsByDate.get(key) || 0 });
  }

  return chartData;
};