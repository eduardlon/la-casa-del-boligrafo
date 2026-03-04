import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { products } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const PUT: APIRoute = async ({ params, request }) => {
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });

    try {
        const body = await request.json();
        const updated = await db.update(products).set({ ...body, updatedAt: new Date() }).where(eq(products.id, id)).returning();
        return new Response(JSON.stringify(updated[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to update product' }), { status: 500 });
    }
};

export const DELETE: APIRoute = async ({ params }) => {
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });

    try {
        await db.delete(products).where(eq(products.id, id));
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to delete product' }), { status: 500 });
    }
};
