import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Farm Management System (FMS) | Smart Livestock & Breeding Tracker',
  description: 'Manage livestock inventory, track breeding and lineage trees, log clinical assessments, generate reports, and pay subscriptions securely via M-Pesa.',
  keywords: 'farmbrite replica, livestock tracking, veterinary reporting, mpesa daraja api, animal husbandry, breeding logger',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased min-h-screen flex flex-col bg-[#f4f7f6]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
