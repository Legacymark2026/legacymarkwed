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

// Helper to fire gtag events safely
export function gtagEvent(eventName: string, params?: Record<string, unknown>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, params);
    }
}

export function AnalyticsProvider({ config }: { config: AnalyticsConfig }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [consent, setConsent] = useState<'granted' | 'denied' | 'unknown'>('unknown');

    // --- Consent Management ---
    useEffect(() => {
        const stored = localStorage.getItem('cookie_consent');
        setConsent(stored === 'accepted' ? 'granted' : 'denied');

        const handleConsentUpdate = () => {
            const updated = localStorage.getItem('cookie_consent');
            setConsent(updated === 'accepted' ? 'granted' : 'denied');
            if (config.debug) console.log('[Analytics] Consent updated:', updated);
        };

        window.addEventListener('cookie_consent_updated', handleConsentUpdate);
        return () => window.removeEventListener('cookie_consent_updated', handleConsentUpdate);
    }, [config.debug]);

    // --- Fix: React to consent changes and update gtag immediately ---
    useEffect(() => {
        if (consent === 'unknown') return;
        if (typeof window === 'undefined' || !(window as any).gtag) return;

        const consentValue = consent === 'granted' ? 'granted' : 'denied';
        (window as any).gtag('consent', 'update', {
            analytics_storage: consentValue,
            ad_storage: consentValue,
        });

        if (config.debug) console.log('[Analytics] GA4 consent set to:', consentValue);
    }, [consent, config.debug]);

    // --- Track Pageviews on Route Change ---
    useEffect(() => {
        if (consent === 'granted' && config.gaPropertyId) {
            const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('config', config.gaPropertyId, {
                    page_path: url,
                    page_title: document.title,
                });
                if (config.debug) console.log('[Analytics] Pageview:', url);
            }
        }
    }, [pathname, searchParams, consent, config.gaPropertyId, config.debug]);

    // --- Auto-track: Scroll Depth (25%, 50%, 75%, 100%) ---
    useEffect(() => {
        if (consent !== 'granted' || !config.gaPropertyId) return;

        const milestones = [25, 50, 75, 100];
        const fired = new Set<number>();

        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            const pct = Math.round((scrollTop / docHeight) * 100);

            milestones.forEach(m => {
                if (pct >= m && !fired.has(m)) {
                    fired.add(m);
                    gtagEvent('scroll_depth', { depth: m, page: pathname });
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname, consent, config.gaPropertyId]);

    // --- Auto-track: Engaged Time (30s, 60s on page) ---
    useEffect(() => {
        if (consent !== 'granted' || !config.gaPropertyId) return;

        const t30 = setTimeout(() => gtagEvent('engaged_30s', { page: pathname }), 30000);
        const t60 = setTimeout(() => gtagEvent('engaged_60s', { page: pathname }), 60000);

        return () => {
            clearTimeout(t30);
            clearTimeout(t60);
        };
    }, [pathname, consent, config.gaPropertyId]);

    // --- Auto-track: Outbound links and WhatsApp clicks ---
    useEffect(() => {
        if (consent !== 'granted') return;

        const handleClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a');
            if (!target) return;

            const href = target.href || '';

            // WhatsApp links
            if (href.includes('wa.me') || href.includes('whatsapp.com')) {
                gtagEvent('whatsapp_click', { page: pathname });
            }
            // External links
            else if (href && !href.startsWith(window.location.origin) && href.startsWith('http')) {
                gtagEvent('outbound_link_click', {
                    link_url: href,
                    page: pathname,
                });
            }
            // Email links
            else if (href.startsWith('mailto:')) {
                gtagEvent('email_click', { email: href.replace('mailto:', ''), page: pathname });
            }
            // Phone links
            else if (href.startsWith('tel:')) {
                gtagEvent('phone_click', { phone: href.replace('tel:', ''), page: pathname });
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [pathname, consent]);

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
                                
                                // Default consent denied — React useEffect will update once consent is known
                                gtag('consent', 'default', {
                                    'analytics_storage': 'denied',
                                    'ad_storage': 'denied',
                                    'wait_for_update': 500
                                });

                                gtag('config', '${config.gaPropertyId}', {
                                    page_path: window.location.pathname,
                                    page_title: document.title,
                                    send_page_view: true
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
