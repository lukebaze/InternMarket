import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: {
    default: "InternMarket - The App Store for AI Interns",
    template: "%s | InternMarket",
  },
  description: "Discover, install, and share AI interns with one command.",
  openGraph: {
    title: "InternMarket",
    description: "The App Store for AI Interns",
    url: "https://interns.market",
    siteName: "InternMarket",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InternMarket",
    description: "Discover, install, and share AI interns with one command.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-bg-page font-mono text-text-primary">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
