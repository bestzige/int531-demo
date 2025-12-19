import WebVitals from '@/components/web-vitals';
import { cn } from '@/lib/utils';
import { Kanit } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const kanit = Kanit({
  variable: '--font-kanit',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata = {
  title: 'Students - SRE INT-531 Demo',
  description: 'SRE INT-531 Demo Project',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
    >
      <body
        className={cn(
          kanit.variable,
          'min-h-screen bg-background font-sans antialiased'
        )}
      >
        <WebVitals />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
