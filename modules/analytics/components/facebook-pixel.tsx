'use client';

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface FacebookPixelProps {
    pixelId: string;
}

export function FacebookPixel({ pixelId }: FacebookPixelProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!loaded && consent === "accepted") {
            import("react-facebook-pixel")
                .then((x) => x.default)
                .then((ReactPixel) => {
                    ReactPixel.init(pixelId);
                    ReactPixel.pageView();
                    setLoaded(true);
                });
        }
    }, [pixelId, loaded]);

    useEffect(() => {
        if (loaded) {
            import("react-facebook-pixel")
                .then((x) => x.default)
                .then((ReactPixel) => {
                    ReactPixel.pageView();
                });
        }
    }, [pathname, searchParams, loaded]);

    return null;
}
