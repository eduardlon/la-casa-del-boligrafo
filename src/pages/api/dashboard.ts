import type { APIRoute } from 'astro';
import { db } from '../../db';
import { products, invoices } from '../../db/schema';
import { sql, gte } from 'drizzle-orm';

export const GET: APIRoute = async () => {
    try {
        // Obtenemos inicio del día actual (00:00:00) en formato Date para comparar con el timestamp
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Productos totales en el sistema
        const productsResult = await db.select({ count: sql<number>`count(*)` }).from(products);
        const totalProducts = productsResult[0].count;

        // Facturas de hoy
        // createdAt is typed as Date because mode: 'timestamp' is used in schema
        const invoicesTodayResult = await db.select({
            count: sql<number>`count(*)`,
            totalSales: sql<number>`COALESCE(SUM(${invoices.total}), 0)`
        })
            .from(invoices)
            .where(gte(invoices.createdAt, today));

        const invoicesTodayCount = invoicesTodayResult[0].count;
        const totalSalesToday = invoicesTodayResult[0].totalSales;

        const data = {
            totalProducts,
            invoicesTodayCount,
            totalSalesToday
        };

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
