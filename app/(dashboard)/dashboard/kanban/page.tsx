"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutDashboard, Search, Filter } from "lucide-react";
import KanbanBoard from "./components/KanbanBoard";

export default function KanbanPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [activeProject, setActiveProject] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/kanban");
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
                if (data.length > 0 && !activeProject) {
                    setActiveProject(data[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="flex-shrink-0 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20">
                        <LayoutDashboard className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Gestión Operativa (Kanban)</h1>
                        <p className="text-sm text-slate-400">Control de Producción y Delivery</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar tickets..."
                            className="bg-slate-800 border-slate-700 text-sm pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-colors">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                        <Plus className="h-4 w-4" />
                        Nuevo Proyecto
                    </button>
                </div>
            </header>

            {/* Sub-header Proyectos */}
            <div className="flex-shrink-0 px-6 py-2 border-b border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
                {isLoading ? (
                    <div className="text-sm text-slate-500 py-2">Cargando proyectos...</div>
                ) : projects.length === 0 ? (
                    <div className="text-sm text-slate-500 py-2">No hay proyectos activos.</div>
                ) : (
                    projects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActiveProject(p)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                activeProject?.id === p.id 
                                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" 
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            }`}
                        >
                            {p.name}
                        </button>
                    ))
                )}
            </div>

            {/* Tablero Principal */}
            <main className="flex-1 overflow-hidden p-6 relative">
                {activeProject ? (
                    <KanbanBoard project={activeProject} fetchProjects={fetchProjects} />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        Selecciona o crea un proyecto para ver sus tickets.
                    </div>
                )}
            </main>
        </div>
    );
}
