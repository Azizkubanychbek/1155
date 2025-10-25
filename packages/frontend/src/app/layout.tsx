import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { ClientNavbar } from '@/components/ClientNavbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Backpack Guilds - Gaming Protocol on Xsolla ZK',
  description: 'Temporary item usage rights, party inventory, and on-chain crafting for gaming guilds',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ClientNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
