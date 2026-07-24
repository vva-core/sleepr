import {
  AUTH_SERVICE_NAME,
  type AuthServiceClient,
  type LoginResponse,
} from '@app/common/types/proto/auth';
import {
  Body,
  Controller,
  Inject,
  OnModuleInit,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Request, Response } from 'express';
import { catchError, map, of } from 'rxjs';
import { AUTH_COOKIE, REFRESH_COOKIE } from '@app/common/consts';
import { LoginDto } from './dto/login.dto';

/**
 * Cookie lifetimes mirror the token TTLs configured in the auth service
 * (`JWT_EXPIRY` / `JWT_REFRESH_EXPIRY`). They are client-side hints only — the
 * auth service is the authority on expiry (JWT `exp` + the stored `expiresAt`).
 */
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15m
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7d

/**
 * The refresh cookie is scoped to `/auth` so it rides only on the refresh and
 * logout calls, not on every authenticated request the way the access cookie
 * (default path `/`) must. `clearCookie` must repeat this path or the browser
 * keeps the cookie.
 */
const REFRESH_COOKIE_PATH = '/auth';

@Controller('auth')
export class AuthController implements OnModuleInit {
  private authClient: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE_NAME) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authClient =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authClient.login(loginDto).pipe(
      map((tokens) => this.setAuthCookies(response, tokens)),
      catchError(() => {
        throw new UnauthorizedException();
      }),
    );
  }

  @Post('refresh')
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken: string | undefined = request.cookies?.[REFRESH_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    return this.authClient.refresh({ refreshToken }).pipe(
      map((tokens) => this.setAuthCookies(response, tokens)),
      catchError(() => {
        throw new UnauthorizedException();
      }),
    );
  }

  @Post('logout')
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken: string | undefined = request.cookies?.[REFRESH_COOKIE];

    response.clearCookie(AUTH_COOKIE);
    response.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });

    if (!refreshToken) {
      return of({ success: true });
    }

    return this.authClient
      .logout({ refreshToken })
      .pipe(catchError(() => of({ success: true })));
  }

  private setAuthCookies(
    response: Response,
    { token, refreshToken }: LoginResponse,
  ) {
    response.cookie(AUTH_COOKIE, token, {
      httpOnly: true,
      maxAge: ACCESS_COOKIE_MAX_AGE,
    });
    response.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      path: REFRESH_COOKIE_PATH,
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });

    return { token };
  }
}
