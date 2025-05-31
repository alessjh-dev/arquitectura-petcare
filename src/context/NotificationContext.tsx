// src/context/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react'; // Iconos para el banner

// Tipos de datos
interface NotificationItemProps { // Usamos el mismo tipo que en NotificationItem
  id: string;
  type: string; // 'activity', 'food', 'water', 'alert', 'info'
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface TemporaryBannerNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface NotificationContextType {
  temporaryBanner: TemporaryBannerNotification | null;
  // Podríamos añadir una función para mostrar el banner manualmente desde cualquier parte
  // showBanner: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [temporaryBanner, setTemporaryBanner] = useState<TemporaryBannerNotification | null>(null);
  const [lastFetchedNotificationId, setLastFetchedNotificationId] = useState<string | null>(null);
  const [pollingActive, setPollingActive] = useState(false);

  // Función para obtener las notificaciones de la API (solo las nuevas para el banner)
  const fetchNewNotificationsForBanner = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications'); // Asume que el GET trae las más recientes primero
      if (!res.ok) {
        throw new Error('Error al cargar notificaciones para el banner.');
      }
      const data: NotificationItemProps[] = await res.json();

      if (data.length > 0) {
        const latestDbNotification = data[0]; // La notificación más reciente en la DB

        // Solo si es una notificación realmente nueva y diferente de la última mostrada
        if (latestDbNotification.id !== lastFetchedNotificationId) {
          let bannerType: 'info' | 'success' | 'warning' | 'error' = 'info';
          switch (latestDbNotification.type) {
            case 'activity':
              bannerType = 'success';
              break;
            case 'alert':
            case 'water': // Puedes añadir tus otros tipos de alerta aquí
            case 'food':
              bannerType = 'warning';
              break;
            default:
              bannerType = 'info';
          }

          setTemporaryBanner({
            id: latestDbNotification.id,
            type: bannerType,
            message: latestDbNotification.message,
          });
          setLastFetchedNotificationId(latestDbNotification.id); // Guardar el ID de la última notif. mostrada
          setTimeout(() => setTemporaryBanner(null), 5000); // Quitar el banner después de 5 segundos
        }
      }
    } catch (err) {
      console.error('Error fetching new notifications for banner:', err);
      // Opcional: mostrar un banner de error si la API falla
    }
  }, [lastFetchedNotificationId]); // Depende del ID de la última notif. para evitar re-triggers

  useEffect(() => {
    // Iniciar polling solo después de una carga inicial
    // para obtener el ID de la notificación más reciente
    const getInitialLatestNotificationId = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data: NotificationItemProps[] = await res.json();
            if (data.length > 0) {
                setLastFetchedNotificationId(data[0].id);
            }
        } catch (err) {
            console.error("Error al obtener ID inicial de notif:", err);
        } finally {
            setPollingActive(true); // Activa el polling una vez que se obtiene el ID inicial
        }
    };

    getInitialLatestNotificationId();

    return () => {
        // Limpia el polling si se desmonta el provider
    };
  }, []); // Solo se ejecuta una vez al montar

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pollingActive) { // Solo iniciar polling si ya tenemos el ID inicial
        interval = setInterval(fetchNewNotificationsForBanner, 3000); // Polling cada 3 segundos
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [pollingActive, fetchNewNotificationsForBanner]); // Depende de pollingActive y la función de fetch

  // Helper para el icono del banner
  const getBannerIcon = (type: TemporaryBannerNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="mr-2" />;
      case 'warning': return <AlertTriangle size={20} className="mr-2" />;
      case 'error': return <AlertTriangle size={20} className="mr-2" />;
      default: return <Info size={20} className="mr-2" />;
    }
  };

  // Helper para el color del banner
  const getBannerColorClass = (type: TemporaryBannerNotification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <NotificationContext.Provider value={{ temporaryBanner }}>
      {children}
      {/* Renderizar el banner directamente en el Provider para que esté fuera del flujo de las páginas */}
      {temporaryBanner && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 w-11/12 max-w-sm p-3 rounded-lg shadow-lg flex items-center z-50 transition-all duration-300 ${getBannerColorClass(temporaryBanner.type)}`}>
          {getBannerIcon(temporaryBanner.type)}
          <p className="text-sm font-medium">{temporaryBanner.message}</p>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};