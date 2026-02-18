import { siteConfig } from "@/lib/site-config";

export function JsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.png`,
        sameAs: [
            siteConfig.links.twitter,
            siteConfig.links.linkedin,
            siteConfig.links.github,
        ],
        contactPoint: {
            "@type": "ContactPoint",
            telephone: "+1-555-123-4567",
            contactType: "customer service",
            areaServed: ["US", "ES", "MX", "CO"],
            availableLanguage: ["English", "Spanish"],
        },
        address: {
            "@type": "PostalAddress",
            streetAddress: "123 Innovation Drive",
            addressLocality: "Tech City",
            postalCode: "94000",
            addressCountry: "US",
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
