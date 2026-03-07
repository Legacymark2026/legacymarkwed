"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
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
            toast.success("Email copied to clipboard")
        } else {
            toast.error("No email to copy")
        }
    }

    const handleDuplicate = () => {
        if (onDuplicate) {
            onDuplicate()
        } else {
            // Default: just copy deal info to clipboard
            navigator.clipboard.writeText(JSON.stringify({
                title: `${deal.title} (Copy)`,
                value: deal.value,
                priority: deal.priority,
                contactName: deal.contactName,
                contactEmail: deal.contactEmail,
            }))
            toast.success("Deal info copied for duplication")
        }
    }

    return (
        <div className="relative group/context">
            {children}
            <div className="absolute top-2 right-16 opacity-0 group-hover/context:opacity-100 transition-opacity z-20">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-1 flex items-center justify-center bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Deal
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(); }}>
                            <CopyPlus className="mr-2 h-4 w-4" />
                            Duplicar Deal
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyEmail(); }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {deal.contactEmail && (
                            <DropdownMenuItem asChild>
                                <a href={`mailto:${deal.contactEmail}`} onClick={(e) => e.stopPropagation()}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Enviar Email
                                </a>
                            </DropdownMenuItem>
                        )}
                        {deal.contactPhone && (
                            <DropdownMenuItem asChild>
                                <a href={`tel:${deal.contactPhone}`} onClick={(e) => e.stopPropagation()}>
                                    <Phone className="mr-2 h-4 w-4" />
                                    Llamar Contacto
                                </a>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {onArchive && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }} className="text-amber-600 focus:bg-amber-50 focus:text-amber-700">
                                <Archive className="mr-2 h-4 w-4" />
                                Archivar Deal
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar Deal
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
