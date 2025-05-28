import React from 'react';
import { AlertCircle, Drumstick, Droplet, Footprints, Info } from 'lucide-react';

export type NotificationType = 'food' | 'water' | 'activity' | 'alert' | 'info';

export interface NotificationItemProps {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string; // O Date si prefieres manejarlo así y formatearlo aquí
  isRead: boolean;
  onClick?: (id: string) => void; // Para marcar como leída, por ejemplo
}

const NotificationIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const iconProps = { size: 24, className: "mr-3 flex-shrink-0" };
  switch (type) {
    case 'food':
      return <Drumstick {...iconProps} className={`${iconProps.className} text-amber-500`} />;
    case 'water':
      return <Droplet {...iconProps} className={`${iconProps.className} text-sky-500`} />;
    case 'activity':
      return <Footprints {...iconProps} className={`${iconProps.className} text-orange-500`} />;
    case 'alert':
      return <AlertCircle {...iconProps} className={`${iconProps.className} text-red-500`} />;
    case 'info':
    default:
      return <Info {...iconProps} className={`${iconProps.className} text-blue-500`} />;
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  message,
  timestamp,
  isRead,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick && onClick(id)}
      className={`p-4 border-b border-border last:border-b-0 flex items-start space-x-3 hover:bg-muted/50 transition-colors cursor-pointer ${
        isRead ? 'opacity-70' : 'bg-muted/20 dark:bg-muted/10'
      }`}
    >
      <NotificationIcon type={type} />
      <div className="flex-grow">
        <p className={`text-sm font-medium ${isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
          {message}
        </p>
        <p className={`text-xs mt-1 ${isRead ? 'text-muted-foreground/80' : 'text-muted-foreground'}`}>
          {timestamp}
        </p>
      </div>
      {!isRead && (
        <div className="flex-shrink-0 ml-auto self-center">
          <span className="h-2.5 w-2.5 bg-primary rounded-full"></span>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;