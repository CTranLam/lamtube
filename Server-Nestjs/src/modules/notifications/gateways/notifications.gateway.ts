import { ConfigService } from '@nestjs/config';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtPayload, verify } from 'jsonwebtoken';

interface SocketJwtPayload extends JwtPayload {
  userId?: number | string;
  userName?: string;
  sub?: string;
}

@Injectable()
@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: true, credentials: true },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly principalSockets = new Map<string, Set<string>>();
  private readonly socketPrincipals = new Map<string, Set<string>>();
  private readonly jwtSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.getOrThrow<string>('auth.jwtSecret');
  }

  handleConnection(client: Socket): void {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    const claims = this.verifyAccessToken(token);
    if (!claims) {
      client.disconnect(true);
      return;
    }

    const principals = this.extractPrincipals(claims);
    if (principals.length === 0) {
      client.disconnect(true);
      return;
    }

    this.bindSocketToPrincipals(client.id, principals);
    console.log(
      `Socket connected: socketId=${client.id} principals=${principals.join(',')}`,
    );
  }

  handleDisconnect(client: Socket): void {
    this.unbindSocket(client.id);
    console.log(`Socket disconnected: socketId=${client.id}`);
  }

  emitToPrincipal(principal: string, event: string, payload: unknown): number {
    const sockets = this.principalSockets.get(principal);
    if (!sockets || sockets.size === 0) {
      return 0;
    }

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit(event, payload);
    });

    return sockets.size;
  }

  private bindSocketToPrincipals(socketId: string, principals: string[]): void {
    const existing = this.socketPrincipals.get(socketId);
    if (existing) {
      existing.forEach((principal) =>
        this.removeSocketFromPrincipal(principal, socketId),
      );
      this.socketPrincipals.delete(socketId);
    }

    const principalSet = new Set<string>();
    principals.forEach((principal) => {
      const sockets = this.principalSockets.get(principal) ?? new Set<string>();
      sockets.add(socketId);
      this.principalSockets.set(principal, sockets);
      principalSet.add(principal);
    });

    this.socketPrincipals.set(socketId, principalSet);
  }

  private unbindSocket(socketId: string): void {
    const principals = this.socketPrincipals.get(socketId);
    if (!principals) {
      return;
    }

    principals.forEach((principal) =>
      this.removeSocketFromPrincipal(principal, socketId),
    );
    this.socketPrincipals.delete(socketId);
  }

  private removeSocketFromPrincipal(principal: string, socketId: string): void {
    const sockets = this.principalSockets.get(principal);
    if (!sockets) {
      return;
    }

    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.principalSockets.delete(principal);
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth as Record<string, unknown> | undefined;
    const fromAuth = auth?.token;
    if (typeof fromAuth === 'string' && fromAuth.trim().length > 0) {
      return this.normalizeBearer(fromAuth);
    }

    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.trim().length > 0) {
      return this.normalizeBearer(authHeader);
    }

    return null;
  }

  private normalizeBearer(value: string): string {
    return value.startsWith('Bearer ') ? value.slice(7).trim() : value.trim();
  }

  private verifyAccessToken(token: string): SocketJwtPayload | null {
    try {
      const normalizedSecret = this.jwtSecret;
      const verifyCandidates: Array<string | Buffer> = [normalizedSecret];

      // Spring stacks often sign with base64-decoded secret bytes.
      if (this.looksLikeBase64(normalizedSecret)) {
        verifyCandidates.push(Buffer.from(normalizedSecret, 'base64'));
      }

      for (const candidate of verifyCandidates) {
        try {
          const decoded: unknown = verify(token, candidate);
          if (typeof decoded === 'object' && decoded !== null) {
            return decoded;
          }
        } catch {
          // Try next candidate.
        }
      }

      return null;
    } catch (error) {
      console.error('Invalid websocket JWT', error);
      return null;
    }
  }

  private looksLikeBase64(value: string): boolean {
    if (!value || value.length % 4 !== 0) {
      return false;
    }
    return /^[A-Za-z0-9+/=]+$/.test(value);
  }

  private extractPrincipals(claims: SocketJwtPayload): string[] {
    const principals: string[] = [];

    const rawUserId = claims.userId;
    const userId =
      typeof rawUserId === 'number' ? rawUserId : Number(rawUserId);
    if (Number.isInteger(userId) && userId > 0) {
      principals.push(`uid:${userId}`);
    }

    const email = this.toEmail(claims.userName) ?? this.toEmail(claims.sub);
    if (email) {
      principals.push(`email:${email}`);
    }

    return principals;
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
