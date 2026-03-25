import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { User } from 'apps/auth/src/user/entities/user.entity';
import { catchError, map, Observable, of } from 'rxjs';
import { AUTH_SERVICE } from '../consts';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly logger: LoggerService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const jwt = request.cookies['Authentication'];

    if (!jwt) {
      return false;
    }

    return this.authClient
      .send('authenticate', {
        Authentication: jwt,
      })
      .pipe(
        map((user: User) => {
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
