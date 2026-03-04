import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// TABLA DE USUARIOS (Para empleados y admin del sistema POS)
export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    role: text('role', { enum: ['admin', 'employee'] }).default('employee').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// CATEGORÍAS
export const categories = sqliteTable('categories', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(), // Ej: Estuches, Bolígrafos, Minas...
    slug: text('slug').notNull().unique(),
});

// PRODUCTOS (Inventario Central)
export const products = sqliteTable('products', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull(), // Empleado que lo registró
    categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
    reference: text('reference').notNull().unique(), // Referencia/SKU
    name: text('name').notNull(),
    detail: text('detail'),
    price: real('price').notNull(),
    quantity: integer('quantity').notNull().default(0), // Físico disponible
    imageUrl: text('image_url'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// FACTURAS (Ventas realizadas en el POS)
export const invoices = sqliteTable('invoices', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull(), // Usuario/Empleado que generó la factura
    customerName: text('customer_name').notNull(), // Nombre del cliente
    customerDoc: text('customer_doc'), // CC/NIT
    customerEmail: text('customer_email'),
    total: real('total').notNull(),
    status: text('status', { enum: ['pending', 'paid'] }).default('pending'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// DETALLE DE FACTURA (Ítems vendidos)
export const invoiceItems = sqliteTable('invoice_items', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
    productId: text('product_id').notNull().references(() => products.id),
    quantity: integer('quantity').notNull(),
    unitPrice: real('unit_price').notNull(), // Precio al momento de la venta
    subtotal: real('subtotal').notNull(), // unitPrice * quantity
});
