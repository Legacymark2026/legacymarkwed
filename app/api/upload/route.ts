import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No se encontró el archivo" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Sanitización del nombre del archivo
        const originalName = file.name;
        const extension = originalName.split('.').pop()?.toLowerCase() || '';
        
        // Bloquear extensiones peligrosas
        const dangerousExtensions = ['exe', 'bat', 'sh', 'php', 'js', 'html', 'cmd', 'ps1', 'vbs'];
        if (dangerousExtensions.includes(extension)) {
            return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
        }

        // Crear nombre seguro a prueba de inyecciones
        const safeSlug = originalName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 50);
        const fileName = `${Date.now()}_${uuidv4().split('-')[0]}_${safeSlug}.${extension}`;

        // Organización de subida por Directorios Anuales/Mensuales para rendimiento
        const date = new Date();
        const yearMonthFolder = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const uploadDir = join(process.cwd(), "public", "uploads", yearMonthFolder);

        // Crear directorio si no existe (recursive true)
        await mkdir(uploadDir, { recursive: true });

        // Escribir en el VPS Hard Drive
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Retornar la URL pública estática que React puede consumir (o guardar en la base de datos)
        const publicUrl = `/uploads/${yearMonthFolder}/${fileName}`;
        
        return NextResponse.json({ 
            success: true, 
            url: publicUrl,
            name: originalName,
            size: file.size,
            type: file.type
        });

    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json(
            { error: "Error interno procesando el archivo" }, 
            { status: 500 }
        );
    }
}
