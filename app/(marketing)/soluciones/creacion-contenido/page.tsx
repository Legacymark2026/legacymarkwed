import { Metadata } from 'next';
import ContentHero from '@/components/content-creation/content-hero';
import ContentShowcase from '@/components/content-creation/content-showcase';
import RoiCalculator from '@/components/content-creation/roi-calculator';
import PricingBuilder from '@/components/content-creation/pricing-builder';
import SocialProofSection from '@/components/content-creation/social-proof-section';
import ProcessWorkflow from '@/components/content-creation/process-workflow';
import '@/styles/content-animations.css';

export const metadata: Metadata = {
    title: 'Creación de Contenido Premium | Legacy Mark',
    description: 'Elevamos tu marca con contenido estratégico de alto impacto.',
};

export default function ContentCreationPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
            <div data-ga-section="contenido-hero"><ContentHero /></div>
            <div data-ga-section="contenido-showcase"><ContentShowcase /></div>
            <div className="relative z-10">
                <div data-ga-section="contenido-roi"><RoiCalculator /></div>
                <div data-ga-section="contenido-testimonios"><SocialProofSection /></div>
                <div data-ga-section="contenido-pricing"><PricingBuilder /></div>
                <div data-ga-section="contenido-proceso"><ProcessWorkflow /></div>
            </div>
        </main>
    );
}
