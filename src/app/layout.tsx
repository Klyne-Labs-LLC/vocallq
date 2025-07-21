import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import StreamProvider from "@/provider/StreamProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VocallQ - AI-Powered Webinar Platform for Maximum Conversions",
    template: "%s | VocallQ"
  },
  description: "Transform your webinars into conversion machines with VocallQ's AI-powered platform. Features real-time streaming, automated sales agents, lead qualification, and seamless payment integration.",
  keywords: [
    "AI webinar platform",
    "webinar conversion optimization",
    "automated sales agents",
    "live streaming webinars",
    "lead qualification AI",
    "webinar payments",
    "sales automation",
    "VocallQ",
    "AI voice agents",
    "webinar analytics"
  ],
  authors: [{ name: "Klyne Labs, LLC" }],
  creator: "Klyne Labs, LLC",
  publisher: "Klyne Labs, LLC",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vocallq.app",
    title: "VocallQ - AI-Powered Webinar Platform for Maximum Conversions",
    description: "Transform your webinars into conversion machines with VocallQ's AI-powered platform. Features real-time streaming, automated sales agents, and seamless payment integration.",
    siteName: "VocallQ",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VocallQ - AI-Powered Webinar Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VocallQ - AI-Powered Webinar Platform for Maximum Conversions",
    description: "Transform your webinars into conversion machines with VocallQ's AI-powered platform.",
    images: ["/og-image.png"],
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${manrope.variable} antialiased font-manrope`}
          suppressHydrationWarning
        >
          <StreamProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors />
            </ThemeProvider>
          </StreamProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
