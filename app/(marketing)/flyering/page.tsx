import { FlyeringHero } from "@/components/sections/flyering-hero";
import { FlyeringServices } from "@/components/sections/flyering-services";
import { FlyeringBenefits } from "@/components/sections/flyering-benefits";
import { LeadMagnetForm } from "@/components/sections/lead-magnet-form";
import { CaseStudies } from "@/components/sections/case-studies";
import { TestimonialSlider } from "@/components/sections/testimonial-slider";
import { StrategicAlliances } from "@/components/sections/strategic-alliances";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Agencia de Marketing Digital y Automatización | LegacyMark",
    description: "Impulsa tu negocio con estrategias de marketing 360°, diseño web, SEO y automatización de procesos.",
};

export default function FlyeringPage() {
    return (
        <main className="bg-white min-h-screen">
            <FlyeringHero />
            <StrategicAlliances />
            <FlyeringServices />
            <FlyeringBenefits />
            <CaseStudies />
            <TestimonialSlider />
            <LeadMagnetForm />
        </main>
    );
}
