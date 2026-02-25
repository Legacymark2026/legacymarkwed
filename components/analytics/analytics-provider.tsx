'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

type AnalyticsConfig = {
    gaPropertyId?: string;
    fbPixelId?: string;
    gtmId?: string;
    hotjarId?: string;
    debug?: boolean;
};

export function AnalyticsProvider({ config }: { config: AnalyticsConfig }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [consent, setConsent] = useState<'granted' | 'denied' | 'unknown'>('unknown');

    useEffect(() => {
        // Initial consent check
        const stored = localStorage.getItem('cookie_consent');
        setConsent(stored === 'accepted' ? 'granted' : 'denied');

        // Listen for updates (custom event from CookieConsent)
        const handleConsentUpdate = () => {
            const updated = localStorage.getItem('cookie_consent');
            setConsent(updated === 'accepted' ? 'granted' : 'denied');
            if (config.debug) console.log('[Analytics] Consent updated:', updated);
        };

        window.addEventListener('cookie_consent_updated', handleConsentUpdate);
        return () => window.removeEventListener('cookie_consent_updated', handleConsentUpdate);
    }, [config.debug]);

    // Track Pageviews on Route Change
    useEffect(() => {
        if (consent === 'granted' && config.gaPropertyId) {
            const url = pathname + searchParams.toString();
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('config', config.gaPropertyId, {
                    page_path: url,
                });
                if (config.debug) console.log('[Analytics] Pageview sent:', url);
            }
        }
    }, [pathname, searchParams, consent, config.gaPropertyId, config.debug]);

    return (
        <>
            {/* --- GOOGLE ANALYTICS 4 --- */}
            {config.gaPropertyId && (
                <>
                    <Script
                        id="ga4-init"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                
                                // Default Denied
                                gtag('consent', 'default', {
                                    'ad_storage': 'denied',
                                    'analytics_storage': 'denied'
                                });

                                gtag('config', '${config.gaPropertyId}', {
                                    page_path: window.location.pathname,
                                    send_page_view: true // Handle initial load
                                });
                            `
                        }}
                    />
                    <Script
                        id="ga4-lib"
                        src={`https://www.googletagmanager.com/gtag/js?id=${config.gaPropertyId}`}
                        strategy="afterInteractive"
                        onLoad={() => {
                            if (config.debug) console.log('[Analytics] GA4 Script Loaded');
                            // If consent already granted, update immediately
                            if (consent === 'granted') {
                                (window as any).gtag('consent', 'update', {
                                    'ad_storage': 'granted',
                                    'analytics_storage': 'granted'
                                });
                            }
                        }}
                    />
                </>
            )}

            {/* --- GOOGLE TAG MANAGER --- */}
            {config.gtmId && (
                <Script
                    id="gtm-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${config.gtmId}');
                        `
                    }}
                />
            )}

            {/* --- FACEBOOK PIXEL --- */}
            {config.fbPixelId && (
                <Script
                    id="fb-pixel-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '${config.fbPixelId}');
                            fbq('track', 'PageView');
                            if (window.analytics_debug) console.log('[Analytics] Facebook Pixel Initialized:', '${config.fbPixelId}');
                        `
                    }}
                    onLoad={() => {
                        if (config.debug) console.log('[Analytics] Facebook Pixel Script Loaded');
                    }}
                />
            )}

            {/* --- HOTJAR --- */}
            {config.hotjarId && (
                <Script
                    id="hotjar-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function(h,o,t,j,a,r){
                                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                                h._hjSettings={hjid:${config.hotjarId},hjsv:6};
                                a=o.getElementsByTagName('head')[0];
                                r=o.createElement('script');r.async=1;
                                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                                a.appendChild(r);
                            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                        `
                    }}
                />
            )}
        </>
    );
}
