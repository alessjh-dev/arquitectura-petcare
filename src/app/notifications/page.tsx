
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NotificationItem, { NotificationItemProps } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/Button';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) {
        throw new Error('Error al cargar notificaciones');
      }
      const data: NotificationItemProps[] = await res.json();
      const formattedData = data.map(notif => ({
        ...notif,
        timestamp: new Date(notif.timestamp).toLocaleString(),
      }));
      setNotifications(formattedData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(); 
    const interval = setInterval(fetchNotifications, 3000);
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

  if (loading) {
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