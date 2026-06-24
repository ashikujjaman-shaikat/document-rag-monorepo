import type { Metadata } from 'next';
import { DM_Sans, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'RAG Chatbot Console',
  description: 'Production-grade document retrieval chatbot frontend.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>{children}</body>
    </html>
  );
}
