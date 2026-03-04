import React, { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Receipt, FileText, CheckCircle2, Loader2, Clock, AlertCircle, Trash2, X, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { generateInvoicePDF } from '../../../lib/pdfGenerator';

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

export const InvoiceManager = () => {
    const { data: invoices, error, mutate, isLoading } = useSWR('/api/invoices/get', fetcher, { revalidateOnFocus: false, dedupingInterval: 30000 });
    const [search, setSearch] = useState('');
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    // Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultMessage, setResultMessage] = useState({ title: '', text: '', success: true });

    const filteredInvoices = invoices?.filter((inv: any) =>
        inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (inv.customerDoc && inv.customerDoc.toLowerCase().includes(search.toLowerCase())) ||
        inv.id.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const openDeleteConfirm = (inv: any) => {
        setSelectedInvoice(inv);
        setShowDeleteModal(true);
    };

    const handleDeleteInvoice = async () => {
        if (!selectedInvoice) return;
        setShowDeleteModal(false);
        setDeletingId(selectedInvoice.id);
        try {
            const res = await fetch(`/api/invoices/${selectedInvoice.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar factura');
            setResultMessage({ title: 'Factura Eliminada', text: `La factura #${selectedInvoice.id.split('-')[0].toUpperCase()} fue eliminada correctamente.`, success: true });
            setShowResultModal(true);
            mutate();
        } catch (err: any) {
            setResultMessage({ title: 'Error', text: err.message, success: false });
            setShowResultModal(true);
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownloadPDF = (invoice: any) => {
        const payload = {
            invoiceId: invoice.id,
            customerName: invoice.customerName,
            customerDoc: invoice.customerDoc,
            customerEmail: invoice.customerEmail || '',
            customerPhone: invoice.customerPhone || '',
            customerAddress: invoice.customerAddress || '',
            customerCity: invoice.customerCity || '',
            total: invoice.total,
            items: invoice.items.map((it: any) => ({
                reference: it.reference || '',
                name: it.name || 'Producto',
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                subtotal: it.subtotal
            }))
        };
        generateInvoicePDF(payload);
    };

    return (
        <>
            <div className="flex flex-col h-full space-y-6">
                {/* Cabecera */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por cliente o ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:outline-none shadow-sm transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Lista de Facturas */}
                <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-neutral-400 space-x-2">
                            <Loader2 className="animate-spin" size={24} />
                            <span>Cargando facturas...</span>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center text-red-500 gap-2">
                            <AlertCircle size={24} /> Error cargando facturas.
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-12 text-center">
                            <div className="bg-neutral-100 p-4 rounded-full mb-4">
                                <Receipt size={32} className="text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 mb-1">Sin facturas</h3>
                            <p className="text-sm max-w-sm">No se encontraron facturas.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Factura ID</th>
                                        <th className="px-6 py-4 font-medium">Cliente</th>
                                        <th className="px-6 py-4 font-medium text-right">Total</th>
                                        <th className="px-6 py-4 font-medium text-center">Estado</th>
                                        <th className="px-6 py-4 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    <AnimatePresence>
                                        {filteredInvoices.map((inv: any) => {
                                            const isPaid = inv.status === 'paid';
                                            return (
                                                <motion.tr
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    key={inv.id}
                                                    className="hover:bg-neutral-50/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-500">
                                                        #{inv.id.split('-')[0].toUpperCase()}
                                                        <div className="text-xs text-neutral-400 mt-1">{new Date(inv.createdAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-bold text-neutral-900">{inv.customerName}</p>
                                                        {inv.customerDoc && <p className="text-xs text-neutral-500">Doc: {inv.customerDoc}</p>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-neutral-900 text-right">
                                                        ${inv.total?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                                                            isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                                        )}>
                                                            {isPaid ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                            {isPaid ? 'Pagado' : 'Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleDownloadPDF(inv)}
                                                                className="p-2 text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-100 rounded-xl transition-all shadow-sm"
                                                                title="Descargar PDF"
                                                            >
                                                                <FileText size={16} />
                                                            </button>

                                                            <button
                                                                disabled={deletingId === inv.id}
                                                                onClick={() => openDeleteConfirm(inv)}
                                                                className="p-2 text-neutral-400 hover:text-red-600 border border-neutral-200 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                                                                title="Eliminar factura"
                                                            >
                                                                {deletingId === inv.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
            </div>


            {/* ───── MODAL: Confirmar Eliminación ───── */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <div className="p-6 text-center">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={28} className="text-red-600" />
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 mb-2">¿Eliminar factura?</h3>
                    <p className="text-sm text-neutral-500 mb-1">Factura <strong>#{selectedInvoice?.id?.split('-')[0]?.toUpperCase()}</strong></p>
                    <p className="text-sm text-neutral-500 mb-6">
                        Esta acción <strong>no se puede deshacer</strong>. La factura será eliminada permanentemente.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteModal(false)}
                            className="flex-1 py-3 bg-neutral-100 text-neutral-800 font-bold rounded-xl hover:bg-neutral-200 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={handleDeleteInvoice}
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
