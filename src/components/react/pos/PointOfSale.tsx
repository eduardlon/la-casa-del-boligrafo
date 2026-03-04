import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingCart, User, FileText, CheckCircle2, X, AlertTriangle, Search } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { generateInvoicePDF } from '../../../lib/pdfGenerator';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CartItem {
    product: any;
    quantity: number;
}

// ───── MODAL GENÉRICO ─────
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

export const PointOfSale = () => {
    const { data: products, mutate } = useSWR('/api/products', fetcher, { revalidateOnFocus: false, dedupingInterval: 30000 });
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Customer info
    const [customerName, setCustomerName] = useState('');
    const [customerDoc, setCustomerDoc] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerCity, setCustomerCity] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modals
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);

    const filteredProducts = products?.filter((p: any) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.reference.toLowerCase().includes(searchQuery.toLowerCase());
        return p.quantity > 0 && matchesSearch;
    }) || [];

    const addToCart = (product: any) => {
        setCart((prev) => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.quantity) return prev;
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, qty: number, maxStock: number) => {
        if (qty <= 0) return removeFromCart(productId);
        if (qty > maxStock) qty = maxStock;
        setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: qty } : item));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const cartTotal = useMemo(() => cart.reduce((total, item) => total + (item.product.price * item.quantity), 0), [cart]);

    const handleGenerateClick = () => {
        if (cart.length === 0 || !customerName.trim()) return;
        setShowConfirmModal(true);
    };

    const handleCheckout = async () => {
        setShowConfirmModal(false);
        setIsSubmitting(true);

        try {
            const payload = {
                customerName,
                customerDoc,
                customerEmail,
                customerPhone,
                customerAddress,
                customerCity,
                total: cartTotal,
                items: cart.map(item => ({
                    productId: item.product.id,
                    reference: item.product.reference,
                    name: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.product.price,
                    subtotal: item.product.price * item.quantity
                }))
            };

            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Error al generar factura');
            const data = await res.json();

            setSuccessData({ invoiceId: data.invoiceId, payload: { ...payload, invoiceId: data.invoiceId } });
            setShowSuccessModal(true);
            setCart([]);
            setCustomerName('');
            setCustomerDoc('');
            setCustomerEmail('');
            setCustomerPhone('');
            setCustomerAddress('');
            setCustomerCity('');
            mutate();

        } catch (error) {
            // Error modal en lugar de alert
            setSuccessData({ error: true });
            setShowSuccessModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-10rem)] md:min-h-0">

                {/* Lado Izquierdo: Catálogo */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden min-h-[350px] lg:h-[calc(100vh-14rem)] lg:flex-none">
                    <div className="p-4 border-b border-neutral-100 bg-neutral-900 text-white flex flex-col gap-3 shrink-0">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm uppercase tracking-wider">Catálogo de Productos</h3>
                            <span className="text-xs text-neutral-400">{filteredProducts.length} disponibles</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o referencia..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-400 focus:ring-2 focus:ring-white focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-neutral-50/30">
                        {!products ? (
                            <div className="text-center text-neutral-400 mt-10 text-sm">Cargando inventario...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center text-neutral-400 mt-10 text-sm">No hay productos en stock.</div>
                        ) : (
                            filteredProducts.map((product: any) => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xl cursor-pointer hover:border-neutral-900 hover:shadow-md transition-all group active:scale-[0.98]"
                                >
                                    <div className="min-w-0 flex-1 pr-3">
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase">{product.reference}</p>
                                        <p className="text-sm font-bold text-neutral-900 truncate">{product.name}</p>
                                        <p className="text-[11px] text-emerald-600 font-medium">Stock: {product.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <p className="font-bold text-neutral-900 text-sm">${product.price?.toLocaleString()}</p>
                                        <div className="p-1.5 bg-neutral-100 text-neutral-600 rounded-lg group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                                            <Plus size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Lado Derecho: Resumen */}
                <div className="w-full lg:w-[420px] flex flex-col bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden lg:h-[calc(100vh-14rem)] lg:flex-none">

                    {/* Info del Cliente */}
                    <div className="p-4 border-b border-neutral-100 bg-neutral-50/80 shrink-0">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2 mb-3">
                            <User size={13} /> Datos del Cliente
                        </h3>
                        <div className="space-y-2">
                            <input type="text" placeholder="Razón Social / Nombre *" value={customerName} onChange={e => setCustomerName(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="NIT / CC" value={customerDoc} onChange={e => setCustomerDoc(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
                                <input type="text" placeholder="Teléfono" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
                            </div>
                            <input type="email" placeholder="Email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Dirección" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
                                <input type="text" placeholder="Ciudad, Depart." value={customerCity} onChange={e => setCustomerCity(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Ítems del Carrito */}
                    <div className="flex-1 overflow-y-auto p-4 min-h-0">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-2 mb-3">
                            <ShoppingCart size={13} /> Ítems en Factura ({cart.length})
                        </h3>

                        {cart.length === 0 ? (
                            <div className="text-center py-8 flex flex-col items-center">
                                <ShoppingCart size={28} className="text-neutral-200 mb-2" />
                                <p className="text-xs text-neutral-400">Selecciona productos del catálogo</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div key={item.product.id} className="bg-neutral-50 border border-neutral-100 rounded-xl p-3">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase">{item.product.reference}</p>
                                                <p className="text-sm font-bold text-neutral-800 leading-tight truncate">{item.product.name}</p>
                                            </div>
                                            <button onClick={() => removeFromCart(item.product.id)} className="text-neutral-300 hover:text-red-500 transition-colors shrink-0 p-0.5">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-white">
                                                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.product.quantity)}
                                                    className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 transition-colors">
                                                    <Minus size={12} />
                                                </button>
                                                <input type="number" value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1, item.product.quantity)}
                                                    className="w-10 text-center text-xs font-bold py-1 focus:outline-none bg-white" />
                                                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.product.quantity)}
                                                    className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 transition-colors">
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <p className="text-sm font-black text-neutral-900">${(item.product.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resumen Final */}
                    <div className="p-4 bg-neutral-900 text-white shrink-0">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-neutral-400 font-medium text-sm">Total</span>
                            <span className="text-2xl font-black">${cartTotal.toLocaleString()}</span>
                        </div>
                        <button
                            disabled={cart.length === 0 || !customerName.trim() || isSubmitting}
                            onClick={handleGenerateClick}
                            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white text-neutral-900 hover:bg-neutral-100 active:scale-[0.98]"
                        >
                            <FileText size={18} />
                            {isSubmitting ? 'Generando...' : 'Generar Factura'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ───── MODAL: Confirmar Generación ───── */}
            <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
                <div className="p-6 text-center">
                    <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle size={28} className="text-neutral-700" />
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 mb-2">¿Generar factura?</h3>
                    <p className="text-sm text-neutral-500 mb-1">
                        Se creará una factura a nombre de <strong>{customerName}</strong>
                    </p>
                    <p className="text-sm text-neutral-500 mb-6">
                        por un total de <strong>${cartTotal.toLocaleString()}</strong> con {cart.length} producto(s).
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowConfirmModal(false)}
                            className="flex-1 py-3 bg-neutral-100 text-neutral-800 font-bold rounded-xl hover:bg-neutral-200 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleCheckout}
                            className="flex-1 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all shadow-lg">
                            Confirmar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ───── MODAL: Éxito / Error ───── */}
            <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
                <div className="p-6 text-center">
                    {successData?.error ? (
                        <>
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={28} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-black text-neutral-900 mb-2">Error al generar</h3>
                            <p className="text-sm text-neutral-500 mb-6">Hubo un problema al procesar la factura. Intenta de nuevo.</p>
                            <button onClick={() => setShowSuccessModal(false)}
                                className="w-full py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all">
                                Cerrar
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={28} className="text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-black text-neutral-900 mb-2">¡Factura Generada!</h3>
                            <p className="text-sm text-neutral-500 mb-1">
                                Factura <strong>#{successData?.invoiceId?.split('-')[0]?.toUpperCase()}</strong>
                            </p>
                            <p className="text-sm text-neutral-500 mb-6">
                                Total: <strong>${successData?.payload?.total?.toLocaleString()}</strong>
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowSuccessModal(false); generateInvoicePDF(successData.payload); }}
                                    className="flex-1 py-3 bg-neutral-100 text-neutral-800 font-bold rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
                                    <FileText size={16} /> PDF
                                </button>
                                <a href="/invoices"
                                    className="flex-1 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all text-center">
                                    Ir a Facturas
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
};
