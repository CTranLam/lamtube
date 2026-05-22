import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserPrincipal } from '../noti-type/user-principal.type';
interface RequestWithUser extends Request {
  user?: UserPrincipal;
}
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UserPrincipal => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user ?? { userId: null, email: null };
  },
);
