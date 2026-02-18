"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function MetaConnectButton({ provider }: { provider: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            // Initiate OAuth flow
            // callbackUrl ensures we come back to the settings page
            await signIn(provider, { callbackUrl: '/dashboard/settings?tab=integrations' });
        } catch (error) {
            console.error("Connection failed", error);
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleConnect} disabled={isLoading} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect
        </Button>
    );
}
