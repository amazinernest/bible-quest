import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GameProvider } from '@/context/GameContext';

export const metadata: Metadata = {
  title: 'WORD QUEST — “How well do you know the Word?”',
  description: 'A premium, addictive Bible adventure web game with 10 Journey Levels, 8 Play Modes, Streaks, Achievements, and Real-time Competition.',
  keywords: ['Bible Game', 'Word Quest', 'Scripture Quiz', 'Christian Trivia', 'Bible Trivia', 'Duolingo for Bible'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Word Quest',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0F1D',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full bg-[#0A0F1D] text-slate-100">
      <body className="min-h-full flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
