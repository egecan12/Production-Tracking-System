import './globals.css';
import { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import SystemAuthProvider from "./components/SystemAuthProvider";
import PWAInstallButton from "./components/PWAInstallButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'ProdTrack - Production Management System',
  description: 'An open-source production tracking and management system for businesses',
  metadataBase: new URL('https://your-domain.com'), // Replace with your actual domain
  keywords: ['production tracking', 'management system', 'business', 'manufacturing'],
  authors: [{ name: 'ProdTrack Team' }],
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ProdTrack'
  },
  openGraph: {
    type: 'website',
    siteName: 'ProdTrack',
    title: 'ProdTrack - Production Management System',
    description: 'Professional production tracking and management system',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'ProdTrack Logo'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'ProdTrack - Production Management System',
    description: 'Professional production tracking and management system'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ProdTrack" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
      >
        <SystemAuthProvider>{children}</SystemAuthProvider>
        <PWAInstallButton />
      </body>
    </html>
  );
}
