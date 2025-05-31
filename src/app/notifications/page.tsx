'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NotificationItem, { NotificationItemProps } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/Button';
import { Bell, Loader2, Info, CheckCircle, AlertTriangle } from 'lucide-react'; // Añadimos más iconos

// Nuevo: Tipo para el banner de notificación temporal
interface TemporaryBannerNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItemProps[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temporaryBanner, setTemporaryBanner] = useState<TemporaryBannerNotification | null>(null);

  const fetchNotifications = useCallback(async () => {
    // Si no es la carga inicial, mostramos un spinner más discreto
    if (!initialLoad) {
      setIsUpdating(true);
    }
    setError(null);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) {
        throw new Error('Error al cargar notificaciones');
      }
      const data: NotificationItemProps[] = await res.json();

      // Detectar nuevas notificaciones para el banner temporal
      const newNotifications = data.filter(
        (newNotif) => !notifications.some((existingNotif) => existingNotif.id === newNotif.id)
      );

      // Si hay nuevas notificaciones y no es la carga inicial
      if (newNotifications.length > 0 && !initialLoad) {
        // Tomar la primera nueva notificación y mostrarla en el banner
        const latestNew = newNotifications[0];
        let bannerType: 'info' | 'success' | 'warning' | 'error' = 'info';
        switch (latestNew.type) {
          case 'activity':
            bannerType = 'success'; // Actividad es positiva
            break;
          case 'alert':
            bannerType = 'warning'; // Alertas son advertencias
            break;
          // Puedes añadir más casos según tus NotificationType
          default:
            bannerType = 'info';
        }
        setTemporaryBanner({
          id: latestNew.id,
          type: bannerType,
          message: latestNew.message,
        });
        // Desaparecer el banner después de unos segundos
        setTimeout(() => setTemporaryBanner(null), 5000);
      }

      const formattedData = data.map(notif => ({
        ...notif,
        timestamp: new Date(notif.timestamp).toLocaleString(),
      }));
      setNotifications(formattedData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setInitialLoad(false);
      setIsUpdating(false);
    }
  }, [initialLoad, notifications]); // Añadimos 'notifications' a las dependencias para detectar nuevas

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000); // Polling cada 3 segundos
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleNotificationClick = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
      if (!res.ok) throw new Error('Error al marcar como leída');
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotificationIds = notifications
        .filter(n => !n.isRead)
        .map(n => n.id);

      if (unreadNotificationIds.length > 0) {
        const res = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: unreadNotificationIds, isRead: true }),
        });
        if (!res.ok) throw new Error('Error al marcar todas como leídas');
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('¿Estás seguro de que quieres borrar todo el historial de notificaciones? Esta acción es irreversible.')) {
      return;
    }
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al borrar el historial');
      setNotifications([]);
    } catch (err) {
      console.error('Error al borrar el historial:', err);
      alert('Hubo un error al borrar las notificaciones.');
    }
  };

  // Helper para el icono del banner
  const getBannerIcon = (type: TemporaryBannerNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="mr-2" />;
      case 'warning': return <AlertTriangle size={20} className="mr-2" />;
      case 'error': return <AlertTriangle size={20} className="mr-2" />; // O un icono de error diferente
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


  if (initialLoad) {
    return <p className="text-center py-10">Cargando notificaciones...</p>;
  }

  if (error) {
    return <p className="text-center py-10 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      {/* Banner de notificación temporal */}
      {temporaryBanner && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 w-11/12 max-w-sm p-3 rounded-lg shadow-lg flex items-center z-50 transition-all duration-300 ${getBannerColorClass(temporaryBanner.type)}`}>
          {getBannerIcon(temporaryBanner.type)}
          <p className="text-sm font-medium">{temporaryBanner.message}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center mb-6">
        <h1 className="text-2xl font-bold mr-4 mb-3">Notificaciones</h1>
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="mb-3">
            Marcar todas como leídas
          </Button>
        )}
        {isUpdating && (
          <Loader2 className="animate-spin text-muted-foreground ml-4 mb-3" size={20} />
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10">
          <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tienes notificaciones nuevas.</p>
          <p className="text-sm text-muted-foreground">¡Todo tranquilo por aquí!</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      )}
      {notifications.length > 0 && (
        <div className="mt-6 flex justify-end">
            <Button variant="destructive" size="sm" onClick={handleClearAll}>
              Borrar historial
            </Button>
        </div>
      )}
    </div>
  );
}