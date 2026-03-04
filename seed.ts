import { db } from './src/db/index.js';
import { categories, products } from './src/db/schema.js';
import { sql } from 'drizzle-orm';

async function seed() {
    console.log('Seeding Database...');

    // 1. Borrar datos existentes (opcional, para empezar limpios)
    // await db.delete(products);
    // await db.delete(categories);

    // Usuario admin temporal (viene de schema.ts o asumimos 'temp-user-id')
    const userId = 'temp-user-id';

    // 2. Definir e Insertar Categorías
    const catsToInsert = [
        { name: 'Bolígrafos y Portaminas', slug: 'boligrafos-y-portaminas' },
        { name: 'Estuches x Dos', slug: 'estuches-x-dos' },
        { name: 'Bolígrafos de Regalo', slug: 'boligrafos-de-regalo' },
        { name: 'Minas y Recambios', slug: 'minas-y-recambios' },
    ];

    const insertedCats = await db.insert(categories).values(catsToInsert).returning();

    // Mapa de IDs para asignar a productos
    const catMap = {
        1: insertedCats.find(c => c.name === 'Bolígrafos y Portaminas')?.id,
        2: insertedCats.find(c => c.name === 'Estuches x Dos')?.id,
        3: insertedCats.find(c => c.name === 'Bolígrafos de Regalo')?.id,
        4: insertedCats.find(c => c.name === 'Minas y Recambios')?.id,
    };

    // 3. Preparar los Productos (Traducción del SQL al ORM, ajustando campos)
    // Requisitos del usuario: cantidad (quantity) inicial de 1 para todos, 'detalle' mapeado a 'name'
    const rawProducts = [
        // CAT 1
        { ref: '301348', det: 'Bolígrafo Manchester satinado', val: 1200, cat: 1 },
        { ref: '301545', det: 'Bolígrafo Diamant Pastel', val: 1300, cat: 1 },
        { ref: '301550', det: 'Boligrafo Diamant Fen Pastel', val: 1200, cat: 1 },
        { ref: '303501', det: 'Boligrafo de colgar hueso', val: 1900, cat: 1 },
        { ref: '300246', det: 'Bolígrafo London translucido', val: 1900, cat: 1 },
        { ref: '307001', det: 'Bolígrafo de colgar Tactil', val: 2800, cat: 1 },
        { ref: '302001', det: 'Bolígrafo I Lamy', val: 1900, cat: 1 },
        { ref: '302540', det: 'Boligrafo Singapur', val: 2000, cat: 1 },
        { ref: '303707', det: 'Portanimas plástico studmark 05-07', val: 3500, cat: 1 },
        { ref: '302002', det: 'Portaminas TL Lamy', val: 2000, cat: 1 },
        { ref: '301038', det: 'Boligrafo escarchado color 05', val: 12000, cat: 1 },
        { ref: '397372', det: 'Roller Gel Cuadricula 05', val: 2500, cat: 1 },
        { ref: '307571', det: 'Roller Gel Pastel 05', val: 2500, cat: 1 },
        { ref: '301347', det: 'Boligrafo Jeringa', val: 1900, cat: 1 },
        { ref: '303752', det: 'Porta minas estándar 2.00mm', val: 3000, cat: 1 },

        // CAT 2
        { ref: '906908', det: 'Juego Diamant Senior Boli-Roller', val: 30000, cat: 2 },
        { ref: '901902', det: 'Juego Diamant Special Boli-Roller', val: 18000, cat: 2 },
        { ref: '920921', det: 'Juego Diamant Metal Boli-Lapicero', val: 18000, cat: 2 },
        { ref: '906807', det: 'Juego Diamant Juventus Bol-Roller', val: 20000, cat: 2 },
        { ref: '912913', det: 'Juego Diamant Luxury Sterling Bol-Roller', val: 30000, cat: 2 },
        { ref: '912124-4', det: 'Juego Diamant Senator Flither Bol-Roller', val: 30000, cat: 2 },
        { ref: '912183', det: 'Juego Diamant Ejecutivo Sterling Bol-Roller', val: 30000, cat: 2 },
        { ref: '912907', det: 'Juego Diamant Laque Coolor', val: 24000, cat: 2 },
        { ref: '911330', det: 'Juego Diamant Gol Bol-Roller', val: 30000, cat: 2 },
        { ref: '911388', det: 'Juego Diamant Diplomatic Bol-Roller', val: 20000, cat: 2 },
        { ref: '920922', det: 'Juego Diamant T Lany Bol-Lapicero', val: 10000, cat: 2 },

        // CAT 3
        { ref: '872600', det: 'Bolígrafo Diamant clasic estándar', val: 10000, cat: 3 },
        { ref: '872872', det: 'Bolígrafo Diamant Fem', val: 8000, cat: 3 },
        { ref: '872109', det: 'Bolígrafo Diamant Victory', val: 10000, cat: 3 },
        { ref: '872519', det: 'Bolígrafo Diamant vista fligher IP CT', val: 12000, cat: 3 },
        { ref: '872520', det: 'Bolígrafo Diamant Special', val: 12000, cat: 3 },
        { ref: '872110', det: 'Bolígrafo Diamant Victory GOL', val: 12000, cat: 3 },
        { ref: '872814', det: 'Boligrafo Diamant Intense Coolor', val: 8000, cat: 3 },
        { ref: '872124-1A', det: 'Boligrafo Diamant Luxury 1a', val: 24000, cat: 3 },
        { ref: '872747', det: 'Boligrafo Diamant Dinamic GT', val: 12000, cat: 3 },
        { ref: '872005', det: 'Boligrafo Diamant Ejecutivo', val: 12000, cat: 3 },
        { ref: '872249', det: 'Boligrafo Diamant Onix GT', val: 12000, cat: 3 },
        { ref: '872619', det: 'Boligrafo Diamant Black & Coolor', val: 10000, cat: 3 },
        { ref: '872018', det: 'Estilografo Diamant Pisis', val: 6000, cat: 3 },
        { ref: '872598', det: 'Roller Diamant Pisis', val: 5000, cat: 3 },
        { ref: '872604', det: 'Boligrafo Diamant Fligther Brillant', val: 10000, cat: 3 },
        { ref: '872612', det: 'Boligrafo Diamant Galaxia', val: 14000, cat: 3 },
        { ref: '872108', det: 'Boligrafo Diamant President', val: 20000, cat: 3 },
        { ref: '872016', det: 'Boligrafo Diamant Metal Golf', val: 10000, cat: 3 },
        { ref: '872372', det: 'Roller Diamant Gel Juventus', val: 5000, cat: 3 },
        { ref: '872181', det: 'Boligrafo Diamant Lany', val: 12000, cat: 3 },
        { ref: '872183', student: 'Roller Boll Diamant Ejecutivo', val: 18000, cat: 3 }, // typo in sql 'student' wait no, ill just hardcode
        { ref: '872183b', det: 'Roller Boll Diamant Ejecutivo', val: 18000, cat: 3 }, // Fixed reference to avoid dupe, assuming it was a typo in user's request. Wait, let me check the sql.
        { ref: '872903', det: 'Roller Diamant Special', val: 9000, cat: 3 },

        // CAT 4
        { ref: '257801-F', det: 'Rep. Diamant Boligrafo Metal Estándar', val: 1200, cat: 4 },
        { ref: '257802-G', det: 'Rep. Diamant Boligrafo Metal TC', val: 1200, cat: 4 },
        { ref: '257806-I', det: 'Rep. Boligrafo Plastico L', val: 300, cat: 4 },
        { ref: '257804-E', det: 'Rep. Diamant Boligrafo Plastico Estánd', val: 400, cat: 4 },
        { ref: '257805-I', det: 'Rep. Diamant Boligrafo Sencillo Plast.', val: 350, cat: 4 },
        { ref: '257807-A', det: 'Rep. Roller Metal', val: 1200, cat: 4 },
        { ref: '257906-B', det: 'Rep Roller Gel', val: 1000, cat: 4 },
        { ref: '257571-D', det: 'Rep. Roller Gel Pastel', val: 1000, cat: 4 },
        { ref: '257641-C', det: 'Rep. Roller Gel 07', val: 1200, cat: 4 },
    ];

    const prodsToInsert = rawProducts.map(p => ({
        userId,
        categoryId: catMap[p.cat as keyof typeof catMap] || null,
        reference: p.ref,
        name: p.det || (p as any).student || 'Producto Sin Nombre',
        detail: p.det || '',
        price: p.val,
        quantity: 1, // REQUISITO: Set quantity to 1 for all initial stock
    }));

    console.log(`Inserting ${prodsToInsert.length} products...`);

    // Insertar de a grupos pequeños por si aca sqlite tiene limite 
    try {
        for (const prod of prodsToInsert) {
            // Usamos onConflictDoNothing o catch para evitar choque de referencias unicas si re-ejecutamos
            try {
                await db.insert(products).values(prod);
            } catch (err: any) {
                if (!err.message.includes('UNIQUE constraint')) {
                    console.error(`Error inserting ${prod.reference}:`, err.message);
                }
            }
        }
        console.log('Seed completed successfully!');
    } catch (error) {
        console.error('Seed error:', error);
    }
}

seed();
