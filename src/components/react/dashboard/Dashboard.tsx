import React from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { PackageSearch, Receipt, TrendingUp, Boxes, Loader2, AlertCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const Dashboard = () => {
    const { data: metrics, error, isLoading } = useSWR('/api/dashboard', fetcher, { refreshInterval: 10000 });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    if (error) {
        return (
            <div className="flex bg-red-50 text-red-600 p-6 rounded-2xl items-center gap-3">
                <AlertCircle /> Error al cargar los datos del panel.
            </div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-neutral-100 rounded-xl text-neutral-600">
                            <Boxes size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-neutral-500 text-sm font-medium mb-1">Productos en Inventario</h3>
                        <p className="text-3xl font-black text-neutral-900 flex items-center gap-2">
                            {isLoading ? <Loader2 className="animate-spin text-neutral-300" size={24} /> : metrics?.totalProducts || 0}
                        </p>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-neutral-900 rounded-xl text-white shadow-md">
                            <Receipt size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-neutral-500 text-sm font-medium mb-1">Facturas Emitidas Hoy</h3>
                        <p className="text-3xl font-black text-neutral-900 flex items-center gap-2">
                            {isLoading ? <Loader2 className="animate-spin text-neutral-300" size={24} /> : metrics?.invoicesTodayCount || 0}
                        </p>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-neutral-500 text-sm font-medium mb-1">Ingresos Hoy</h3>
                        <p className="text-3xl font-black text-emerald-600 flex items-center gap-2">
                            {isLoading ? <Loader2 className="animate-spin text-emerald-200" size={24} /> : `$${(metrics?.totalSalesToday || 0).toLocaleString()}`}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Banner Decorativo */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[300px]">
                <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-4 w-fit tracking-wide uppercase">Operaciones en línea</span>
                    <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-4 tracking-tight leading-tight">Gestiona inventario y ventas fácilmente.</h2>
                    <p className="text-neutral-600 mb-8 leading-relaxed max-w-md">El sistema inteligente deduce automáticamente el stock en cada venta y Diamant AI te asiste por voz. Todo fluye en tiempo real.</p>

                    <div className="flex items-center gap-4">
                        <a href="/inventory" className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                            Inventario
                        </a>
                        <a href="/pos" className="px-6 py-3 bg-white border-2 border-neutral-200 hover:border-neutral-300 text-neutral-700 font-bold rounded-xl transition-all">
                            Facturación POS
                        </a>
                    </div>
                </div>
                <div className="hidden md:flex md:w-1/2 relative bg-neutral-50 items-center justify-center p-8 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 1, type: "spring" }}
                        className="relative w-full max-w-xs aspect-square"
                    >
                        <div className="absolute top-10 right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl mix-blend-multiply animate-pulse"></div>
                        <div className="absolute bottom-10 left-10 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl mix-blend-multiply delay-1000"></div>
                        <div className="absolute inset-4 bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2rem] shadow-xl flex items-center justify-center p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <div className="w-full space-y-4">
                                <div className="h-6 bg-neutral-200 rounded animate-pulse"></div>
                                <div className="h-3 bg-neutral-200 rounded w-full animate-pulse opacity-80" style={{ animationDelay: '0.1s' }}></div>
                                <div className="h-3 bg-neutral-200 rounded w-4/5 animate-pulse opacity-60" style={{ animationDelay: '0.2s' }}></div>
                                <div className="mt-8 pt-6 border-t border-neutral-100 flex gap-2">
                                    <div className="h-8 w-16 bg-neutral-900/10 rounded-lg"></div>
                                    <div className="h-8 w-16 bg-neutral-200 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};
