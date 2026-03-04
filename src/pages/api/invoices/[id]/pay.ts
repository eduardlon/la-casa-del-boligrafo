import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { products, invoices, invoiceItems } from '../../../../db/schema';
import { eq, sql } from 'drizzle-orm';

export const POST: APIRoute = async ({ params }) => {
    const invoiceId = params.id;
    if (!invoiceId) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });

    try {
        const invoice = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);

        if (invoice.length === 0) {
            return new Response(JSON.stringify({ error: 'Factura no encontrada' }), { status: 404 });
        }

        if (invoice[0].status === 'paid') {
            return new Response(JSON.stringify({ error: 'Factura ya está pagada' }), { status: 400 });
        }

        // Run transaction synchronously to mark as paid and deduct stock
        db.transaction((tx) => {
            // 1. Update invoice status
            tx.update(invoices).set({ status: 'paid' }).where(eq(invoices.id, invoiceId)).run();

            // 2. Fetch items for this invoice
            const items = tx.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId)).all();

            // 3. Reduce stock for each item
            for (const item of items) {
                tx.update(products)
                    .set({ quantity: sql`${products.quantity} - ${item.quantity}` })
                    .where(eq(products.id, item.productId))
                    .run();
            }
        });

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Payment confirmation failed:', error);
        return new Response(JSON.stringify({ error: 'Failed to process payment' }), { status: 500 });
    }
};
