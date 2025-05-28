// src/app/notifications/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NotificationItem, { NotificationItemProps } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/Button';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener las notificaciones desde tu API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications'); // Llama a tu nueva API
      if (!res.ok) {
        throw new Error('Error al cargar notificaciones');
      }
      const data: NotificationItemProps[] = await res.json();
      // Formatea la fecha para mostrarla de forma legible
      const formattedData = data.map(notif => ({
        ...notif,
        timestamp: new Date(notif.timestamp).toLocaleString(), // Ejemplo: "5/27/2025, 8:00:00 PM"
      }));
      setNotifications(formattedData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error al obtener notificaciones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga las notificaciones al iniciar y opcionalmente cada cierto tiempo
  useEffect(() => {
    fetchNotifications();
    // const interval = setInterval(fetchNotifications, 15000); // Actualizar cada 15 segundos
    // return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Maneja el clic en una notificación para marcarla como leída
  const handleNotificationClick = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
      if (!res.ok) throw new Error('Error al marcar como leída');

      // Actualiza el estado local para reflejar el cambio en la UI
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
    }
  };

  // Maneja el marcar todas las notificaciones como leídas
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
        fetchNotifications(); // Recarga para asegurar la consistencia
      }
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  // Maneja el borrar todas las notificaciones del historial
  const handleClearAll = async () => {
    if (!confirm('¿Estás seguro de que quieres borrar todo el historial de notificaciones? Esta acción es irreversible.')) {
      return;
    }
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al borrar el historial');
      setNotifications([]); // Limpia el estado local de inmediato
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