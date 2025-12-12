import './globals.css';
import type { Metadata } from 'next';
import Navigation from '../components/Navigation';

export const metadata: Metadata = {
  title: 'Down Syndrome Support App',
  description: 'Application for supporting individuals with Down Syndrome',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <div className="container mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
}