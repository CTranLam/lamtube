import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationEventPayload } from '../dto/notification-event.payload';
import {
  NotificationEvent,
  NotificationEventDocument,
} from '../schemas/notification-event.schema';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectModel(NotificationEvent.name)
    private readonly notificationEventModel: Model<NotificationEventDocument>,
  ) {}

  async saveEvent(
    routingKey: string,
    payload: NotificationEventPayload,
  ): Promise<NotificationEventDocument> {
    const eventId = payload.eventId ?? randomUUID();
    const occurredAt = payload.occurredAt;
    if (occurredAt) {
      const date = new Date(occurredAt);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid occurredAt date format.');
      }
    } else {
      payload.occurredAt = new Date().toISOString();
    }

    return this.notificationEventModel
      .findOneAndUpdate(
        { eventId },
        {
          $setOnInsert: {
            eventId,
            eventType: payload.eventType ?? routingKey,
            routingKey,
            occurredAt,
            actorId: payload.actorId,
            actorEmail: payload.actorEmail,
            targetUserId: payload.targetUserId,
            targetUserEmail: payload.targetUserEmail,
            videoId: payload.videoId,
            reactionType: payload.reactionType,
            commentId: payload.commentId,
            parentCommentId: payload.parentCommentId,
            commentContent: payload.commentContent,
            channelId: payload.channelId,
            isRead: false,
            readAt: null,
            rawPayload: payload as unknown as Record<string, unknown>,
          },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async findByPrincipal(params: {
    userId?: number | null;
    email?: string | null;
    limit?: number;
  }): Promise<NotificationEventDocument[]> {
    const { userId, email } = params;
    const normalizedEmail = email?.trim().toLowerCase() ?? '';
    const queryOr: Array<Record<string, unknown>> = [];

    if (userId && userId > 0) {
      queryOr.push({ targetUserId: userId });
    }
    if (normalizedEmail) {
      queryOr.push({ targetUserEmail: normalizedEmail });
    }
    if (queryOr.length === 0) {
      return [];
    }

    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    return this.notificationEventModel
      .find({ $or: queryOr })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markAllAsReadByPrincipal(params: {
    userId?: number | null;
    email?: string | null;
  }): Promise<number> {
    const { userId, email } = params;
    const normalizedEmail = email?.trim().toLowerCase() ?? '';
    const queryOr: Array<Record<string, unknown>> = [];

    if (userId && userId > 0) {
      queryOr.push({ targetUserId: userId });
    }
    if (normalizedEmail) {
      queryOr.push({ targetUserEmail: normalizedEmail });
    }
    if (queryOr.length === 0) {
      return 0;
    }

    const result = await this.notificationEventModel
      .updateMany(
        { $or: queryOr, isRead: false },
        { $set: { isRead: true, readAt: new Date() } },
      )
      .exec();

    return result.modifiedCount ?? 0;
  }

  async markOneAsReadByPrincipal(params: {
    userId?: number | null;
    email?: string | null;
    eventId: string;
  }): Promise<boolean> {
    const { userId, email, eventId } = params;
    const normalizedEmail = email?.trim().toLowerCase() ?? '';
    const queryOr: Array<Record<string, unknown>> = [];

    if (userId && userId > 0) {
      queryOr.push({ targetUserId: userId });
    }
    if (normalizedEmail) {
      queryOr.push({ targetUserEmail: normalizedEmail });
    }
    if (queryOr.length === 0) {
      return false;
    }

    const result = await this.notificationEventModel
      .updateOne(
        {
          eventId,
          isRead: false,
          $or: queryOr,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        },
      )
      .exec();

    return (result.modifiedCount ?? 0) > 0;
  }
}
