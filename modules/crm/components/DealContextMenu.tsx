"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { Edit, Trash2, Mail, Phone, Copy, CopyPlus, Archive, MoreVertical } from "lucide-react"
import { toast } from "sonner"

interface DealContextMenuProps {
    children: React.ReactNode
    deal: any
    onEdit: () => void
    onDelete: () => void
    onDuplicate?: () => void
    onArchive?: () => void
}

export function DealContextMenu({ children, deal, onEdit, onDelete, onDuplicate, onArchive }: DealContextMenuProps) {
    const handleCopyEmail = () => {
        if (deal.contactEmail) {
            navigator.clipboard.writeText(deal.contactEmail)
            toast.success("Email copiado al portapapeles")
        } else {
            toast.error("No hay correo para copiar")
        }
    }

    const handleDuplicate = () => {
        if (onDuplicate) {
            onDuplicate()
        } else {
            toast.error("Función duplicar no disponible")
        }
    }

    return (
        <div className="relative group/context w-full h-full">
            {children}
            <div className="absolute top-3 right-4 opacity-0 group-hover/context:opacity-100 transition-opacity z-20">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-1.5 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-sm hover:bg-white text-gray-400 hover:text-gray-800 transition-all hover:scale-110 active:scale-95 z-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    {/* Usamos Portal para sacar el menú del flujo de dnd-kit */}
                    <DropdownMenuPortal>
                        <DropdownMenuContent
                            className="w-60 p-2 bg-white/95 backdrop-blur-xl border border-gray-100/60 shadow-[0_12px_45px_-12px_rgba(0,0,0,0.15)] rounded-2xl animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-4"
                            align="end"
                            sideOffset={6}
                        >
                            <DropdownMenuItem
                                onSelect={() => setTimeout(() => onEdit(), 50)}
                                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-blue-50 focus:bg-blue-50 text-gray-700 font-medium"
                            >
                                <div className="p-1.5 rounded-md bg-blue-100/50 text-blue-600 group-hover:scale-110 transition-transform">
                                    <Edit className="h-3.5 w-3.5" />
                                </div>
                                Editar Oportunidad
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onSelect={() => setTimeout(() => handleDuplicate(), 50)}
                                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-emerald-50 focus:bg-emerald-50 text-gray-700 font-medium mt-1"
                            >
                                <div className="p-1.5 rounded-md bg-emerald-100/50 text-emerald-600 group-hover:scale-110 transition-transform">
                                    <CopyPlus className="h-3.5 w-3.5" />
                                </div>
                                Duplicar Negocio
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onSelect={() => setTimeout(() => handleCopyEmail(), 50)}
                                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-gray-100 focus:bg-gray-100 text-gray-700 font-medium mt-1"
                            >
                                <div className="p-1.5 rounded-md bg-gray-200/50 text-gray-600 group-hover:scale-110 transition-transform">
                                    <Copy className="h-3.5 w-3.5" />
                                </div>
                                Copiar Email
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1.5 bg-gray-100/80" />

                            {deal.contactEmail && (
                                <DropdownMenuItem
                                    onSelect={() => {
                                        setTimeout(() => {
                                            window.location.href = `mailto:${deal.contactEmail}`;
                                        }, 50);
                                    }}
                                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-indigo-50 focus:bg-indigo-50 text-gray-700 font-medium"
                                >
                                    <div className="p-1.5 rounded-md bg-indigo-100/50 text-indigo-600 group-hover:scale-110 transition-transform">
                                        <Mail className="h-3.5 w-3.5" />
                                    </div>
                                    Enviar Correo
                                </DropdownMenuItem>
                            )}

                            {deal.contactPhone && (
                                <DropdownMenuItem
                                    onSelect={() => {
                                        setTimeout(() => {
                                            window.location.href = `tel:${deal.contactPhone}`;
                                        }, 50);
                                    }}
                                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-teal-50 focus:bg-teal-50 text-gray-700 font-medium mt-1"
                                >
                                    <div className="p-1.5 rounded-md bg-teal-100/50 text-teal-600 group-hover:scale-110 transition-transform">
                                        <Phone className="h-3.5 w-3.5" />
                                    </div>
                                    Llamar Contacto
                                </DropdownMenuItem>
                            )}

                            {onArchive && (
                                <>
                                    <DropdownMenuSeparator className="my-1.5 bg-gray-100/80" />
                                    <DropdownMenuItem
                                        onSelect={() => setTimeout(() => onArchive(), 50)}
                                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-amber-50 focus:bg-amber-50 text-amber-700 font-medium"
                                    >
                                        <div className="p-1.5 rounded-md bg-amber-100/50 text-amber-600 group-hover:scale-110 transition-transform">
                                            <Archive className="h-3.5 w-3.5" />
                                        </div>
                                        Archivar Deal
                                    </DropdownMenuItem>
                                </>
                            )}

                            <DropdownMenuSeparator className="my-1.5 bg-gray-100/80" />

                            <DropdownMenuItem
                                onSelect={() => setTimeout(() => onDelete(), 50)}
                                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-red-50 focus:bg-red-50 text-red-700 font-medium"
                            >
                                <div className="p-1.5 rounded-md bg-red-100/50 text-red-600 group-hover:scale-110 transition-transform">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </div>
                                <span className="font-bold">Eliminar Definitivamente</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenuPortal>
                </DropdownMenu>
            </div>
        </div>
    )
}
