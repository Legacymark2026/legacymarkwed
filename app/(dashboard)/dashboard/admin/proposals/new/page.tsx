"use client";

import { useState } from "react";
import { Save, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewProposalPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        contactName: "",
        contactEmail: "",
        value: 0,
        currency: "USD",
        content: "",
        expiresAt: ""
    });

    const [items, setItems] = useState([
        { id: "1", title: "Diseño UI/UX", description: "", quantity: 1, price: 500 }
    ]);

    const handleItemChange = (id: string, field: string, value: any) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const addItem = () => {
        setItems(prev => [...prev, { id: Math.random().toString(), title: "", description: "", quantity: 1, price: 0 }]);
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // El backend asume la activeCompanyId desde la sesión
            const payload = {
                ...formData,
                value: calculateTotal(), // auto-calculated
                items: items
            };
            
            const res = await fetch("/api/admin/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push("/dashboard/admin/proposals");
            } else {
                alert("Error al guardar la propuesta");
            }
        } catch (e) {
            console.error("Error saving proposal", e);
            alert("Error de conexión");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-slate-950 text-slate-200 p-6 md:p-8 overflow-y-auto no-scrollbar">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin/proposals" className="p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="h-4 w-4 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Nueva Propuesta Comercial</h1>
                        <p className="text-sm text-slate-400 mt-1">Constructor de Alcances y SLA.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(20,184,166,0.2)] disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Guardando..." : "Guardar Propuesta"}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Principal */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Información General</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Título del Documento</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                    placeholder="Ej. Desarrollo de E-Commerce B2B"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Nombre del Cliente</label>
                                    <input 
                                        type="text" 
                                        value={formData.contactName}
                                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Email del Cliente</label>
                                    <input 
                                        type="email" 
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                        placeholder="juan@empresa.com"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Alcance y Metodología (Markdown soportado)</label>
                                <textarea 
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    rows={8}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono text-sm leading-relaxed"
                                    placeholder="Describe aquí las bases, SLA, y alcances del proyecto..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items y Totales */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white">Desglose de Cotización</h2>
                            <button onClick={addItem} className="text-teal-400 hover:text-teal-300 transition-colors text-sm flex items-center gap-1">
                                <Plus className="h-4 w-4" /> Añadir Ítem
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800/60 relative group">
                                    <button 
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <input 
                                                type="text" 
                                                value={item.title}
                                                onChange={(e) => handleItemChange(item.id, "title", e.target.value)}
                                                className="w-full bg-transparent border-b border-slate-800 pb-1 text-sm font-medium text-slate-200 focus:outline-none focus:border-teal-500"
                                                placeholder="Concepto..."
                                            />
                                        </div>
                                        <div>
                                            <input 
                                                type="text" 
                                                value={item.description}
                                                onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                                                className="w-full bg-transparent border-b border-slate-800 pb-1 text-xs text-slate-400 focus:outline-none focus:border-teal-500"
                                                placeholder="Breve descripción..."
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Cant.</label>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(item.id, "quantity", parseInt(e.target.value) || 1)}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-sm text-slate-200"
                                                />
                                            </div>
                                            <div className="flex-[2]">
                                                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Precio Unitario</label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                                                    <input 
                                                        type="number" 
                                                        value={item.price}
                                                        onChange={(e) => handleItemChange(item.id, "price", parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-slate-900 border border-slate-800 rounded pl-6 pr-2 py-1 text-sm text-slate-200"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400 text-sm font-medium tracking-wider uppercase">Auto-Total</span>
                            <span className="text-2xl font-mono font-bold text-teal-400">
                                ${calculateTotal().toLocaleString()} <span className="text-sm">{formData.currency}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
