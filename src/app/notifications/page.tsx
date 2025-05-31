'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NotificationItem, { NotificationItemProps } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/Button';
import { Bell, Loader2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItemProps[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper para formatear el timestamp a la hora local del usuario
  // Reutilizamos la lógica del NotificationContext
  const formatTimestampToLocal = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Formato AM/PM
    };
    return date.toLocaleString(undefined, options);
  }, []);

  const fetchNotifications = useCallback(async () => {
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
      
      // --- MODIFICACIÓN CLAVE AQUÍ ---
      // NO formatees el timestamp aquí. Pásalo tal cual al NotificationItem.
      // El NotificationItem será responsable de mostrarlo correctamente.
      setNotifications(data); 

    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setInitialLoad(false);
      setIsUpdating(false);
    }
  }, [initialLoad]);

  useEffect(() => {
    fetchNotifications(); // Carga inicial
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

  if (initialLoad) {
    return <p className="text-center py-10">Cargando notificaciones...</p>;
  }

  if (error) {
    return <p className="text-center py-10 text-red-500">Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4 pb-20">
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
              // --- MODIFICACIÓN CLAVE AQUÍ ---
              // Pasa el `timestamp` original. El NotificationItem se encargará del formateo.
              {...notification} 
              // Si NotificationItem espera un timestamp ya formateado,
              // entonces lo formatearías aquí y crearías un nuevo prop, por ejemplo:
              // formattedTimestamp: formatTimestampToLocal(notification.timestamp),
              // y NotificationItem usaría `props.formattedTimestamp`
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