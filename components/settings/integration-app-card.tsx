"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink, RefreshCw, Power } from "lucide-react";

interface IntegrationAppCardProps {
    name: string;
    description: string;
    icon: ReactNode;
    brandColor: string; // e.g. "bg-blue-600"
    status: "connected" | "disconnected" | "loading" | "error";
    onConnect?: () => void;
    onDisconnect?: () => void;
    onConfigure?: () => void;
    customConnectButton?: ReactNode;
    customConfigureButton?: ReactNode;
    metrics?: { label: string; value: string }[];
    providerLink?: string;
}

export function IntegrationAppCard({
    name,
    description,
    icon,
    brandColor,
    status,
    onConnect,
    onDisconnect,
    onConfigure,
    customConnectButton,
    customConfigureButton,
    metrics,
    providerLink
}: IntegrationAppCardProps) {
    const isConnected = status === "connected";

    return (
        <div className="relative group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 flex flex-col min-h-[220px]">
            {/* Top Brand Accent Line */}
            <div className={`absolute top-0 left-0 w-full h-1 ${brandColor} opacity-80`} />

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-2">
                        {icon}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${isConnected ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20" :
                                status === "error" ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20" :
                                    "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-500/20"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500" : status === "error" ? "bg-red-500" : "bg-slate-400"}`}></span>
                            {isConnected ? "Conectado" : status === "error" ? "Error" : "Desconectado"}
                        </span>
                    </div>
                </div>

                <div className="mb-2">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{name}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{description}</p>
                </div>

                {metrics && metrics.length > 0 && isConnected && (
                    <div className="mt-auto pt-4 grid grid-cols-2 gap-4">
                        {metrics.map((m, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="text-xs text-slate-400 font-medium">{m.label}</span>
                                <span className="text-sm font-semibold text-slate-700">{m.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                <div className="flex gap-2 w-full justify-between sm:justify-end">
                    {providerLink && (
                        <a
                            href={providerLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mr-auto my-auto text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                        >
                            Portal <ExternalLink className="w-3 h-3" />
                        </a>
                    )}

                    {isConnected ? (
                        <>
                            {customConfigureButton ? customConfigureButton : onConfigure && (
                                <Button variant="outline" size="sm" onClick={onConfigure} className="h-8">
                                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                                    Ajustes
                                </Button>
                            )}
                            {onDisconnect && (
                                <Button variant="ghost" size="sm" onClick={onDisconnect} className="h-8 text-slate-500 hover:text-red-600 hover:bg-red-50">
                                    <Power className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </>
                    ) : (
                        customConnectButton ? customConnectButton : onConnect && (
                            <Button size="sm" onClick={onConnect} className="h-8 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white">
                                Conectar
                            </Button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
