import { getTasks } from "@/actions/crm-advanced";
import { prisma } from "@/lib/prisma";
import { TasksBoard } from "@/components/crm/tasks-board";
import { CheckSquare, Clock, AlertTriangle, ListTodo } from "lucide-react";

export default async function TasksPage() {
    const company = await prisma.company.findFirst();
    if (!company) return <div className="p-8 text-slate-500 text-center">Configura tu empresa primero.</div>;

    const tasks = await getTasks(company.id);
    const overdue = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date());
    const pending = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);

    const kpis = [
        { label: "Total", value: tasks.length, icon: <ListTodo className="w-5 h-5" />, color: "text-slate-600", bg: "bg-slate-50" },
        { label: "Pendientes", value: pending.length, icon: <Clock className="w-5 h-5" />, color: "text-sky-600", bg: "bg-sky-50" },
        { label: "Vencidas", value: overdue.length, icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50" },
        { label: "Completadas", value: completed.length, icon: <CheckSquare className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Tareas & Recordatorios</h1>
                <p className="text-slate-500 mt-1">Gestiona el seguimiento de leads y deals con tareas asignadas.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {kpis.map((k) => (
                    <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl ${k.bg} ${k.color} flex items-center justify-center flex-shrink-0`}>{k.icon}</div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{k.value}</p>
                            <p className="text-xs text-slate-400 font-medium">{k.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <TasksBoard tasks={tasks as any} companyId={company.id} />
        </div>
    );
}
