// src/components/navigation/BottomNav.tsx
'use client'; // Necesario para hooks como usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bell, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border shadow-md">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-md 
                          ${isActive ? 'text-primary' : 'text-muted-foreground'} 
                          hover:text-primary transition-colors`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}