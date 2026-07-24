import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { catchError, map, Observable, of } from 'rxjs';

import { AUTH_COOKIE } from '../consts/cookies';
import { LoggerService } from '../logger/logger.service';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  User,
} from '../types/proto/auth';

@Injectable()
export class JwtAuthGuard implements CanActivate, OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(
    @Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.authClient = this.client.getService(AUTH_SERVICE_NAME);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const jwt = request.cookies[AUTH_COOKIE];

    if (!jwt) {
      this.logger.warn('No JWT found');
      return false;
    }

    return this.authClient
      .authenticate({
        token: jwt,
      })
      .pipe(
        map((user: User) => {
          this.logger.log(`Authenticated user: ${user.id}`);
          request.user = user;
          return true;
        }),
        catchError((err) => {
          this.logger.error(`Authentication failed: ${err.message}`);
          return of(false);
        }),
      );
  }
}
