import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

// Import fonts for the application
// The `Inter` font is used for general text and headings
// The `IBM_Plex_Serif` font is used for headings and titles
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const ibmPlexSerif = IBM_Plex_Serif({ subsets: ["latin"], weight: ["400", "700"], variable: '--font-ibm-plex-serif' });

/**
 * Metadata for the application.
 * Contains information about the title, description, and icons.
 */
export const metadata: Metadata = {
  title: "SubWatch", // Application title
  description: "SubWatch helps you keep track of your subscriptions.", // Application description
  icons: {
    icon: "/icons/logo.svg", // Icon for the application
  },
};

/**
 * Root layout component.
 * This component wraps all other components and sets the HTML and body classes.
 * @param children - The child components to render.
 * @returns The root layout component.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}

