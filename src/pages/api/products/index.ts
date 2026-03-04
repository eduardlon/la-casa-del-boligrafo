import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { products } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export const GET: APIRoute = async () => {
    try {
        const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
        return new Response(JSON.stringify(allProducts), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch products' }), { status: 500 });
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        // Simulate user_id for now (later from session)
        const newProduct = {
            ...body,
            userId: 'temp-user-id',
        };

        const insertedProduct = await db.insert(products).values(newProduct).returning();
        return new Response(JSON.stringify(insertedProduct[0]), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500 });
    }
};
