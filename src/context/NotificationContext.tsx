// src/context/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react'; // Iconos para el banner

// Tipos de datos
interface NotificationItemProps {
  id: string;
  type: string; // 'activity', 'food', 'water', 'alert', 'info'
  message: string;
  timestamp: string; // La fecha viene en formato ISO 8601 (UTC)
  isRead: boolean;
}

interface TemporaryBannerNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface NotificationContextType {
  temporaryBanner: TemporaryBannerNotification | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [temporaryBanner, setTemporaryBanner] = useState<TemporaryBannerNotification | null>(null);
  const [lastFetchedNotificationId, setLastFetchedNotificationId] = useState<string | null>(null);
  const [pollingActive, setPollingActive] = useState(false);

  // Helper para formatear el timestamp a la hora local del usuario
  const formatTimestampToLocal = useCallback((timestamp: string) => {
    const date = new Date(timestamp); // Crea un objeto Date desde el string ISO (UTC)
    
    // Opciones para formatear la fecha y hora. Puedes ajustarlas según tus necesidades.
    // 'es-GT' es un ejemplo para Guatemala. Puedes usar el idioma del navegador ('navigator.language')
    // o simplemente omitirlo para usar el formato por defecto del usuario.
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Formato AM/PM
      // timeZoneName: 'short', // Para mostrar "GMT-6" por ejemplo, si es necesario
    };
    
    // Aquí es donde se convierte a la zona horaria local del usuario
    return date.toLocaleString(undefined, options); // 'undefined' usa el idioma por defecto del usuario
  }, []);

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
            case 'water':
            case 'food':
              bannerType = 'warning';
              break;
            default:
              bannerType = 'info';
          }

          // --- MODIFICACIÓN CLAVE AQUÍ ---
          // Formatea el timestamp antes de añadirlo al mensaje del banner
          const formattedTime = formatTimestampToLocal(latestDbNotification.timestamp);
          const bannerMessage = `${latestDbNotification.message} (a las ${formattedTime})`; 
          // Ajusta el mensaje como mejor te parezca. Aquí lo añadimos al final.
          // Por ejemplo: `Actividad detectada (a las 30/05/2025, 11:43:22 p. m.)`


          setTemporaryBanner({
            id: latestDbNotification.id,
            type: bannerType,
            message: bannerMessage, // Usamos el mensaje con la hora formateada
          });
          setLastFetchedNotificationId(latestDbNotification.id); // Guardar el ID de la última notif. mostrada
          setTimeout(() => setTemporaryBanner(null), 5000); // Quitar el banner después de 5 segundos
        }
      }
    } catch (err) {
      console.error('Error fetching new notifications for banner:', err);
    }
  }, [lastFetchedNotificationId, formatTimestampToLocal]); // Asegúrate de incluir formatTimestampToLocal

  useEffect(() => {
    // Iniciar polling solo después de una carga inicial
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