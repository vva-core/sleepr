import { Test, TestingModule } from '@nestjs/testing';
import { AUTH_SERVICE_NAME } from '@app/common/types/proto/auth';
import { AUTH_COOKIE, REFRESH_COOKIE } from '@app/common/consts';
import { UnauthorizedException } from '@nestjs/common';
import { firstValueFrom, of, throwError } from 'rxjs';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';

describe('Gateway AuthController', () => {
  let controller: AuthController;
  const authClient = {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };
  const clientGrpc = { getService: jest.fn() };
  const response = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  const requestWith = (cookies: Record<string, string>) =>
    ({ cookies }) as unknown as Request;

  beforeEach(async () => {
    jest.clearAllMocks();
    clientGrpc.getService.mockReturnValue(authClient);
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AUTH_SERVICE_NAME, useValue: clientGrpc }],
    }).compile();

    controller = app.get<AuthController>(AuthController);
    controller.onModuleInit();
  });

  it('login sets both auth cookies and returns the access token', async () => {
    authClient.login.mockReturnValue(
      of({ token: 'access-token', refreshToken: 'refresh-token' }),
    );

    const result = await firstValueFrom(
      controller.login(
        { email: 'test@example.com', password: 'StrongPass1!' },
        response,
      ),
    );

    expect(result).toEqual({ token: 'access-token' });
    expect(response.cookie).toHaveBeenCalledWith(
      AUTH_COOKIE,
      'access-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE,
      'refresh-token',
      expect.objectContaining({ httpOnly: true, path: '/auth' }),
    );
  });

  it('login maps gRPC failures to 401', async () => {
    authClient.login.mockReturnValue(
      throwError(() => new Error('invalid credentials')),
    );

    await expect(
      firstValueFrom(
        controller.login(
          { email: 'test@example.com', password: 'wrong' },
          response,
        ),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(response.cookie).not.toHaveBeenCalled();
  });

  it('refresh rotates the cookies and returns the new access token', async () => {
    authClient.refresh.mockReturnValue(
      of({ token: 'new-access', refreshToken: 'new-refresh' }),
    );

    const result = await firstValueFrom(
      controller.refresh(
        requestWith({ [REFRESH_COOKIE]: 'old-refresh' }),
        response,
      ),
    );

    expect(result).toEqual({ token: 'new-access' });
    expect(authClient.refresh).toHaveBeenCalledWith({
      refreshToken: 'old-refresh',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      AUTH_COOKIE,
      'new-access',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      REFRESH_COOKIE,
      'new-refresh',
      expect.objectContaining({ httpOnly: true, path: '/auth' }),
    );
  });

  it('refresh throws 401 when the refresh cookie is missing', () => {
    expect(() => controller.refresh(requestWith({}), response)).toThrow(
      UnauthorizedException,
    );
    expect(authClient.refresh).not.toHaveBeenCalled();
  });

  it('logout clears both cookies and revokes server-side', async () => {
    authClient.logout.mockReturnValue(of({ success: true }));

    const result = await firstValueFrom(
      controller.logout(requestWith({ [REFRESH_COOKIE]: 'tok' }), response),
    );

    expect(result).toEqual({ success: true });
    expect(authClient.logout).toHaveBeenCalledWith({ refreshToken: 'tok' });
    expect(response.clearCookie).toHaveBeenCalledWith(AUTH_COOKIE);
    expect(response.clearCookie).toHaveBeenCalledWith(REFRESH_COOKIE, {
      path: '/auth',
    });
  });

  it('logout still succeeds when the server-side revoke fails', async () => {
    authClient.logout.mockReturnValue(throwError(() => new Error('expired')));

    const result = await firstValueFrom(
      controller.logout(requestWith({ [REFRESH_COOKIE]: 'tok' }), response),
    );

    expect(result).toEqual({ success: true });
    expect(response.clearCookie).toHaveBeenCalledTimes(2);
  });

  it('logout succeeds without calling auth when no refresh cookie is present', async () => {
    const result = await firstValueFrom(
      controller.logout(requestWith({}), response),
    );

    expect(result).toEqual({ success: true });
    expect(authClient.logout).not.toHaveBeenCalled();
    expect(response.clearCookie).toHaveBeenCalledTimes(2);
  });
});
