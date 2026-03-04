import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Save, Box, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

const productSchema = z.object({
    reference: z.string().min(1, 'La referencia es obligatoria'),
    name: z.string().min(1, 'El nombre es obligatorio'),
    detail: z.string().optional(),
    price: z.number({ invalid_type_error: 'Debe ser un número' }).min(0, 'No puede ser negativo'),
    quantity: z.number({ invalid_type_error: 'Debe ser un número' }).min(0, 'No puede ser negativo'),
    // categoryId: z.string().optional(), // Simplificado por ahora
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    product?: any | null;
    onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, product, onSuccess }) => {
    const isEditing = !!product;
    const [formError, setFormError] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            reference: '',
            name: '',
            detail: '',
            price: 0,
            quantity: 0,
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (product) {
                reset({
                    reference: product.reference,
                    name: product.name,
                    detail: product.detail || '',
                    price: product.price,
                    quantity: product.quantity,
                });
            } else {
                reset({ reference: '', name: '', detail: '', price: 0, quantity: 0 });
            }
        }
    }, [isOpen, product, reset]);

    const onSubmit = async (data: ProductFormData) => {
        setFormError(null);
        try {
            const url = isEditing ? `/api/products/${product.id}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || 'Error al guardar');
            }
            setFormError(null);
            onSuccess();
        } catch (error: any) {
            setFormError(error.message || 'Error guardando el producto. ¿Referencia duplicada?');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40 transition-opacity"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col border border-neutral-200/60 max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-neutral-900 text-white rounded-xl shadow-sm">
                                    <Box size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-neutral-900 leading-tight">
                                        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                                    </h2>
                                    <p className="text-xs text-neutral-500 font-medium">
                                        {isEditing ? 'Modifica los detalles del producto seleccionado' : 'Añade un nuevo artículo al inventario'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2 sm:col-span-1 border-none">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 ml-1">Referencia</label>
                                        <input
                                            {...register('reference')}
                                            className={cn(
                                                "w-full px-4 py-3 bg-neutral-100/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm font-medium",
                                                errors.reference ? "border-red-300 focus:ring-red-500" : "border-neutral-200"
                                            )}
                                            placeholder="Ej: BOL-001"
                                        />
                                        {errors.reference && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.reference.message}</p>}
                                    </div>

                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 ml-1">Stock Actual</label>
                                        <input
                                            type="number"
                                            {...register('quantity', { valueAsNumber: true })}
                                            className={cn(
                                                "w-full px-4 py-3 bg-neutral-100/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm font-bold",
                                                errors.quantity ? "border-red-300 focus:ring-red-500" : "border-neutral-200"
                                            )}
                                            placeholder="0"
                                        />
                                        {errors.quantity && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.quantity.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 ml-1">Nombre Único</label>
                                    <input
                                        {...register('name')}
                                        className={cn(
                                            "w-full px-4 py-3 bg-neutral-100/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm font-medium",
                                            errors.name ? "border-red-300 focus:ring-red-500" : "border-neutral-200"
                                        )}
                                        placeholder="Bolígrafo Montblanc Meisterstück"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 ml-1">Precio Unitario ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('price', { valueAsNumber: true })}
                                        className={cn(
                                            "w-full px-4 py-3 bg-neutral-100/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all text-sm font-bold",
                                            errors.price ? "border-red-300 focus:ring-red-500" : "border-neutral-200"
                                        )}
                                        placeholder="0.00"
                                    />
                                    {errors.price && <p className="text-red-500 text-xs mt-1 font-medium ml-1">{errors.price.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5 ml-1">Detalle / Notas (Opcional)</label>
                                    <textarea
                                        {...register('detail')}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-neutral-100/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all resize-none text-sm"
                                        placeholder="Color, tipo de tinta, ubicación..."
                                    />
                                </div>

                            </form>

                            {/* Error inline */}
                            <AnimatePresence>
                                {formError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                                    >
                                        <AlertCircle size={16} className="shrink-0" />
                                        <span>{formError}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="product-form"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-white text-sm font-bold rounded-xl shadow-md hover:bg-neutral-800 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
