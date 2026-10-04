import { queryDatabase } from './postgres-store.js';

export interface DashboardStats {
  metrics: {
    gmv: number;
    totalOrders: number;
    conversionRate: number;
    avgOrderSize: number;
  };
  revenueSeries: Array<{ label: string; revenue: number; orders: number }>;
  categoryDemand: Array<{ category: string; demand: number; conversion: number }>;
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const metrics = (await queryDatabase(`SELECT count(*) AS total,
    count(*) FILTER (WHERE status='paid') AS paid,
    coalesce(sum(amount) FILTER (WHERE status='paid'),0) AS gmv FROM orders`))[0];
  const totalOrders = Number(metrics.total);
  const paidOrders = Number(metrics.paid);
  const gmv = Number(metrics.gmv);
  const weeks = await queryDatabase(`SELECT date_trunc('week',created_at::timestamptz) AS week,
    count(*) AS orders, coalesce(sum(amount),0) AS revenue FROM orders
    WHERE status='paid' AND created_at::timestamptz >= now()-interval '28 days'
    GROUP BY week ORDER BY week`);
  const categories = await queryDatabase(`SELECT coalesce(p.category,'Uncategorized') AS category,
    sum(i.quantity) AS demand,
    sum(CASE WHEN o.status='paid' THEN i.quantity ELSE 0 END) AS paid
    FROM order_items i JOIN orders o ON o.reference=i.order_reference
    LEFT JOIN products p ON p.id=i.item_id GROUP BY p.category ORDER BY demand DESC LIMIT 200`);
  return {
    metrics: { gmv, totalOrders, conversionRate: totalOrders ? paidOrders / totalOrders * 100 : 0, avgOrderSize: paidOrders ? gmv / paidOrders : 0 },
    revenueSeries: weeks.map(row => ({ label: new Date(row.week).toISOString().slice(0,10), revenue: Number(row.revenue), orders: Number(row.orders) })),
    categoryDemand: categories.map(row => ({ category: String(row.category), demand: Number(row.demand), conversion: Number(row.demand) ? Number(row.paid) / Number(row.demand) * 100 : 0 })),
  };
}
