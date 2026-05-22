import { Injectable } from '@nestjs/common';
import { NotificationEventDocument } from '../schemas/notification-event.schema';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class NotificationsRealtimeService {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  emitNewNotification(notification: NotificationEventDocument): void {
    const principals = this.buildTargetPrincipals(notification);
    if (principals.length === 0) {
      return;
    }

    let deliveredTotal = 0;
    principals.forEach((principal) => {
      deliveredTotal += this.notificationsGateway.emitToPrincipal(
        principal,
        'notification:new',
        notification,
      );
    });

    console.log(
      `Realtime emit notification:new principals=${principals.join(',')} deliveredSockets=${deliveredTotal}`,
    );
  }

  private buildTargetPrincipals(
    notification: NotificationEventDocument,
  ): string[] {
    const principals: string[] = [];

    if (notification.targetUserId && notification.targetUserId > 0) {
      principals.push(`uid:${notification.targetUserId}`);
    }

    const email = notification.targetUserEmail?.trim().toLowerCase();
    if (email) {
      principals.push(`email:${email}`);
    }

    return [...new Set(principals)];
  }
}
