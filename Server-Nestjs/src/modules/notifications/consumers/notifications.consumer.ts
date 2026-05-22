import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import {
  NOTIFICATION_ROUTING_KEYS,
  NotificationRoutingKey,
} from '../constants/notification-routing.constants';
import { NotificationEventPayload } from '../dto/notification-event.payload';
import { NotificationsHandler } from '../application/notifications.handler';
import { NotificationsRealtimeService } from '../domain/notifications-realtime.service';

@Injectable()
export class NotificationsConsumer implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsHandler: NotificationsHandler,
    private readonly notificationsRealtimeService: NotificationsRealtimeService,
  ) {}

  // Thiết lập pipeline RabbitMQ khi module khởi tạo
  async onModuleInit(): Promise<void> {
    const rabbitUrl = this.configService.getOrThrow<string>('rabbitmq.url');
    const exchange = this.configService.getOrThrow<string>('rabbitmq.exchange');
    const queue = this.configService.getOrThrow<string>('rabbitmq.queue');
    const deadLetterQueue = this.configService.getOrThrow<string>(
      'rabbitmq.deadLetterQueue',
    );

    // Kết nối đến RabbitMQ và thiết lập exchange, queue, binding
    this.connection = await amqp.connect(rabbitUrl);
    if (!this.connection) {
      throw new Error('RabbitMQ connection not initialized');
    }
    this.channel = await this.connection.createChannel();

    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': deadLetterQueue,
      },
    });

    for (const routingKey of NOTIFICATION_ROUTING_KEYS) {
      await this.channel.bindQueue(queue, exchange, routingKey);
    }

    await this.channel.consume(queue, (msg) => {
      void this.handleMessage(msg);
    });

    console.log(
      `Rabbit consumer started: exchange=${exchange}, queue=${queue}, keys=${NOTIFICATION_ROUTING_KEYS.join(', ')}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  private async handleMessage(message: ConsumeMessage | null): Promise<void> {
    if (!message || !this.channel) {
      return;
    }

    try {
      const raw = message.content.toString('utf-8');
      const payload = JSON.parse(raw) as NotificationEventPayload;
      const routingKey = message.fields.routingKey as NotificationRoutingKey;

      const saved = await this.notificationsHandler.handleIncomingEvent(
        routingKey,
        payload,
      );

      console.log(
        `[SAVED] key=${routingKey} eventId=${saved.eventId} mongoId=${saved._id.toString()} actor=${saved.actorId ?? 'n/a'} target=${saved.targetUserId ?? 'n/a'} video=${saved.videoId ?? 'n/a'} comment=${saved.commentId ?? 'n/a'} channel=${saved.channelId ?? 'n/a'}`,
      );
      this.notificationsRealtimeService.emitNewNotification(saved);
      console.debug(`[PAYLOAD] ${raw}`);

      this.channel.ack(message);
    } catch (error) {
      console.error('Failed to process RabbitMQ message', error as Error);
      this.channel.nack(message, false, false);
    }
  }
}
