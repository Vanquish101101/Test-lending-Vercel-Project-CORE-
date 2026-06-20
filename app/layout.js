import './globals.css';

export const metadata = {
  title: 'PROJECT C.O.R.E. — Test Landing Vercel',
  description: 'Познай себя и познаешь всё. Мышление, маркетинг, заработок, веб-дизайн, 3D, аудио, видео, гейм-дизайн.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#05060f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
