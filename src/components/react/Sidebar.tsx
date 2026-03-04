import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, PackageSearch, Receipt, FileText, Settings, ChevronLeft, ChevronRight, PenTool } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
    currentPath: string;
}

const MENU_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Inventario', icon: PackageSearch, href: '/inventory' },
    { name: 'Facturación POS', icon: Receipt, href: '/pos' },
    { name: 'Facturas', icon: FileText, href: '/invoices' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 72 : 240 }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
            className="h-full flex flex-col bg-white border-r border-neutral-200 relative overflow-hidden"
            style={{ overflow: 'hidden' }}
        >
            {/* Logo Header */}
            <div className="flex items-center h-16 px-3 border-b border-neutral-100 shrink-0">
                {isCollapsed ? (
                    <div className="w-full flex justify-center">
                        <div className="p-1.5 bg-neutral-900 text-white rounded-lg">
                            <PenTool size={18} />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2.5 font-bold text-neutral-800 text-sm overflow-hidden whitespace-nowrap">
                        <div className="p-1.5 bg-neutral-900 text-white rounded-lg shrink-0">
                            <PenTool size={18} />
                        </div>
                        <span className="truncate">La Casa del Bolígrafo</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-hidden">
                {MENU_ITEMS.map((item) => {
                    const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
                    return (
                        <a
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={cn(
                                "flex items-center gap-3 rounded-xl transition-all font-medium text-sm relative overflow-hidden",
                                isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                                isActive
                                    ? "bg-neutral-900 text-white shadow-md shadow-neutral-900/10"
                                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                            )}
                        >
                            <item.icon size={19} className={cn("shrink-0", isActive ? "text-white" : "text-neutral-500")} />
                            {!isCollapsed && (
                                <span className="truncate whitespace-nowrap overflow-hidden">{item.name}</span>
                            )}
                        </a>
                    );
                })}
            </nav>

            {/* Bottom: Settings */}
            <div className="px-2 pb-4 border-t border-neutral-100 pt-3 shrink-0 overflow-hidden">
                <button className={cn(
                    "flex items-center gap-3 rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors w-full overflow-hidden",
                    isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                )}>
                    <Settings size={19} className="shrink-0 text-neutral-500" />
                    {!isCollapsed && <span className="text-sm font-medium truncate">Configuración</span>}
                </button>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-0 top-[68px] bg-white border border-neutral-200 rounded-l-lg p-1 text-neutral-400 hover:text-neutral-900 shadow-sm z-10 hidden md:flex items-center justify-center transition-colors"
                style={{ width: 20, height: 28 }}
            >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>
        </motion.div>
    );
};
