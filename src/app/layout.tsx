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
  title: "App Preview Converter",
  description:
    "Convert your app preview videos for macOS or iOS App Store submissions. Fixes common Apple upload rejections with proper formatting.",
  keywords: ["app preview", "app store", "video converter", "macOS", "iOS", "ffmpeg", "apple"],
  authors: [{ name: "Brenden Bishop" }],
  openGraph: {
    title: "App Preview Converter",
    description: "Convert your app preview videos for macOS or iOS App Store submissions",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "App Preview Converter",
    description: "Convert your app preview videos for macOS or iOS App Store submissions",
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
