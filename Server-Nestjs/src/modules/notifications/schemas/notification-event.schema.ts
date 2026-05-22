import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationEventDocument = HydratedDocument<NotificationEvent>;

@Schema({ collection: 'notification_events', timestamps: true })
export class NotificationEvent {
  @Prop({ required: true, unique: true })
  eventId!: string;

  @Prop({ required: true })
  eventType!: string;

  @Prop({ required: true })
  routingKey!: string;

  @Prop()
  occurredAt?: Date;

  @Prop()
  actorId?: number;

  @Prop()
  actorEmail?: string;

  @Prop()
  targetUserId?: number;

  @Prop()
  targetUserEmail?: string;

  @Prop()
  videoId?: number;

  @Prop()
  reactionType?: string;

  @Prop()
  commentId?: number;

  @Prop()
  parentCommentId?: number;

  @Prop()
  commentContent?: string;

  @Prop()
  channelId?: number;

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({ type: Date, default: null })
  readAt?: Date | null;

  @Prop({ type: Object })
  rawPayload?: Record<string, unknown>;
}

export const NotificationEventSchema =
  SchemaFactory.createForClass(NotificationEvent);
