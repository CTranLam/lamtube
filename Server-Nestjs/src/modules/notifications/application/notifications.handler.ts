import { Injectable } from '@nestjs/common';
import { NotificationEventPayload } from '../dto/notification-event.payload';
import { NotificationEventDocument } from '../schemas/notification-event.schema';
import { NotificationsService } from '../domain/notifications.service';

@Injectable()
export class NotificationsHandler {
  constructor(private readonly notificationsService: NotificationsService) {}

  async handleIncomingEvent(
    routingKey: string,
    payload: NotificationEventPayload,
  ): Promise<NotificationEventDocument> {
    return this.notificationsService.processIncomingEvent(routingKey, payload);
  }
}
