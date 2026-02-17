'use client';

import { useEffect, useState } from 'react';

export const useFacebookPixel = () => {
    const [pixel, setPixel] = useState<any>(null);

    useEffect(() => {
        import("react-facebook-pixel").then((x) => setPixel(x.default));
    }, []);

    const trackEvent = (event: string, data?: unknown) => {
        if (pixel) {
            pixel.track(event, data);
        }
    };

    const trackCustom = (event: string, data?: unknown) => {
        if (pixel) {
            pixel.trackCustom(event, data);
        }
    };

    return { trackEvent, trackCustom };
};
