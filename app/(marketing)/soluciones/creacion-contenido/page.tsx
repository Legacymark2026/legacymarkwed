import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import ContentHero from '@/components/content-creation/content-hero';
// Lazily load components below the fold to improve initial page load (TTI & LCP)
const ContentShowcase = dynamic(() => import('@/components/content-creation/content-showcase'), { ssr: true });
const RoiCalculator = dynamic(() => import('@/components/content-creation/roi-calculator'), { ssr: true });
const SocialProofSection = dynamic(() => import('@/components/content-creation/social-proof-section'), { ssr: true });
const PricingBuilder = dynamic(() => import('@/components/content-creation/pricing-builder'), { ssr: true });
const ProcessWorkflow = dynamic(() => import('@/components/content-creation/process-workflow'), { ssr: true });
import '@/styles/content-animations.css';

export const metadata: Metadata = {
    title: 'Creación de Contenido Premium | Legacy Mark',
    description: 'Elevamos tu marca con contenido estratégico de alto impacto.',
};

export default function ContentCreationPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
            <div data-ga-section="contenido-hero">
                <ContentHero />
            </div>
            <div className="relative z-10">
                <div data-ga-section="contenido-showcase">
                    <ContentShowcase />
                </div>
                <div data-ga-section="contenido-roi">
                    <RoiCalculator />
                </div>
                <div data-ga-section="contenido-testimonios">
                    <SocialProofSection />
                </div>
                <div data-ga-section="contenido-pricing">
                    <PricingBuilder />
                </div>
                <div data-ga-section="contenido-proceso">
                    <ProcessWorkflow />
                </div>
            </div>
        </main>
    );
}
