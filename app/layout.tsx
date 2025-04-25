import './globals.css';
import { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import SystemAuthProvider from "./components/SystemAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'ProdTrack - Production Management System',
  description: 'An open-source production tracking and management system',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-gray-100`}
      >
        <SystemAuthProvider>{children}</SystemAuthProvider>
      </body>
    </html>
  );
}
