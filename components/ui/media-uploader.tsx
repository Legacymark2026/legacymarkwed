"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, File as FileIcon, FileVideo, FileImage, X, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface MediaUploaderProps {
    onUploadComplete: (url: string, name: string) => void;
    accept?: string;
    maxSizeMB?: number;
    title?: string;
    description?: string;
}

export function MediaUploader({ 
    onUploadComplete, 
    accept = "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv",
    maxSizeMB = 50,
    title = "Sube tus archivos",
    description = "Arrastra imágenes, videos o documentos interactivos."
}: MediaUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) handleFiles(files);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        if (files.length > 0) handleFiles(files);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset
    };

    const handleFiles = async (files: File[]) => {
        // Validation length
        if (files.length > 1) {
            toast.error("Por favor, sube solo un archivo a la vez en este campo.");
            return;
        }

        const file = files[0];
        const fileSizeMB = file.size / 1024 / 1024;
        
        if (fileSizeMB > maxSizeMB) {
            toast.error(`El archivo es muy pesado. El máximo es ${maxSizeMB}MB.`);
            return;
        }

        setIsUploading(true);
        setProgress(0);

        // Simulated progress for better UX
        const progressInterval = setInterval(() => {
            setProgress(p => Math.min(p + 15, 90));
        }, 300);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            clearInterval(progressInterval);
            setProgress(100);

            if (!res.ok) {
                throw new Error(data.error || "Error al subir el archivo");
            }

            toast.success("¡Archivo subido exitosamente!");
            onUploadComplete(data.url, data.name);
            
        } catch (error: any) {
            clearInterval(progressInterval);
            console.error(error);
            toast.error(error.message || "Error de red al procesar el archivo");
        } finally {
            setTimeout(() => {
                setIsUploading(false);
                setProgress(0);
            }, 500);
        }
    };

    return (
        <div className="w-full">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept={accept}
                onChange={handleChange}
            />
            
            <div 
                className={`w-full relative rounded-xl border-2 border-dashed transition-all duration-300 ease-out overflow-hidden cursor-pointer
                    ${isDragging 
                        ? 'border-teal-500 bg-teal-900/10 shadow-[0_0_20px_rgba(20,184,166,0.15)]' 
                        : 'border-slate-700/60 bg-slate-900 hover:border-teal-500/50 hover:bg-slate-800'
                    }
                    ${isUploading ? 'pointer-events-none opacity-80' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                    
                    <div className={`p-4 rounded-full bg-slate-800/80 shadow-inner mb-2 transition-transform duration-300 ${isDragging ? 'scale-110 shadow-teal-900/40' : ''}`}>
                        {isUploading ? (
                            <Loader2 size={32} className="text-teal-400 animate-spin" />
                        ) : (
                            <UploadCloud size={32} className={isDragging ? 'text-teal-400' : 'text-slate-400'} />
                        )}
                    </div>
                    
                    {!isUploading ? (
                        <>
                            <h3 className="text-sm font-semibold text-slate-200">
                                {title} <span className="text-teal-400 hover:underline">explorar</span>
                            </h3>
                            <p className="text-xs text-slate-500 max-w-[250px]">
                                {description}
                                <br/>
                                <span className="opacity-70 text-[10px] mt-1 block">Tamaño máx: {maxSizeMB}MB</span>
                            </p>
                        </>
                    ) : (
                        <div className="w-full max-w-xs space-y-2 mt-2">
                            <span className="text-xs font-mono text-teal-400 font-semibold uppercase tracking-widest">
                                Subiendo {progress}%
                            </span>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-teal-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
