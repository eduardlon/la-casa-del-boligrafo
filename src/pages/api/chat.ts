import type { APIRoute } from 'astro';
import { db } from '../../db/index';
import { products, invoices, invoiceItems } from '../../db/schema';
import { eq, like, sql } from 'drizzle-orm';

const BASE_SYSTEM_PROMPT = `Eres "Diamant AI", el asistente inteligente de "La Casa del Bolígrafo", una tienda de bolígrafos y artículos de escritura.
Tu personalidad es amigable, profesional y eficiente. Respondes en español colombiano.
Debes responder ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin backticks.

REGLAS CRÍTICAS:
- Tienes acceso al historial de la conversación. Úsalo para recordar el contexto.
- MULTI-TURN CREATION (PRODUCTO): Si el usuario quiere CREAR un producto, PERO falta el nombre, la referencia o el precio, NO ejecutes CREATE_PRODUCT. En su lugar, usa "CHAT" para preguntarle ESPECÍFICAMENTE y paso a paso por el dato que falta (ej. "¿Cómo se llamará el producto?"). Sigue preguntando hasta tener Nombre, Referencia y Precio.
- MULTI-TURN FACTURACIÓN: Si el usuario quiere generar o crear una FACTURA (Venta), NO ejecutes CREATE_INVOICE todavía. Usa "CHAT" para preguntarle paso a paso por: 1) Cuál producto (buscar en inventario por referencia o nombre) y qué cantidad, 2) Nombre del cliente, 3) Documento del cliente (NIT o Cédula). Una vez tengas TODOS esos datos, usa CREATE_INVOICE.
- Si el usuario solo menciona un nombre o referencia de algo que EXISTE en el Inventario (mira la lista abajo), asume que quiere BUSCAR ese producto y utiliza SEARCH_PRODUCT.
- Para búsquedas, extrae solo las palabras clave en singular.
- NO inventes productos. Usa el Inventario a continuación para dar respuestas precisas.

Acciones disponibles:

1. Crear producto (SOLO cuando tengas nombre, referencia y precio):
{"action":"CREATE_PRODUCT","data":{"reference":"REF","name":"nombre","price":5000,"quantity":1,"categoryId":null}}

2. Generar Factura (SOLO cuando tengas producto, cantidad, cliente y documento):
{"action":"CREATE_INVOICE","data":{"customerName":"Juan Perez","customerDoc":"123456789","items":[{"reference":"REF-123","quantity":2}]}}

3. Buscar producto:
{"action":"SEARCH_PRODUCT","query":"palabras clave en singular"}

4. Actualizar stock:
{"action":"UPDATE_STOCK","reference":"referencia","newQuantity":10}

5. Eliminar producto:
{"action":"DELETE_PRODUCT","reference":"referencia"}

6. Editar precio:
{"action":"UPDATE_PRICE","reference":"referencia","newPrice":5000}

7. Conversación, preguntas, pedir datos faltantes o comandos incompletos:
{"action":"CHAT","message":"tu respuesta amigable aquí paso a paso"}

EJEMPLOS:
- Usuario: "quiero crear un producto" → {"action":"CHAT","message":"¡Con gusto! ¿Cómo se va a llamar el nuevo producto? 📝"}
- Usuario: "quiero facturar" → {"action":"CHAT","message":"¡Claro que sí! ¿Qué producto deseas facturar y qué cantidad?"}
- Usuario: "2 boligrafos diamant" (flujo factura) → {"action":"CHAT","message":"Perfecto, 2 Bolígrafos Diamant. ¿A nombre de quién hacemos la factura?"}
- Usuario: "Juan Perez" (flujo factura) → {"action":"CHAT","message":"Excelente. ¿Cuál es el documento de identidad de Juan Perez?"}
- Usuario: "12345" (flujo factura) → {"action":"CREATE_INVOICE", ...}

IMPORTANTE: Responde SOLO el JSON, nada más.`;

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

