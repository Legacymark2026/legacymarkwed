"use client"

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Edit, Trash2, Mail, Phone, Copy, CopyPlus, Archive } from "lucide-react"
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
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Deal
                </ContextMenuItem>
                {/* Phase 15: Duplicate Deal */}
                <ContextMenuItem onClick={handleDuplicate}>
                    <CopyPlus className="mr-2 h-4 w-4" />
                    Duplicate Deal
                </ContextMenuItem>
                <ContextMenuItem onClick={handleCopyEmail}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Email
                </ContextMenuItem>
                <ContextMenuSeparator />
                {deal.contactEmail && (
                    <ContextMenuItem asChild>
                        <a href={`mailto:${deal.contactEmail}`}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                        </a>
                    </ContextMenuItem>
                )}
                {deal.contactPhone && (
                    <ContextMenuItem asChild>
                        <a href={`tel:${deal.contactPhone}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Contact
                        </a>
                    </ContextMenuItem>
                )}
                <ContextMenuSeparator />
                {/* Phase 15: Archive instead of Delete */}
                {onArchive && (
                    <ContextMenuItem onClick={onArchive} className="text-amber-600">
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Deal
                    </ContextMenuItem>
                )}
                <ContextMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Deal
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}
