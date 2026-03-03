"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function IntegrationsToastHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        if (processed) return;

        const error = searchParams.get("error");
        const success = searchParams.get("success");

        if (error || success) {
            setProcessed(true);

            if (error) {
                // Parse friendly errors if possible
                let message = decodeURIComponent(error);
                if (message === "no_code") message = "No se recibió código de autorización de Meta.";
                if (message === "access_denied") message = "Se denegó el acceso a la cuenta de Meta.";

                toast.error("Error de Integración", {
                    description: message,
                    duration: 8000
                });
            }

            if (success === "facebook_connected") {
                toast.success("¡Meta Conectado!", {
                    description: "Se ha vinculado correctamente tu cuenta de Facebook e Instagram.",
                });
            }

            // Remove query params from URL without refreshing the page
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.delete("error");
            newSearchParams.delete("success");

            const newUrl = pathname + (newSearchParams.toString() ? '?' + newSearchParams.toString() : '');
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, pathname, router, processed]);

    return null;
}
