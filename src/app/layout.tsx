import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Quality Signals — Independent Prototype',
  description: 'A prototype feedback loop for recurring scientific review-readiness findings.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
