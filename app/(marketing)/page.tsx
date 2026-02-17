import { FuturisticHero } from "@/components/sections/futuristic-hero";
import { StrategicAlliances } from "@/components/sections/strategic-alliances";
import { BentoServices } from "@/components/sections/bento-services";
import { ValueProposition } from "@/components/sections/value-proposition";
import { CaseStudies } from "@/components/sections/case-studies";
import { Methodology } from "@/components/sections/methodology";
import { LatestPosts } from "@/components/sections/latest-posts";
import { PortfolioPreview } from "@/components/sections/portfolio-preview";
import { getRecentProjects, getRecentPosts } from "@/lib/data";
import { TestimonialSlider } from "@/components/sections/testimonial-slider";
import { TeamGrid } from "@/components/sections/team-grid";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { Stats } from "@/components/sections/stats";
import { CTA } from "@/components/sections/cta";

export default async function HomePage() {
    const projects = await getRecentProjects(4);
    const posts = await getRecentPosts(3);

    return (
        <main className="relative bg-white text-slate-900 overflow-hidden scroll-smooth">
            {/* 12. Floating Particles/Noise - Light Mode */}
            <div className="bg-noise fixed inset-0 z-50 pointer-events-none mix-blend-multiply opacity-[0.03]" />

            {/* 20. Ambient Orbs - Light Mode (Subtle) */}
            <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-teal-200/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-sky-200/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <FuturisticHero />

            <div className="relative z-10 space-y-0 pb-0">
                <StrategicAlliances />

                {/* Separator */}
                <div className="w-full h-px bg-gray-100" />

                <BentoServices />

                <div className="w-full h-px bg-gray-100" />

                <Stats />
                <ValueProposition />
                <CaseStudies />
                <TestimonialSlider />

                {/* 19. Grid Background for Tech Section - Light Mode */}
                <div className="relative">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] -z-10" />
                    <Methodology />
                </div>

                <TeamGrid />
                <FaqAccordion />
                <CTA />
                <PortfolioPreview projects={projects} />
                <LatestPosts posts={posts} />
            </div>
        </main>
    );
}
