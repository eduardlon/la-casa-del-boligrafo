import React, { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, PackageOpen, Loader2, ArrowUpDown, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { ProductForm } from './ProductForm';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

export const ProductManager = () => {
    const { data: products, error, mutate, isLoading } = useSWR('/api/products', fetcher, { revalidateOnFocus: false, dedupingInterval: 30000 });
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    // Delete confirmation modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultMessage, setResultMessage] = useState({ title: '', text: '', success: true });

    let filteredProducts = products?.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.reference.toLowerCase().includes(search.toLowerCase())
    ) || [];

    if (sortConfig !== null) {
        filteredProducts.sort((a: any, b: any) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (typeof aVal === 'string') {
                return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return 0;
        });
    }

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const openDeleteConfirm = (product: any) => {
        setDeletingProduct(product);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!deletingProduct) return;
        setShowDeleteModal(false);
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/products/${deletingProduct.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar');
            setResultMessage({ title: '¡Producto Eliminado!', text: `"${deletingProduct.name}" fue eliminado correctamente del inventario.`, success: true });
            setShowResultModal(true);
            mutate();
        } catch (err: any) {
            setResultMessage({ title: 'Error', text: err.message || 'No se pudo eliminar el producto.', success: false });
            setShowResultModal(true);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col h-full space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por referencia o nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none shadow-sm transition-all"
                        />
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl hover:bg-neutral-800 transition-all font-medium shadow-md w-full sm:w-auto justify-center"
                    >
                        <Plus size={18} />
                        Nuevo Producto
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-neutral-400 space-x-2">
                            <Loader2 className="animate-spin" size={24} />
                            <span>Cargando inventario...</span>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center text-red-500">Error cargando inventario.</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-12 text-center">
                            <div className="bg-neutral-100 p-4 rounded-full mb-4">
                                <PackageOpen size={32} className="text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-1">Sin resultados</h3>
                            <p className="text-sm max-w-sm">No se encontraron productos que coincidan con tu búsqueda, o el inventario está vacío.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-20rem)]">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:text-neutral-900 transition-colors group" onClick={() => handleSort('reference')}>
                                            <div className="flex items-center gap-1">Ref <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                                        </th>
                                        <th className="px-6 py-4 font-medium cursor-pointer hover:text-neutral-900 transition-colors group" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-1">Producto <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                                        </th>
                                        <th className="px-6 py-4 font-medium text-right cursor-pointer hover:text-neutral-900 transition-colors group" onClick={() => handleSort('price')}>
                                            <div className="flex items-center justify-end gap-1"><ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /> Precio</div>
                                        </th>
                                        <th className="px-6 py-4 font-medium text-center cursor-pointer hover:text-neutral-900 transition-colors group" onClick={() => handleSort('quantity')}>
                                            <div className="flex items-center justify-center gap-1">Stock <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                                        </th>
                                        <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    <AnimatePresence>
                                        {filteredProducts.map((product: any) => {
                                            const isLowStock = product.quantity > 0 && product.quantity < 5;
                                            const isOutOfStock = product.quantity === 0;

                                            return (
                                                <motion.tr
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{
                                                        layout: { type: 'tween', duration: 0.2, ease: 'easeOut' },
                                                        opacity: { duration: 0.12 }
                                                    }}
                                                    key={product.id}
                                                    className="hover:bg-neutral-50/50 transition-colors group"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-500">
                                                        {product.reference}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-neutral-900 line-clamp-1">{product.name}</p>
                                                        {product.detail && <p className="text-xs text-neutral-500 truncate max-w-xs">{product.detail}</p>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-neutral-900 text-right">
                                                        ${product.price?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={cn(
                                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
                                                            isOutOfStock ? "bg-red-100 text-red-700" :
                                                                isLowStock ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                                                        )}>
                                                            {product.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleOpenEdit(product)}
                                                                className="p-1.5 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                disabled={isDeleting}
                                                                onClick={() => openDeleteConfirm(product)}
                                                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Product Form Modal */}
                <ProductForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={editingProduct}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        mutate();
                    }}
                />
            </div>

            {/* ───── MODAL: Confirmar Eliminación ───── */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6 text-center">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={28} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 mb-2">¿Eliminar producto?</h3>
                    <p className="text-sm text-neutral-500 mb-1">
                        <strong>{deletingProduct?.name}</strong>
                    </p>
                    <p className="text-sm text-neutral-500 mb-6">
                        Ref: {deletingProduct?.reference} — Esta acción <strong>no se puede deshacer</strong>.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteModal(false)}
                            className="flex-1 py-3 bg-neutral-100 text-neutral-800 font-bold rounded-xl hover:bg-neutral-200 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleDelete}
                            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg">
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ───── MODAL: Resultado ───── */}
            <Modal isOpen={showResultModal} onClose={() => setShowResultModal(false)}>
                <div className="p-6 text-center">
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4", resultMessage.success ? "bg-emerald-100" : "bg-red-100")}>
                        {resultMessage.success ? <CheckCircle2 size={28} className="text-emerald-600" /> : <X size={28} className="text-red-600" />}
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 mb-2">{resultMessage.title}</h3>
                    <p className="text-sm text-neutral-500 mb-6">{resultMessage.text}</p>
                    <button onClick={() => setShowResultModal(false)}
                        className="w-full py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all">
                        Cerrar
                    </button>
                </div>
            </Modal>
        </>
    );
};
