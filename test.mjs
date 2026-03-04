import { db } from './src/db/index.js';
import { invoices, invoiceItems } from './src/db/schema.js';

async function test() {
    try {
        const invoiceId = await db.transaction(async (tx) => {
            console.log("Creating invoice...");
            const newInvoice = await tx.insert(invoices).values({
                userId: 'temp-user-id',
                customerName: 'Test',
                customerDoc: '123',
                customerEmail: 'test@t.com',
                total: 100,
            }).returning({ id: invoices.id });

            console.log("Invoice created:", newInvoice);
            const id = newInvoice[0].id;

            return id;
        });
        console.log("Success", invoiceId);
    } catch (e) {
        console.error("FAILED IN TRANSACTION:");
        console.error(e);
    }
}

test();
