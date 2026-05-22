import { JwtPayload } from 'jsonwebtoken';
export interface AccessTokenClaims extends JwtPayload {
  userId?: number | string;
  userName?: string;
  sub?: string;
}
