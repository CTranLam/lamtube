import { Injectable } from '@nestjs/common';
import { AccessTokenClaims } from '../noti-type/access-token-claims.type';
import { UserPrincipal } from '../noti-type/user-principal.type';

@Injectable()
export class NotificationsAuthService {
  extractPrincipal(claims: AccessTokenClaims): UserPrincipal {
    const rawUserId = claims.userId;
    const parsedUserId =
      typeof rawUserId === 'number' ? rawUserId : Number(rawUserId);
    const userId =
      Number.isInteger(parsedUserId) && parsedUserId > 0 ? parsedUserId : null;
    const email = this.toEmail(claims.userName) ?? this.toEmail(claims.sub);
    return { userId, email };
  }
  private toEmail(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const email = value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return null;
    }
    return email;
  }
}
