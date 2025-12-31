import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { MobileBlock } from "@/components/mobile-block";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ciderpress - App Preview Converter",
  description:
    "Press your app preview videos into App Store perfection. Fixes common Apple upload rejections with proper formatting for macOS and iOS.",
  keywords: [
    "app preview",
    "app store",
    "video converter",
    "macOS",
    "iOS",
    "ffmpeg",
    "apple",
    "ciderpress",
  ],
  authors: [{ name: "Brenden Bishop" }],
  openGraph: {
    title: "Ciderpress",
    description: "Press your app preview videos into App Store perfection",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Ciderpress",
    description: "Press your app preview videos into App Store perfection",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono antialiased`}>
        <ErrorBoundary>
          <MobileBlock>{children}</MobileBlock>
        </ErrorBoundary>
      </body>
    </html>
  );
}
