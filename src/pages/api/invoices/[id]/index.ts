import type { APIRoute } from 'astro';
import { db } from '../../../../db/index';
import { invoices, invoiceItems } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const DELETE: APIRoute = async ({ params }) => {
    try {
        const invoiceId = params.id;
        if (!invoiceId) {
            return new Response(JSON.stringify({ error: 'ID de factura requerido' }), { status: 400 });
        }

        // Delete invoice items first, then the invoice
        await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
        await db.delete(invoices).where(eq(invoices.id, invoiceId));

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        console.error('Error deleting invoice:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
