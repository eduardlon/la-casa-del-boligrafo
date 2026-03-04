import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { products, invoices, invoiceItems } from '../../../db/schema';
import { eq, sql } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { customerName, customerDoc, customerEmail, items, total } = body;

        // Validate request
        if (!items || items.length === 0) {
            return new Response(JSON.stringify({ error: 'La factura debe tener items' }), { status: 400 });
        }

        // Run transaction
        // Run transaction async for LibSQL
        const invoiceId = await db.transaction(async (tx) => {
            // 1. Create invoice (immediately paid)
            const newInvoice = await tx.insert(invoices).values({
                userId: 'temp-user-id', // Cambiar luego por auth
                customerName,
                customerDoc,
                customerEmail,
                total,
                status: 'paid', // <-- Set to paid directly
            }).returning({ id: invoices.id });

            if (!newInvoice || newInvoice.length === 0) {
                throw new Error("Failed to insert invoice");
            }
            const id = newInvoice[0].id;

            // 2. Insert items and reduce stock
            for (const item of items) {
                // Insert item
                await tx.insert(invoiceItems).values({
                    invoiceId: id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    subtotal: item.subtotal,
                });

                // Deduct stock
                await tx.update(products)
                    .set({ quantity: sql`${products.quantity} - ${item.quantity}` })
                    .where(eq(products.id, item.productId));
            }

            return id;
        });

        return new Response(JSON.stringify({ success: true, invoiceId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        console.error('Invoice creation failed explicitly:', error);
        return new Response(JSON.stringify({ error: 'Failed to create invoice', details: error.message }), { status: 500 });
    }
};
