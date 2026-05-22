import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { NotificationsConsumer } from './consumers/notifications.consumer';
import {
  NotificationEvent,
  NotificationEventSchema,
} from './schemas/notification-event.schema';
import { NotificationsRepository } from './infrastructure/notifications.repository';
import { NotificationsService } from './domain/notifications.service';
import { NotificationsHandler } from './application/notifications.handler';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsRealtimeService } from './domain/notifications-realtime.service';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsAuthService } from './auth/notifications-auth.service';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('database.mongodbUri'),
      }),
    }),
    MongooseModule.forFeature([
      { name: NotificationEvent.name, schema: NotificationEventSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsConsumer,
    NotificationsRepository,
    NotificationsService,
    NotificationsHandler,
    NotificationsGateway,
    NotificationsRealtimeService,
    NotificationsAuthService,
    JwtStrategy,
  ],
  exports: [NotificationsAuthService],
})
export class NotificationsModule {}