async function transcribeAudioGroq(apiKey: string, base64Audio: string): Promise<string> {
    // Convierte el base64 de vuelta a un Blob/File
    const byteCharacters = atob(base64Audio.split(',')[1] || base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/webm' });
    const file = new File([blob], 'audio.webm', { type: 'audio/webm' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'es');

    const response = await fetch(GROQ_WHISPER_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq Whisper API error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.text || '';
}

async function callGroq(apiKey: string, systemPrompt: string, history: any[], userMessage: string): Promise<string> {
    const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.text
    }));

    const messages = [
        { role: 'system', content: systemPrompt },
        ...formattedHistory,
        { role: 'user', content: userMessage }
    ];

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: messages,
            temperature: 0.2,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        let message = body.message || '';
        const audioBase64 = body.audio || null;
        const history = body.history || [];

        const apiKey = process.env.GROQ_API_KEY || import.meta.env.GROQ_API_KEY || '';

        if (!apiKey) {
            return new Response(JSON.stringify({
                response: "⚠️ La API Key de Groq no está configurada. Por favor agrega GROQ_API_KEY en el archivo .env del proyecto."
            }), { status: 200 });
        }

        // Si hay audio, primero transcribir usando Whisper
        if (audioBase64) {
            const transcription = await transcribeAudioGroq(apiKey, audioBase64);
            console.log("Transcribed Audio:", transcription);
            if (!transcription.trim()) {
                return new Response(JSON.stringify({
                    response: "No pude entender el mensaje de voz. ¿Puedes repetirlo o escribirlo?"
                }), { status: 200 });
            }
            message = transcription; // El mensaje ahora es la transcripción
        }

        // Obtener inventario actual para inyectar en el contexto de la IA
        const currentInventory = await db.select({
            name: products.name,
            ref: products.reference,
            price: products.price,
            stock: products.quantity
        }).from(products);

        const inventoryContext = `\n\n--- INVENTARIO ACTUAL DE LA TIENDA ---\n` +
            currentInventory.map(p => `- ${p.name} (Ref: ${p.ref}) | Precio: ${p.price} | Stock: ${p.stock}`).join('\n') +
            `\n--------------------------------------\nUtiliza esta información para responder preguntas sobre disponibilidad, precios o stock existente con CHAT.`;

        const FULL_PROMPT = BASE_SYSTEM_PROMPT + inventoryContext;

        // Call Groq with the user's message and history
        const textResponse = await callGroq(apiKey, FULL_PROMPT, history, message);

        // Clean response (may come wrapped in ```json ... ```)
        let cleanJson = textResponse
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/gi, '')
            .trim();

        const jsonStart = cleanJson.indexOf('{');
        const jsonEnd = cleanJson.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
        }

        let intent: any;
        try {
            intent = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Groq output not valid JSON:", textResponse);
            return new Response(JSON.stringify({
                response: textResponse || "No pude procesar tu solicitud. Intenta de nuevo con otra frase."
            }), { status: 200 });
        }

        // Execute action
        switch (intent.action) {
            case 'CREATE_PRODUCT': {
                const data = intent.data || {};
                const newProd = await db.insert(products).values({
                    userId: 'ai-assistant',
                    reference: data.reference || `REF-${Date.now().toString(36).toUpperCase()}`,
                    name: data.name || 'Producto Nuevo (IA)',
                    detail: 'Creado por Asistente Diamant AI',
                    price: data.price || 0,
                    quantity: data.quantity || 1,
                    // Evita el error FOREIGN KEY si el bot intenta enviar un '1'
                    categoryId: (typeof data.categoryId === 'string' && data.categoryId.length > 10) ? data.categoryId : null,
                }).returning();
                return jsonResponse(`✅ ¡Producto creado!\n• Nombre: ${newProd[0].name}\n• Ref: ${newProd[0].reference}\n• Precio: $${newProd[0].price?.toLocaleString()}\n• Stock: ${newProd[0].quantity}`);
            }

            case 'SEARCH_PRODUCT': {
                const q = (intent.query || '').trim();
                const keywords = q.split(/\s+/).filter(Boolean);

                let results;
                if (keywords.length > 0) {
                    const conditions = keywords.map((kw: string) =>
                        sql`(${products.name} LIKE ${'%' + kw + '%'} OR ${products.reference} LIKE ${'%' + kw + '%'})`
                    );
                    const finalCondition = sql.join(conditions, sql` AND `);

                    results = await db.select().from(products)
                        .where(finalCondition)
                        .limit(8);
                } else {
                    results = await db.select().from(products).limit(8);
                }

                if (results.length === 0) {
                    return jsonResponse(`🔍 No encontré productos que coincidan con "${q}".`);
                }
                const list = results.map((p: any) => `• ${p.name} (Ref: ${p.reference}) - $${p.price?.toLocaleString()} - Stock: ${p.quantity}`).join('\n');
                return jsonResponse(`🔍 Encontré ${results.length} producto(s):\n${list}`);
            }

            case 'UPDATE_STOCK': {
                const ref = intent.reference || '';
                const prod = await db.select().from(products).where(eq(products.reference, ref)).limit(1);
                if (prod.length === 0) {
                    return jsonResponse(`❌ No encontré un producto con referencia "${ref}".`);
                }
                await db.update(products).set({ quantity: intent.newQuantity }).where(eq(products.id, prod[0].id));
                return jsonResponse(`✅ Stock actualizado!\n• ${prod[0].name} ahora tiene ${intent.newQuantity} unidades.`);
            }

            case 'UPDATE_PRICE': {
                const ref = intent.reference || '';
                const prod = await db.select().from(products).where(eq(products.reference, ref)).limit(1);
                if (prod.length === 0) {
                    return jsonResponse(`❌ No encontré un producto con referencia "${ref}".`);
                }
                await db.update(products).set({ price: intent.newPrice }).where(eq(products.id, prod[0].id));
                return jsonResponse(`✅ Precio actualizado!\n• ${prod[0].name} ahora cuesta $${intent.newPrice?.toLocaleString()}.`);
            }

            case 'DELETE_PRODUCT': {
                const ref = intent.reference || '';
                const prod = await db.select().from(products).where(eq(products.reference, ref)).limit(1);
                if (prod.length === 0) {
                    return jsonResponse(`❌ No encontré un producto con referencia "${ref}".`);
                }
                await db.delete(products).where(eq(products.id, prod[0].id));
                return jsonResponse(`🗑️ Producto eliminado: ${prod[0].name} (Ref: ${prod[0].reference}).`);
            }

            case 'CREATE_INVOICE': {
                const data = intent.data || {};
                const customerName = data.customerName || 'Cliente General';
                const customerDoc = data.customerDoc || 'N/A';
                const itemsToInvoice = data.items || [];

                if (itemsToInvoice.length === 0) {
                    return jsonResponse(`⚠️ No indicaste qué productos facturar. ¿Qué producto deseas?`);
                }

                try {
                    // Start database transaction async
                    const invoiceResult = await db.transaction(async (tx) => {
                        let totalAmount = 0;
                        const validItems = [];

                        // Validate and prepare items
                        for (const item of itemsToInvoice) {
                            const prodArray = await tx.select().from(products).where(eq(products.reference, item.reference));
                            const prod = prodArray[0];

                            if (!prod) {
                                throw new Error(`El producto con referencia ${item.reference} no fue encontrado.`);
                            }
                            if (prod.quantity < item.quantity) {
                                throw new Error(`Stock insuficiente para ${prod.name}. Solo hay ${prod.quantity} unidades, intentaste vender ${item.quantity}.`);
                            }

                            const subtotal = prod.price * item.quantity;
                            totalAmount += subtotal;

                            validItems.push({
                                productId: prod.id,
                                quantity: item.quantity,
                                unitPrice: prod.price,
                                subtotal: subtotal,
                                name: prod.name
                            });
                        }

                        // Create invoice (set to 'paid' immediately)
                        const newInvoice = await tx.insert(invoices).values({
                            userId: 'ai-assistant',
                            customerName,
                            customerDoc,
                            customerEmail: '',
                            total: totalAmount,
                            status: 'paid',
                        }).returning({ id: invoices.id });

                        if (!newInvoice || newInvoice.length === 0) throw new Error("Error interno al registrar factura.");
                        const createdId = newInvoice[0].id;

                        // Insert items and reduce stock
                        for (const vi of validItems) {
                            await tx.insert(invoiceItems).values({
                                invoiceId: createdId,
                                productId: vi.productId,
                                quantity: vi.quantity,
                                unitPrice: vi.unitPrice,
                                subtotal: vi.subtotal,
                            });

                            await tx.update(products)
                                .set({ quantity: sql`${products.quantity} - ${vi.quantity}` })
                                .where(eq(products.id, vi.productId));
                        }

                        return { id: createdId, total: totalAmount };
                    });

                    const idPrefix = invoiceResult.id.split('-')[0].toUpperCase();
                    return jsonResponse(`✅ ¡Factura **#${idPrefix}** generada!\n• Cliente: ${customerName}\n• Total: $${invoiceResult.total.toLocaleString()}\n<br><a href="/invoices" class="mt-3 inline-flex items-center gap-1.5 bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-neutral-800 transition-colors">📄 Ver Facturas y Descargar PDF</a>`);

                } catch (e: any) {
                    return jsonResponse(`❌ No se pudo generar la factura: ${e.message}`);
                }
            }

            case 'CHAT':
            default:
                return jsonResponse(intent.message || "¡Hola! Soy tu asistente Diamant AI. Puedo crear, buscar, editar o eliminar productos. También puedo actualizar precios y stock. ¡Solo dime qué necesitas!");
        }

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return new Response(JSON.stringify({
            response: `⚠️ Error del servidor: ${error.message || 'Error desconocido'}. Verifica la API Key y la conexión.`
        }), { status: 200 });
    }
};

function jsonResponse(text: string) {
    return new Response(JSON.stringify({ response: text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
