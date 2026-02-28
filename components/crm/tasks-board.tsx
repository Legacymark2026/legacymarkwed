"use client";

import { useState, useCallback } from "react";
import { toggleTask, deleteTask, createTask } from "@/actions/crm-advanced";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Trash2, Plus, X, Calendar, Flag, AlertTriangle } from "lucide-react";

interface Task {
    id: string; title: string; description: string | null; dueDate: Date | null;
    priority: string; completed: boolean; dealId: string | null; leadId: string | null;
    assignee?: { name: string | null; image: string | null } | null;
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    LOW: { label: "Baja", color: "text-slate-500", bg: "bg-slate-50", dot: "bg-slate-400" },
    MEDIUM: { label: "Media", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
    HIGH: { label: "Alta", color: "text-orange-600", bg: "bg-orange-50", dot: "bg-orange-500" },
    URGENT: { label: "Urgente", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
};

interface Props { tasks: Task[]; companyId: string; }

export function TasksBoard({ tasks: initial, companyId }: Props) {
    const router = useRouter();
    const [tasks, setTasks] = useState(initial);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "MEDIUM" });
    const [creating, setCreating] = useState(false);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "DONE" | "OVERDUE">("ALL");

    const pending = tasks.filter((t) => !t.completed);
    const done = tasks.filter((t) => t.completed);
    const overdue = pending.filter((t) => t.dueDate && isPast(new Date(t.dueDate)));

    const filtered = filter === "PENDING" ? pending : filter === "DONE" ? done : filter === "OVERDUE" ? overdue : tasks;

    const handleToggle = async (id: string) => {
        setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
        await toggleTask(id);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        await deleteTask(id);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        const result = await createTask({ ...form, companyId });
        setCreating(false);
        if ("success" in result) {
            setForm({ title: "", description: "", dueDate: "", priority: "MEDIUM" });
            setShowCreate(false);
            router.refresh();
        }
    };

    return (
        <div className="space-y-4">
            {/* Filter tabs + Create */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1">
                    {(["ALL", "PENDING", "OVERDUE", "DONE"] as const).map((f) => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === f ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}>
                            {f === "ALL" ? "Todas" : f === "PENDING" ? `Pendientes (${pending.length})` : f === "OVERDUE" ? `Vencidas (${overdue.length})` : `Completadas (${done.length})`}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                    <Plus className="w-4 h-4" /> Nueva Tarea
                </button>
            </div>

            {/* Create form */}
            {showCreate && (
                <div className="bg-white rounded-2xl border border-teal-100 shadow-lg p-5">
                    <form onSubmit={handleCreate} className="space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-black text-slate-900">Nueva Tarea</h3>
                            <button type="button" onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                        </div>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="¿Qué hay que hacer?" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Descripción (opcional)..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none" />
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Vence</label>
                                <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Prioridad</label>
                                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Cancelar</button>
                            <button type="submit" disabled={creating} className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 disabled:opacity-50">
                                {creating ? "Creando…" : "Crear Tarea"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Task list */}
            <div className="space-y-2">
                {filtered.length === 0 && (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                        <p className="text-slate-400 text-sm">No hay tareas aquí.</p>
                    </div>
                )}
                {filtered.map((task) => {
                    const cfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG["MEDIUM"];
                    const isOverdue = !task.completed && task.dueDate && isPast(new Date(task.dueDate));
                    return (
                        <div key={task.id} className={`bg-white rounded-2xl border ${isOverdue ? "border-red-100 bg-red-50/30" : "border-slate-100"} shadow-sm p-4 flex items-start gap-4 transition-all`}>
                            <button onClick={() => handleToggle(task.id)} className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-300 hover:border-teal-400"}`}>
                                {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${task.completed ? "line-through text-slate-400" : "text-slate-900"}`}>{task.title}</p>
                                {task.description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>}
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                                    </span>
                                    {task.dueDate && (
                                        <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-bold" : "text-slate-400"}`}>
                                            {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                                            {format(new Date(task.dueDate), "d MMM · HH:mm", { locale: es })}
                                        </span>
                                    )}
                                    {task.assignee?.name && <span className="text-xs text-slate-400">👤 {task.assignee.name}</span>}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
