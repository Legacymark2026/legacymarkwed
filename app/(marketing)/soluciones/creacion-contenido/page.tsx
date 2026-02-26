import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import ContentHero from '@/components/content-creation/content-hero';
import '@/styles/content-animations.css';

export const metadata: Metadata = {
    title: 'Creación de Contenido Premium | Legacy Mark',
    description: 'Elevamos tu marca con contenido estratégico de alto impacto.',
};

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
const SectionSkeleton = () => (
    <div className="py-20 bg-white">
        <div className="container px-4 md:px-6 animate-pulse space-y-4">
            <div className="h-10 w-64 mx-auto rounded-xl bg-slate-100" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-40 rounded-2xl bg-slate-100" />
                ))}
            </div>
        </div>
    </div>
);

const AltSectionSkeleton = () => (
    <div className="py-20 bg-slate-50">
        <div className="container px-4 md:px-6 animate-pulse">
            <div className="h-10 w-56 rounded-xl bg-slate-200 mb-8 mx-auto" />
            <div className="h-64 rounded-3xl bg-slate-200 w-full max-w-4xl mx-auto" />
        </div>
    </div>
);

// ─── Dynamic (lazy) imports — split each into its own JS chunk ────────────────
const ContentShowcase = dynamic(
    () => import('@/components/content-creation/content-showcase'),
    { loading: () => <SectionSkeleton /> }
);

const RoiCalculator = dynamic(
    () => import('@/components/content-creation/roi-calculator'),
    { loading: () => <AltSectionSkeleton /> }
);

const SocialProofSection = dynamic(
    () => import('@/components/content-creation/social-proof-section'),
    { loading: () => <SectionSkeleton /> }
);

const PricingBuilder = dynamic(
    () => import('@/components/content-creation/pricing-builder'),
    { loading: () => <AltSectionSkeleton /> }
);

const ProcessWorkflow = dynamic(
    () => import('@/components/content-creation/process-workflow'),
    { loading: () => <SectionSkeleton /> }
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContentCreationPage() {
    return (
        <main className="min-h-screen bg-white text-slate-900 relative overflow-hidden">
            {/* Hero — loaded eagerly (above-the-fold) */}
            <div data-ga-section="contenido-hero">
                <ContentHero />
            </div>

            {/* Below-the-fold — lazy loaded, each in its own chunk */}
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
