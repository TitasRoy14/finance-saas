import type { Metadata } from 'next';
import localFont from 'next/font/local';
//import { Space_Grotesk } from 'next/font/google';

import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const spaceGrotesk = localFont({
  src: './fonts/SpaceGrotesk.woff2',
  variable: '--font-spaceGrotesk',
  weight: '300 400 500 600 700',
});

// const spaceGrotesk = Space_Grotesk({
//   subsets: ['latin'],
//   weight: ['300', '400', '500', '600', '700'],
//   variable: '--font-spaceGrotesk',
// });

export const metadata: Metadata = {
  title: 'Expensio',
  description: 'It is an expense tracker application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body
          className={`${geistSans.variable} ${spaceGrotesk.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
