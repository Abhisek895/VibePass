import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ConditionalNavigationBar } from "./conditional-navigation-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VibePass",
  description: "Match by vibe. Reveal by choice.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VibePass",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-none">
      <head>
        <meta name="theme-color" content="#0B141B" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} bg-[#0B141B] text-white antialiased overflow-hidden`}>
        <Providers>
          <div className="flex flex-col h-[100dvh] w-full overflow-hidden relative">
            <div className="hidden sm:block">
              <ConditionalNavigationBar />
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {children}
            </div>

            <div className="sm:hidden">
              <ConditionalNavigationBar />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
