import { Injectable } from '@nestjs/common';
import { NotificationEventPayload } from '../dto/notification-event.payload';
import { NotificationEventDocument } from '../schemas/notification-event.schema';
import { NotificationsRepository } from '../infrastructure/notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async processIncomingEvent(
    routingKey: string,
    payload: NotificationEventPayload,
  ): Promise<NotificationEventDocument> {
    return this.notificationsRepository.saveEvent(routingKey, payload);
  }

  async getByPrincipal(params: {
    userId?: number | null;
    email?: string | null;
    limit?: number;
  }): Promise<NotificationEventDocument[]> {
    return this.notificationsRepository.findByPrincipal(params);
  }

  async markAllAsReadByPrincipal(params: {
    userId?: number | null;
    email?: string | null;
  }): Promise<number> {
    return this.notificationsRepository.markAllAsReadByPrincipal(params);
  }

  async markOneAsReadByPrincipal(params: {
    userId?: number | null;
    email?: string | null;
    eventId: string;
  }): Promise<boolean> {
    return this.notificationsRepository.markOneAsReadByPrincipal(params);
  }
}
