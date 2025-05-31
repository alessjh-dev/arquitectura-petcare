import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/navigation/BottomNav';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'; // Asegúrate de que esta importación exista

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Smart Pet Care',
  description: 'Sistema inteligente para el cuidado de mascotas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto px-4 py-8 pb-20">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}