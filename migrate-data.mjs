import { createClient } from '@libsql/client';

const localClient = createClient({
    url: 'file:sqlite.db' // Conexión a DB local
});

const remoteClient = createClient({
    url: process.env.TURSO_DATABASE_URL || "libsql://boligrafo-eduardlon.aws-us-east-1.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI2NjUwNDYsImlkIjoiMDE5Y2JiMTEtZDkwMS03OTI0LThiOTctYmU0MzRjYjVhM2ExIiwicmlkIjoiNGFjNjM3YWQtMmVkZC00MjFjLTlkNzAtM2RhNzI4ZmM3ZmEwIn0.PB_EHQM7nV3dNN7RYO5w667Ucdbw-dwJ5yMt748dxLv8kZfcxJM6pCX_tdH3YROf9xy9x4_r_x0d30GEpxjjBg",
});

async function migrate() {
    console.log("--- Iniciando migración de datos ---");
    const tables = ['users', 'categories', 'products', 'invoices', 'invoice_items'];

    for (const table of tables) {
        console.log(`\nMigrando tabla: ${table}`);
        let result;
        try {
            result = await localClient.execute(`SELECT * FROM ${table}`);
        } catch (e) {
            console.log(`La tabla local ${table} no existe o no se pudo leer. Saltando.`);
            continue;
        }

        const rows = result.rows;
        console.log(`Encontradas ${rows.length} filas en ${table}`);

        if (rows.length === 0) continue;

        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
            const keys = Object.keys(row);
            const cols = keys.join(', ');
            const placeholders = keys.map(() => '?').join(', ');
            const values = Object.values(row);

            try {
                await remoteClient.execute({
                    sql: `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) ON CONFLICT(id) DO UPDATE SET id=excluded.id`,
                    args: values
                });
                successCount++;
            } catch (e) {
                // Intento sin ON CONFLICT si el DB no lo soporta de esa forma o si la PK es otra
                try {
                    await remoteClient.execute({
                        sql: `INSERT INTO ${table} (${cols}) VALUES (${placeholders})`,
                        args: values
                    });
                    successCount++;
                } catch (e2) {
                    console.error(`Error insertando en ${table}:`, e2.message);
                    errorCount++;
                }
            }
        }
        console.log(`Completada ${table}. Insertados/Actualizados: ${successCount}, Errores: ${errorCount}`);
    }
    console.log("\n--- Migración Finalizada ---");
}

migrate().catch(console.error);
