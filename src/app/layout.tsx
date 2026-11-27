import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Season Radar",
  description: "Black Friday and Christmas stock calls for Irish sellers, backed by official CSO data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
