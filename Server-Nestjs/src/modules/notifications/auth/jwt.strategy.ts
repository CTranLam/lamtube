import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenClaims } from '../noti-type/access-token-claims.type';
import { UserPrincipal } from '../noti-type/user-principal.type';
import { NotificationsAuthService } from './notifications-auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly notificationsAuthService: NotificationsAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(
        configService.getOrThrow<string>('auth.jwtSecret'),
        'base64',
      ),
    });
  }

  validate(payload: AccessTokenClaims): UserPrincipal {
    const principal = this.notificationsAuthService.extractPrincipal(payload);

    if (!principal.userId && !principal.email) {
      throw new UnauthorizedException('Invalid token principal.');
    }

    return principal;
  }
}
