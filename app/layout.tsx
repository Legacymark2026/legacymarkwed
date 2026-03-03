import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "@/components/providers";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { getPublicIntegrations } from "@/actions/settings";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { BackToTop } from "@/components/ui/back-to-top";
import { CookieConsent } from "@/components/ui/cookie-consent";
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
  const session = await auth();

  let userData: { em?: string; fn?: string; ln?: string; ph?: string } | undefined;
  if (session?.user) {
    // Advanced Matching format: strictly lowercase string, no leading/trailing spaces
    userData = {
      em: session.user.email?.toLowerCase().trim() || undefined,
      fn: session.user.name?.split(' ')[0]?.toLowerCase().trim() || undefined,
      ln: session.user.name?.split(' ').slice(1).join(' ')?.toLowerCase().trim() || undefined,
    };
    // remove undefined keys
    Object.keys(userData).forEach(key => (userData as any)[key] === undefined && delete (userData as any)[key]);
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`font-sans ${jetbrainsMono.variable} antialiased selection:bg-teal-500 selection:text-white bg-white text-slate-900`}
      >
        <Providers>
          <Suspense fallback={null}>
            <AnalyticsProvider config={{
              ...integrations,
              userData,
              debug: process.env.NODE_ENV === 'development'
            }} />
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
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
