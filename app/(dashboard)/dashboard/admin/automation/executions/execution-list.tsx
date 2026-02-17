"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Terminal } from "lucide-react";

interface Execution {
    id: string;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
    logs: any;
    workflow: {
        name: string;
    };
}

export default function ExecutionList({ executions }: { executions: Execution[] }) {
    const [selectedLog, setSelectedLog] = useState<any>(null);

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Workflow</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Logs</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {executions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                No executions found yet.
                            </TableCell>
                        </TableRow>
                    ) : (
                        executions.map((exec) => (
                            <TableRow key={exec.id}>
                                <TableCell className="font-medium">{exec.workflow.name}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        exec.status === 'SUCCESS' ? 'default' :
                                            exec.status === 'FAILED' ? 'destructive' : 'secondary'
                                    } className={
                                        exec.status === 'SUCCESS' ? 'bg-green-600' : ''
                                    }>
                                        {exec.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{format(new Date(exec.startedAt), 'MMM d, HH:mm:ss')}</TableCell>
                                <TableCell>
                                    {exec.completedAt ? (
                                        `${(new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime())}ms`
                                    ) : (
                                        <div className="flex items-center gap-1 text-blue-600">
                                            <Loader2 size={12} className="animate-spin" /> Running
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <Terminal size={14} className="mr-1" /> View
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Execution Logs</DialogTitle>
                                                <DialogDescription>
                                                    Step-by-step execution details.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-xs whitespace-pre-wrap">
                                                {JSON.stringify(exec.logs, null, 2)}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
