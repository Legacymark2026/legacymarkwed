import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "@/components/providers";
import { FacebookPixel } from "@/modules/analytics/components/facebook-pixel";
import { GoogleTagManager } from "@/modules/analytics/components/google-tag-manager";
import { Hotjar } from "@/modules/analytics/components/hotjar";
import { getPublicIntegrations } from "@/actions/settings";
import { Suspense } from "react";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { BackToTop } from "@/components/ui/back-to-top";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { NewsletterPopup } from "@/components/ui/newsletter-popup";
import { JsonLd } from "@/components/seo/json-ld";
import { CommandMenu } from "@/components/ui/command-menu";
import { PageTransition } from "@/components/ui/page-transition";
import { SocialShare } from "@/components/ui/social-share";
import { ChatWidget } from "@/components/chat/chat-widget";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@legacymark",
  },
  icons: {
    icon: "/favicon.ico?v=2",
    shortcut: "/favicon-16x16.png?v=2",
    apple: "/apple-touch-icon.png?v=2",
  },
  manifest: "/site.webmanifest",
  verification: {
    other: {
      "facebook-domain-verification": "fm9attbfbqwnfk3yfcn6t8v3rymszu",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const integrations = await getPublicIntegrations();

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`font-sans ${jetbrainsMono.variable} antialiased selection:bg-teal-500 selection:text-white bg-white text-slate-900`}
      >
        <Providers>
          <Suspense fallback={null}>
            {integrations?.fbPixelId && <FacebookPixel pixelId={integrations.fbPixelId} />}
            {integrations?.gtmId && <GoogleTagManager gtmId={integrations.gtmId} />}
            {integrations?.hotjarId && <Hotjar hotjarId={integrations.hotjarId} />}
          </Suspense>

          <ScrollProgress />
          <CustomCursor />
          <AmbientBackground />
          <JsonLd />
          <CommandMenu />
          <SocialShare url={siteConfig.url} title={siteConfig.description} />
          <PageTransition>
            {children}
          </PageTransition>
          <BackToTop />
          <CookieConsent />
          <NewsletterPopup />
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
