import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { products, invoices, invoiceItems } from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
    try {
        const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt));

        // Fetch items for each invoice (in a real app, you might join, but this is fine for SQLite)
        const invoicesWithItems = await Promise.all(
            allInvoices.map(async (inv) => {
                const itemsStr = await db.select({
                    id: invoiceItems.id,
                    invoiceId: invoiceItems.invoiceId,
                    productId: invoiceItems.productId,
                    quantity: invoiceItems.quantity,
                    unitPrice: invoiceItems.unitPrice,
                    subtotal: invoiceItems.subtotal,
                    name: products.name,
                    reference: products.reference
                })
                    .from(invoiceItems)
                    .leftJoin(products, eq(invoiceItems.productId, products.id))
                    .where(eq(invoiceItems.invoiceId, inv.id));

                return { ...inv, items: itemsStr };
            })
        );

        return new Response(JSON.stringify(invoicesWithItems), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch invoices' }), { status: 500 });
    }
};
