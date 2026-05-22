import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import type { UserPrincipal } from '../noti-type/user-principal.type';
import { CurrentUser } from '../decorators/current-user.decorator';
import { NotificationsService } from '../domain/notifications.service';
import { ListNotificationsDto } from '../dto/list-notifications.dto';
import type { ApiResponse } from '../../../common/types/api-response.type';
import { ok } from '../../../common/utils/api-response.util';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @CurrentUser() user: UserPrincipal,
    @Query() query: ListNotificationsDto,
  ): Promise<ApiResponse<unknown>> {
    const notifications = await this.notificationsService.getByPrincipal({
      userId: user.userId,
      email: user.email,
      limit: this.toLimit(query.limit),
    });
    return ok(notifications, 'Notifications fetched successfully.');
  }

  @Patch('read-all')
  async markAllRead(
    @CurrentUser() user: UserPrincipal,
  ): Promise<ApiResponse<{ updatedCount: number }>> {
    const updated = await this.notificationsService.markAllAsReadByPrincipal({
      userId: user.userId,
      email: user.email,
    });
    return ok({ updatedCount: updated }, 'Notifications marked as read.');
  }

  @Patch(':eventId/read')
  async markOneRead(
    @CurrentUser() user: UserPrincipal,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<
    ApiResponse<{
      updated: boolean;
    }>
  > {
    const updated = await this.notificationsService.markOneAsReadByPrincipal({
      userId: user.userId,
      email: user.email,
      eventId,
    });
    return ok({ updated }, 'Notification marked as read.');
  }

  private toLimit(rawLimit: string | undefined): number | undefined {
    if (!rawLimit?.trim()) {
      return undefined;
    }
    const limit = Number(rawLimit);
    if (!Number.isFinite(limit)) {
      return undefined;
    }
    return limit;
  }
}
