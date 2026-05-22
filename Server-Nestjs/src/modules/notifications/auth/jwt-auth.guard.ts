import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserPrincipal } from '../noti-type/user-principal.type';
import { IS_PUBLIC_KEY } from '../../../common/decorators/is-public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;
    if (typeof authorization !== 'string' || !authorization.trim()) {
      throw new UnauthorizedException('Missing Authorization header.');
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = UserPrincipal>(
    error: Error | null,
    user: TUser | false | null,
  ): TUser {
    if (error) {
      throw error;
    }
    if (!user) {
      throw new UnauthorizedException('Invalid access token.');
    }
    return user;
  }
}
