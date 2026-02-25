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

// ─────────────────────────────────────────────
// GLOBAL HELPER — use this from any component
// ─────────────────────────────────────────────
export function gtagEvent(eventName: string, params?: Record<string, unknown>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, params);
    }
}

// ─────────────────────────────────────────────
// CORE WEB VITALS
// ─────────────────────────────────────────────
function reportWebVitals() {
    if (typeof window === 'undefined') return;

    // LCP — Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as any;
        gtagEvent('web_vitals', { metric_name: 'LCP', metric_value: Math.round(last.startTime), metric_rating: last.startTime < 2500 ? 'good' : last.startTime < 4000 ? 'needs_improvement' : 'poor' });
    });
    try { lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true }); } catch (_) { }

    // CLS — Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) clsValue += (entry as any).value;
        }
    });
    try { clsObserver.observe({ type: 'layout-shift', buffered: true }); } catch (_) { }

    // FID / INP — Interaction to Next Paint
    const interactionObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            const inp = (entry as any).processingStart - (entry as any).startTime;
            gtagEvent('web_vitals', { metric_name: 'INP', metric_value: Math.round(inp), metric_rating: inp < 200 ? 'good' : inp < 500 ? 'needs_improvement' : 'poor' });
        }
    });
    try { interactionObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 }); } catch (_) { }

    // TTFB — Time to First Byte
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
        const ttfb = navEntries[0].responseStart - navEntries[0].requestStart;
        gtagEvent('web_vitals', { metric_name: 'TTFB', metric_value: Math.round(ttfb), metric_rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs_improvement' : 'poor' });
    }

    // CLS: report on page hide
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            gtagEvent('web_vitals', { metric_name: 'CLS', metric_value: Math.round(clsValue * 1000), metric_rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs_improvement' : 'poor' });
        }
    }, { once: true });
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export function AnalyticsProvider({ config }: { config: AnalyticsConfig }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [consent, setConsent] = useState<'granted' | 'denied' | 'unknown'>('unknown');

    // ── Consent Management ──────────────────────────────────────────────
    useEffect(() => {
        const stored = localStorage.getItem('cookie_consent');
        setConsent(stored === 'accepted' ? 'granted' : 'denied');

        const handleUpdate = () => {
            const updated = localStorage.getItem('cookie_consent');
            setConsent(updated === 'accepted' ? 'granted' : 'denied');
        };
        window.addEventListener('cookie_consent_updated', handleUpdate);
        return () => window.removeEventListener('cookie_consent_updated', handleUpdate);
    }, []);

    // ── React to consent changes and update gtag ─────────────────────────
    useEffect(() => {
        if (consent === 'unknown' || !(window as any).gtag) return;
        const v = consent === 'granted' ? 'granted' : 'denied';
        (window as any).gtag('consent', 'update', { analytics_storage: v, ad_storage: v });
    }, [consent]);

    // ── Pageview on route change ──────────────────────────────────────────
    useEffect(() => {
        if (consent !== 'granted' || !config.gaPropertyId || !(window as any).gtag) return;
        const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
        (window as any).gtag('config', config.gaPropertyId, {
            page_path: url,
            page_title: document.title,
        });
    }, [pathname, searchParams, consent, config.gaPropertyId]);

    // ── Scroll Depth: 25 / 50 / 75 / 100 % ──────────────────────────────
    useEffect(() => {
        if (consent !== 'granted' || !config.gaPropertyId) return;
        const milestones = new Set([25, 50, 75, 100]);
        const fired = new Set<number>();

        const onScroll = () => {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            if (docH <= 0) return;
            const pct = Math.round((window.scrollY / docH) * 100);
            milestones.forEach(m => {
                if (pct >= m && !fired.has(m)) {
                    fired.add(m);
                    gtagEvent('scroll_depth', { percent_scrolled: m, page_path: pathname });
                }
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [pathname, consent, config.gaPropertyId]);

    // ── Engagement Time: 10s / 30s / 60s / 120s ─────────────────────────
    useEffect(() => {
        if (consent !== 'granted' || !config.gaPropertyId) return;
        const timers = [
            setTimeout(() => gtagEvent('user_engagement', { engagement_time_msec: 10000, page_path: pathname }), 10000),
            setTimeout(() => gtagEvent('user_engagement', { engagement_time_msec: 30000, page_path: pathname }), 30000),
            setTimeout(() => gtagEvent('user_engagement', { engagement_time_msec: 60000, page_path: pathname }), 60000),
            setTimeout(() => gtagEvent('user_engagement', { engagement_time_msec: 120000, page_path: pathname }), 120000),
        ];
        return () => timers.forEach(clearTimeout);
    }, [pathname, consent, config.gaPropertyId]);

    // ── Global Click Tracking ─────────────────────────────────────────────
    useEffect(() => {
        if (consent !== 'granted') return;

        const onClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // ── Link clicks
            const link = target.closest('a');
            if (link) {
                const href = link.href || '';
                const text = (link.textContent || '').trim().slice(0, 100);

                if (href.includes('wa.me') || href.includes('whatsapp.com')) {
                    gtagEvent('whatsapp_click', { page_path: pathname, link_text: text });
                    if (config.fbPixelId && (window as any).fbq) (window as any).fbq('track', 'Contact');
                } else if (href.startsWith('mailto:')) {
                    gtagEvent('email_click', { email_address: href.replace('mailto:', ''), page_path: pathname });
                } else if (href.startsWith('tel:')) {
                    gtagEvent('phone_call', { phone_number: href.replace('tel:', ''), page_path: pathname });
                } else if (href && !href.startsWith(window.location.origin) && href.startsWith('http')) {
                    gtagEvent('click', { link_url: href, link_text: text, outbound: true, page_path: pathname });
                }
                return;
            }

            // ── Button / CTA clicks
            const btn = target.closest('button, [role="button"]');
            if (btn) {
                const text = (btn.textContent || '').trim().slice(0, 100);
                const id = (btn as HTMLElement).id || undefined;
                const cls = (btn as HTMLElement).className?.toString().slice(0, 80) || undefined;
                gtagEvent('cta_click', { button_text: text, button_id: id, button_class: cls, page_path: pathname });
            }
        };

        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, [pathname, consent, config.fbPixelId]);

    // ── Form Tracking: start / submit / error ────────────────────────────
    useEffect(() => {
        if (consent !== 'granted') return;

        // form_start — first focus inside a form
        const formStarted = new Set<HTMLFormElement>();
        const onFocusin = (e: FocusEvent) => {
            const form = (e.target as HTMLElement).closest('form');
            if (form && !formStarted.has(form)) {
                formStarted.add(form);
                gtagEvent('form_start', { form_id: form.id || 'unknown', page_path: pathname });
            }
        };

        // form_submit
        const onSubmit = (e: Event) => {
            const form = e.target as HTMLFormElement;
            gtagEvent('form_submit', { form_id: form.id || 'unknown', page_path: pathname });
        };

        document.addEventListener('focusin', onFocusin);
        document.addEventListener('submit', onSubmit);
        return () => {
            document.removeEventListener('focusin', onFocusin);
            document.removeEventListener('submit', onSubmit);
        };
    }, [pathname, consent]);

    // ── Video Tracking (HTML5 video elements) ────────────────────────────
    useEffect(() => {
        if (consent !== 'granted') return;

        const videos = document.querySelectorAll('video');
        const handlers: Array<{ el: HTMLVideoElement; events: [string, () => void][] }> = [];

        videos.forEach((video) => {
            const src = video.src || video.currentSrc || 'unknown';
            const onPlay = () => gtagEvent('video_start', { video_url: src, page_path: pathname });
            const onPause = () => gtagEvent('video_pause', { video_url: src, video_current_time: Math.round(video.currentTime), page_path: pathname });
            const onEnded = () => gtagEvent('video_complete', { video_url: src, page_path: pathname });
            const onProgress = () => {
                if (!video.duration) return;
                const pct = Math.round((video.currentTime / video.duration) * 100);
                if ([25, 50, 75].includes(pct)) {
                    gtagEvent('video_progress', { video_url: src, video_percent: pct, page_path: pathname });
                }
            };

            const evts: [string, () => void][] = [['play', onPlay], ['pause', onPause], ['ended', onEnded], ['timeupdate', onProgress]];
            evts.forEach(([ev, fn]) => video.addEventListener(ev, fn));
            handlers.push({ el: video, events: evts });
        });

        return () => handlers.forEach(({ el, events }) => events.forEach(([ev, fn]) => el.removeEventListener(ev, fn)));
    }, [pathname, consent]);

    // ── JavaScript Error Tracking ─────────────────────────────────────────
    useEffect(() => {
        if (consent !== 'granted') return;

        const onError = (e: ErrorEvent) => {
            gtagEvent('exception', {
                description: `${e.message} (${e.filename}:${e.lineno})`,
                fatal: false,
            });
        };
        const onUnhandledRejection = (e: PromiseRejectionEvent) => {
            gtagEvent('exception', {
                description: `Unhandled Promise: ${String(e.reason)}`,
                fatal: false,
            });
        };

        window.addEventListener('error', onError);
        window.addEventListener('unhandledrejection', onUnhandledRejection);
        return () => {
            window.removeEventListener('error', onError);
            window.removeEventListener('unhandledrejection', onUnhandledRejection);
        };
    }, [consent]);

    // ── Core Web Vitals ───────────────────────────────────────────────────
    useEffect(() => {
        if (consent !== 'granted' || !config.gaPropertyId) return;
        reportWebVitals();
    }, [consent, config.gaPropertyId]);

    // ── User Properties: connection, device, language ─────────────────────
    useEffect(() => {
        if (consent !== 'granted' || !config.gaPropertyId || !(window as any).gtag) return;
        const nav = navigator as any;
        (window as any).gtag('set', 'user_properties', {
            language: navigator.language,
            screen_resolution: `${screen.width}x${screen.height}`,
            connection_type: nav.connection?.effectiveType || 'unknown',
            device_memory: nav.deviceMemory ? `${nav.deviceMemory}GB` : 'unknown',
            hardware_concurrency: navigator.hardwareConcurrency || 'unknown',
        });
    }, [consent, config.gaPropertyId]);

    // ── In-Page Search Tracking ───────────────────────────────────────────
    useEffect(() => {
        if (consent !== 'granted') return;

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key !== 'Enter') return;
            const input = document.activeElement as HTMLInputElement;
            if (input?.tagName === 'INPUT' && (input.type === 'search' || input.type === 'text')) {
                const q = input.value.trim();
                if (q.length > 1) gtagEvent('search', { search_term: q, page_path: pathname });
            }
        };
        window.addEventListener('keyup', onKeyUp);
        return () => window.removeEventListener('keyup', onKeyUp);
    }, [pathname, consent]);

    // ── Copy Text Tracking ────────────────────────────────────────────────
    useEffect(() => {
        if (consent !== 'granted') return;

        const onCopy = () => {
            const selected = window.getSelection()?.toString().trim().slice(0, 100);
            if (selected && selected.length > 5) {
                gtagEvent('content_copy', { copied_text: selected, page_path: pathname });
            }
        };
        document.addEventListener('copy', onCopy);
        return () => document.removeEventListener('copy', onCopy);
    }, [pathname, consent]);

    // ── Element Visibility: hero, CTA sections ────────────────────────────
    useEffect(() => {
        if (consent !== 'granted' || typeof IntersectionObserver === 'undefined') return;

        const targets = document.querySelectorAll('[data-ga-section]');
        if (targets.length === 0) return;

        const seen = new Set<string>();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = (entry.target as HTMLElement).dataset.gaSection || 'unknown';
                    if (!seen.has(section)) {
                        seen.add(section);
                        gtagEvent('section_view', { section_name: section, page_path: pathname });
                    }
                }
            });
        }, { threshold: 0.5 });

        targets.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [pathname, consent]);

    // ─────────────────────────────────────────────
    // SCRIPTS
    // ─────────────────────────────────────────────
    return (
        <>
            {/* ── GOOGLE ANALYTICS 4 ── */}
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
                                gtag('consent', 'default', {
                                    'analytics_storage': 'denied',
                                    'ad_storage': 'denied',
                                    'wait_for_update': 500
                                });
                                gtag('config', '${config.gaPropertyId}', {
                                    page_path: window.location.pathname,
                                    page_title: document.title,
                                    send_page_view: true,
                                    cookie_domain: 'legacymarksas.com',
                                    cookie_flags: 'SameSite=None;Secure',
                                    allow_google_signals: true,
                                    allow_ad_personalization_signals: false
                                });
                            `
                        }}
                    />
                    <Script
                        id="ga4-lib"
                        src={`https://www.googletagmanager.com/gtag/js?id=${config.gaPropertyId}`}
                        strategy="afterInteractive"
                    />
                </>
            )}

            {/* ── GOOGLE TAG MANAGER ── */}
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

            {/* ── FACEBOOK PIXEL ── */}
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
                />
            )}

            {/* ── HOTJAR ── */}
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
